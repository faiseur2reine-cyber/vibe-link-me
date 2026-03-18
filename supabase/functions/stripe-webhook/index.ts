import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

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

async function updateUserPlan(supabase: ReturnType<typeof createClient>, userId: string, plan: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("user_id", userId);

  if (error) {
    logStep("ERROR updating plan", { userId, plan, error: error.message });
  } else {
    logStep("Plan updated successfully", { userId, plan });
  }
}

async function processAffiliateCommission(
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
  userId: string,
  amountPaid: number, // in cents
  currency: string
) {
  // Find referral where this user is the referred
  const { data: referral } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_id", userId)
    .maybeSingle();

  if (!referral) {
    logStep("No referral found for user", { userId });
    return;
  }

  const commissionRate = Number(referral.commission_rate) / 100;
  const commissionAmount = Math.round(amountPaid * commissionRate);

  if (commissionAmount < 100) {
    logStep("Commission too small to transfer", { commissionAmount });
    return;
  }

  // Get referrer's Connect account
  const { data: referrerProfile } = await supabase
    .from("profiles")
    .select("stripe_connect_account_id")
    .eq("user_id", referral.referrer_id)
    .single();

  const connectId = referrerProfile?.stripe_connect_account_id;
  if (!connectId) {
    logStep("Referrer has no Connect account, accumulating commission", { referrerId: referral.referrer_id });
    // Still track the earned amount
    const newTotal = Number(referral.total_earned) + (commissionAmount / 100);
    await supabase
      .from("referrals")
      .update({
        total_earned: newTotal,
        status: "converted",
        converted_at: referral.converted_at || new Date().toISOString(),
      })
      .eq("id", referral.id);
    return;
  }

  try {
    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: commissionAmount,
      currency: currency || "eur",
      destination: connectId,
      description: `Commission affiliation MyTaptap - ${commissionRate * 100}%`,
      metadata: {
        referral_id: referral.id,
        referrer_id: referral.referrer_id,
        referred_id: userId,
      },
    });

    logStep("Transfer created", { transferId: transfer.id, amount: commissionAmount });

    // Update referral earnings
    const newTotal = Number(referral.total_earned) + (commissionAmount / 100);
    await supabase
      .from("referrals")
      .update({
        total_earned: newTotal,
        status: "converted",
        converted_at: referral.converted_at || new Date().toISOString(),
      })
      .eq("id", referral.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Transfer failed", { error: msg, connectId });
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
          await updateUserPlan(supabase, user.id, plan);

          // Process affiliate commission on invoice payment
          const latestInvoiceId = subscription.latest_invoice;
          if (latestInvoiceId && typeof latestInvoiceId === "string") {
            try {
              const invoice = await stripe.invoices.retrieve(latestInvoiceId);
              if (invoice.amount_paid > 0) {
                await processAffiliateCommission(
                  stripe,
                  supabase,
                  user.id,
                  invoice.amount_paid,
                  invoice.currency || "eur"
                );
              }
            } catch (e) {
              logStep("Failed to process affiliate commission", { error: String(e) });
            }
          }
        } else if (status === "unpaid" || status === "canceled" || status === "incomplete_expired") {
          // All retries failed or subscription ended — downgrade
          logStep("Downgrading user due to status", { userId: user.id, status });
          await updateUserPlan(supabase, user.id, "free");
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
          await updateUserPlan(supabase, user.id, "free");
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
