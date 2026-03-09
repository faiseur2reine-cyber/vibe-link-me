import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Map price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1T8hm0F6s5PSwitkpD9F97lO": "starter", // 19,99€/month
  "price_1T8hiXF6s5PSwitkQraXZXeN": "pro",     // 115€/year
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey) {
    logStep("ERROR", { message: "STRIPE_SECRET_KEY is not set" });
    return new Response(JSON.stringify({ error: "Configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!webhookSecret) {
    logStep("ERROR", { message: "STRIPE_WEBHOOK_SECRET is not set" });
    return new Response(JSON.stringify({ error: "Configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    logStep("ERROR", { message: "No stripe-signature header" });
    return new Response(JSON.stringify({ error: "No signature" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  let event: Stripe.Event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event received", { type: event.type, id: event.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logStep("ERROR - Signature verification failed", { message });
    return new Response(JSON.stringify({ error: `Webhook Error: ${message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !("email" in customer) || !customer.email) {
          logStep("Customer not found or deleted", { customerId });
          break;
        }

        const email = customer.email;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || "free";
        const status = subscription.status;

        logStep("Subscription update", { email, priceId, plan, status });

        // Only update plan if subscription is active
        if (status === "active") {
          const { error } = await supabase
            .from("profiles")
            .update({ plan })
            .eq("user_id", (
              await supabase
                .from("profiles")
                .select("user_id")
                .ilike("user_id", `%`)
                .limit(1)
                .then(async () => {
                  // Get user by email from auth
                  const { data: users } = await supabase.auth.admin.listUsers();
                  const user = users?.users?.find(u => u.email === email);
                  return user?.id;
                })
            ));

          // Alternative: Use RPC or direct query
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const targetUser = authUsers?.users?.find(u => u.email === email);
          
          if (targetUser) {
            await supabase
              .from("profiles")
              .update({ plan })
              .eq("user_id", targetUser.id);
            logStep("Plan updated", { userId: targetUser.id, plan });
          } else {
            logStep("User not found for email", { email });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !("email" in customer) || !customer.email) {
          logStep("Customer not found or deleted", { customerId });
          break;
        }

        const email = customer.email;
        logStep("Subscription cancelled", { email });

        // Find user and reset to free plan
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const targetUser = authUsers?.users?.find(u => u.email === email);

        if (targetUser) {
          await supabase
            .from("profiles")
            .update({ plan: "free" })
            .eq("user_id", targetUser.id);
          logStep("Plan reset to free", { userId: targetUser.id });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { 
          sessionId: session.id, 
          customerEmail: session.customer_email 
        });
        // Plan update is handled by subscription events
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing event", { message, eventType: event.type });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
