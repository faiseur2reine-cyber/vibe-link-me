import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const log = (step: string, details?: Record<string, unknown>) => {
  console.log(`[WEEKLY-SUMMARY] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  // Only allow POST (from cron) or manual trigger with auth header
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  // Simple auth: check for a shared secret to prevent unauthorized triggers
  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Called daily by Cronitor, but only send emails on Mondays
  // Pass ?force=true to bypass day check (for testing)
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";
  const today = new Date().getUTCDay(); // 0=Sun, 1=Mon
  if (!force && today !== 1) {
    log("Skipped — not Monday", { day: today });
    return new Response(JSON.stringify({ skipped: true, reason: "not_monday", day: today }), { status: 200 });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    log("ERROR", { message: "RESEND_API_KEY not set" });
    return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500 });
  }

  const fromEmail = Deno.env.get("EMAIL_FROM") || "MyTaptap <noreply@mytaptap.com>";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // ── 1. Get all users who want weekly emails ──
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("user_id, username, email_weekly")
      .eq("email_weekly", true);

    if (usersError) {
      log("ERROR fetching users", { error: usersError.message });
      return new Response(JSON.stringify({ error: usersError.message }), { status: 500 });
    }

    if (!users || users.length === 0) {
      log("No users opted in");
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    log("Processing users", { count: users.length });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoIso = weekAgo.toISOString();

    let sent = 0;
    let skipped = 0;

    for (const profile of users) {
      try {
        // Get user email from auth
        const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
        const email = authData?.user?.email;
        if (!email) { skipped++; continue; }

        // Get user's pages
        const { data: pages } = await supabase
          .from("creator_pages")
          .select("id, username, display_name")
          .eq("user_id", profile.user_id);

        if (!pages || pages.length === 0) { skipped++; continue; }

        const pageIds = pages.map(p => p.id);

        // Get clicks this week
        const { data: clicks } = await supabase
          .from("link_clicks")
          .select("id, link_id")
          .in("link_id", (
            await supabase
              .from("links")
              .select("id")
              .in("page_id", pageIds)
          ).data?.map((l: { id: string }) => l.id) || [])
          .gte("clicked_at", weekAgoIso);

        const totalClicks = clicks?.length || 0;

        // Get pageviews this week (if table exists)
        let totalViews = 0;
        try {
          const { data: views } = await supabase
            .from("page_views")
            .select("id")
            .in("page_id", pageIds)
            .gte("viewed_at", weekAgoIso);
          totalViews = views?.length || 0;
        } catch {
          // page_views table might not exist yet
        }

        // Skip if zero activity
        if (totalClicks === 0 && totalViews === 0) { skipped++; continue; }

        // ── Build email ──
        const firstName = profile.username || "there";
        const dashboardUrl = "https://mytaptap.com/dashboard";
        const unsubUrl = `https://mytaptap.com/dashboard/settings`;

        const html = buildEmailHtml({
          firstName,
          totalClicks,
          totalViews,
          pageCount: pages.length,
          topPage: pages[0]?.display_name || pages[0]?.username || "—",
          dashboardUrl,
          unsubUrl,
        });

        // ── Send via Resend ──
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: `${totalClicks} clic${totalClicks !== 1 ? "s" : ""} cette semaine — MyTaptap`,
            html,
          }),
        });

        if (res.ok) {
          sent++;
        } else {
          const err = await res.text();
          log("Resend error", { email, error: err });
        }
      } catch (e) {
        log("Error processing user", { userId: profile.user_id, error: String(e) });
      }
    }

    log("Done", { sent, skipped, total: users.length });
    return new Response(JSON.stringify({ sent, skipped }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("Unexpected error", { error: message });
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});

// ── Email template ──
function buildEmailHtml(data: {
  firstName: string;
  totalClicks: number;
  totalViews: number;
  pageCount: number;
  topPage: string;
  dashboardUrl: string;
  unsubUrl: string;
}): string {
  const { firstName, totalClicks, totalViews, pageCount, topPage, dashboardUrl, unsubUrl } = data;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="display:inline-block;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#10b981);line-height:32px;text-align:center;color:#fff;font-weight:bold;font-size:13px;">M</span>
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:16px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <p style="margin:0 0 4px;font-size:14px;color:#888;">Salut ${firstName},</p>
      <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111;line-height:1.3;">
        Ta semaine en un coup d'œil
      </h1>

      <!-- Stats row -->
      <div style="display:flex;gap:16px;margin-bottom:24px;">
        <div style="flex:1;background:#f8f8f8;border-radius:12px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#111;">${totalClicks}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888;">clic${totalClicks !== 1 ? "s" : ""}</p>
        </div>
        ${totalViews > 0 ? `
        <div style="flex:1;background:#f8f8f8;border-radius:12px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#111;">${totalViews}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888;">vue${totalViews !== 1 ? "s" : ""}</p>
        </div>
        ` : ""}
        <div style="flex:1;background:#f8f8f8;border-radius:12px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#111;">${pageCount}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888;">page${pageCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      ${totalClicks >= 50 ? `
      <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6;">
        Belle semaine ! <strong>${topPage}</strong> a bien performé. Continue comme ça.
      </p>
      ` : totalClicks >= 10 ? `
      <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6;">
        Tes liens avancent. Jette un œil à tes analytics pour voir ce qui marche.
      </p>
      ` : `
      <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6;">
        C'est un début. Partage ta page sur tes réseaux pour booster tes clics.
      </p>
      `}

      <!-- CTA -->
      <a href="${dashboardUrl}" style="display:block;text-align:center;background:#111;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600;">
        Voir mon dashboard
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="margin:0;font-size:11px;color:#bbb;">
        Tu reçois cet email car tu as un compte MyTaptap.
        <br><a href="${unsubUrl}" style="color:#888;text-decoration:underline;">Gérer mes préférences email</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
