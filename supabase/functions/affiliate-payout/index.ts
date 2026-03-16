import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "https://vibe-link-me.lovable.app",
  "https://mytaptap.com",
  "https://www.mytaptap.com",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".lovable.app") || origin.startsWith("http://localhost");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Content-Type": "application/json",
  };
}

const MIN_PAYOUT = 1000; // 10€ minimum payout

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Auth failed");
    const userId = userData.user.id;

    const { action } = await req.json();
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // ── ACTION: Create Stripe Connect onboarding link ──
    if (action === "connect-onboard") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_id")
        .eq("user_id", userId)
        .single();

      let accountId = profile?.stripe_connect_id;

      if (!accountId) {
        // Create Express account
        const account = await stripe.accounts.create({
          type: "express",
          country: "FR",
          capabilities: { transfers: { requested: true } },
          metadata: { user_id: userId },
        });
        accountId = account.id;

        await supabase
          .from("profiles")
          .update({ stripe_connect_id: accountId })
          .eq("user_id", userId);
      }

      const origin = req.headers.get("origin") || "https://mytaptap.com";
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/dashboard/settings`,
        return_url: `${origin}/dashboard/settings?connect=success`,
        type: "account_onboarding",
      });

      return new Response(JSON.stringify({ url: link.url }), { headers: corsHeaders });
    }

    // ── ACTION: Check Connect account status ──
    if (action === "connect-status") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_id, affiliate_balance")
        .eq("user_id", userId)
        .single();

      if (!profile?.stripe_connect_id) {
        return new Response(JSON.stringify({ connected: false, balance: profile?.affiliate_balance || 0 }), { headers: corsHeaders });
      }

      const account = await stripe.accounts.retrieve(profile.stripe_connect_id);
      const ready = account.charges_enabled && account.payouts_enabled;

      return new Response(JSON.stringify({
        connected: true,
        ready,
        balance: profile.affiliate_balance || 0,
        account_id: profile.stripe_connect_id,
      }), { headers: corsHeaders });
    }

    // ── ACTION: Request payout ──
    if (action === "request-payout") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_id, affiliate_balance")
        .eq("user_id", userId)
        .single();

      if (!profile?.stripe_connect_id) throw new Error("No Stripe Connect account");
      if ((profile.affiliate_balance || 0) < MIN_PAYOUT) throw new Error(`Minimum payout is ${MIN_PAYOUT / 100}€`);

      const amount = profile.affiliate_balance;

      // Verify account is ready
      const account = await stripe.accounts.retrieve(profile.stripe_connect_id);
      if (!account.charges_enabled || !account.payouts_enabled) {
        throw new Error("Stripe Connect account not fully onboarded");
      }

      // Create payout record
      const { data: payout, error: payoutError } = await supabase
        .from("affiliate_payouts")
        .insert({
          referrer_id: userId,
          amount,
          status: "processing",
        })
        .select()
        .single();

      if (payoutError) throw new Error("Failed to create payout record");

      try {
        // Stripe Transfer to connected account
        const transfer = await stripe.transfers.create({
          amount,
          currency: "eur",
          destination: profile.stripe_connect_id,
          description: `MyTaptap affiliate payout`,
          metadata: { payout_id: payout.id, user_id: userId },
        });

        // Update payout + reset balance
        await supabase
          .from("affiliate_payouts")
          .update({
            status: "paid",
            stripe_transfer_id: transfer.id,
            paid_at: new Date().toISOString(),
          })
          .eq("id", payout.id);

        await supabase
          .from("profiles")
          .update({ affiliate_balance: 0 })
          .eq("user_id", userId);

        return new Response(JSON.stringify({
          success: true,
          amount,
          transfer_id: transfer.id,
        }), { headers: corsHeaders });

      } catch (stripeError) {
        // Transfer failed — mark payout as failed
        const msg = stripeError instanceof Error ? stripeError.message : String(stripeError);
        await supabase
          .from("affiliate_payouts")
          .update({ status: "failed", error_message: msg })
          .eq("id", payout.id);

        throw new Error(`Stripe transfer failed: ${msg}`);
      }
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: corsHeaders });
  }
});
