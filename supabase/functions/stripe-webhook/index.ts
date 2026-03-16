import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const PRICE_TO_PLAN: Record<string, string> = {
  "price_1T8hm0F6s5PSwitkpD9F97lO": "starter",
  "price_1T8hiXF6s5PSwitkQraXZXeN": "pro",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

async function findUserByEmail(supabase: ReturnType<typeof createClient>, email: string) {
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  return data?.users?.find(u => u.email === email);
}

async function updateUserPlan(supabase: ReturnType<typeof createClient>, userId: string, plan: string, extra?: { subscription_end?: string; stripe_customer_id?: string }) {
  const update: Record<string, any> = { plan };
  if (extra?.subscription_end) update.subscription_end = extra.subscription_end;
  if (extra?.stripe_customer_id) update.stripe_customer_id = extra.stripe_customer_id;
  
  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("user_id", userId);

  if (error) {
    logStep("ERROR updating plan", { userId, plan, error: error.message });
  } else {
    logStep("Plan updated successfully", { userId, plan, ...extra });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
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
    logStep("Signature verification failed", { message });
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

        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !("email" in customer) || !customer.email) {
          logStep("Customer not found or deleted", { customerId });
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || "free";
        const status = subscription.status;

        logStep("Subscription event", { email: customer.email, priceId, plan, status });

        const user = await findUserByEmail(supabase, customer.email);
        if (!user) {
          logStep("User not found", { email: customer.email });
          break;
        }

        if (status === "active") {
          // Payment OK — grant the plan
          const subEnd = new Date(subscription.current_period_end * 1000).toISOString();
          await updateUserPlan(supabase, user.id, plan, { subscription_end: subEnd, stripe_customer_id: customerId });

          // Credit referrer commission if applicable
          const { data: referral } = await supabase
            .from("referrals")
            .select("*")
            .eq("referred_id", user.id)
            .maybeSingle();

          if (referral && referral.status !== "converted") {
            const amount = subscription.items.data[0]?.price?.unit_amount || 0;
            const commission = Math.round(amount * (referral.commission_rate / 100));
            await supabase
              .from("referrals")
              .update({
                status: "converted",
                converted_at: new Date().toISOString(),
                total_earned: (referral.total_earned || 0) + commission,
              })
              .eq("id", referral.id);
            logStep("Referral commission credited", { referralId: referral.id, commission });
          }
        } else if (status === "unpaid" || status === "canceled" || status === "incomplete_expired") {
          // All retries failed or subscription ended — downgrade
          logStep("Downgrading user due to status", { userId: user.id, status });
          await updateUserPlan(supabase, user.id, "free", { subscription_end: undefined, stripe_customer_id: customerId });
        }
        // "past_due" → grace period, Stripe retries payment (configurable in Stripe Dashboard)
        // "trialing", "incomplete" → wait for resolution
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !("email" in customer) || !customer.email) {
          logStep("Customer not found or deleted", { customerId });
          break;
        }

        logStep("Subscription cancelled", { email: customer.email });

        const user = await findUserByEmail(supabase, customer.email);
        if (user) {
          await updateUserPlan(supabase, user.id, "free", { subscription_end: undefined, stripe_customer_id: customerId });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", {
          sessionId: session.id,
          email: session.customer_email,
        });
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
