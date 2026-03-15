import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[DELETE-ACCOUNT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    log("Starting account deletion", { userId, email: userEmail });

    // ── 1. Cancel Stripe subscription if exists ──
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey && userEmail) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        if (customers.data.length > 0) {
          const customer = customers.data[0];
          const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 10 });
          for (const sub of subs.data) {
            await stripe.subscriptions.cancel(sub.id);
            log("Cancelled Stripe subscription", { subId: sub.id });
          }
        }
      } catch (e) {
        log("Stripe cancellation error (non-blocking)", { error: String(e) });
      }
    }

    // ── 2. Get all user's links (needed to delete clicks) ──
    const { data: userLinks } = await supabase
      .from("links")
      .select("id")
      .eq("user_id", userId);

    const linkIds = (userLinks || []).map((l: { id: string }) => l.id);

    // ── 3. Delete link_clicks for user's links ──
    if (linkIds.length > 0) {
      // Delete in batches of 100 to avoid query size limits
      for (let i = 0; i < linkIds.length; i += 100) {
        const batch = linkIds.slice(i, i + 100);
        await supabase.from("link_clicks").delete().in("link_id", batch);
      }
      log("Deleted link_clicks", { count: linkIds.length });
    }

    // ── 4. Delete links ──
    await supabase.from("links").delete().eq("user_id", userId);
    log("Deleted links");

    // ── 5. Delete creator_pages ──
    await supabase.from("creator_pages").delete().eq("user_id", userId);
    log("Deleted creator_pages");

    // ── 6. Delete custom_templates ──
    await supabase.from("custom_templates").delete().eq("user_id", userId);
    log("Deleted custom_templates");

    // ── 7. Delete onboarding_state ──
    await supabase.from("onboarding_state").delete().eq("user_id", userId);
    log("Deleted onboarding_state");

    // ── 8. Delete profile ──
    await supabase.from("profiles").delete().eq("user_id", userId);
    log("Deleted profile");

    // ── 9. Delete storage files ──
    try {
      const { data: files } = await supabase.storage
        .from("media")
        .list(userId, { limit: 1000 });

      if (files && files.length > 0) {
        const paths = files.map((f: { name: string }) => `${userId}/${f.name}`);
        await supabase.storage.from("media").remove(paths);

        // Also check subdirectories (thumbnails)
        const { data: thumbFiles } = await supabase.storage
          .from("media")
          .list(`${userId}/thumbnails`, { limit: 1000 });

        if (thumbFiles && thumbFiles.length > 0) {
          const thumbPaths = thumbFiles.map((f: { name: string }) => `${userId}/thumbnails/${f.name}`);
          await supabase.storage.from("media").remove(thumbPaths);
        }
      }
      log("Deleted storage files");
    } catch (e) {
      log("Storage deletion error (non-blocking)", { error: String(e) });
    }

    // ── 10. Delete auth user ──
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      log("Auth deletion error", { error: deleteError.message });
      return new Response(JSON.stringify({ error: "Failed to delete auth account" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    log("Deleted auth user — account fully removed");

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("Unexpected error", { error: message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
