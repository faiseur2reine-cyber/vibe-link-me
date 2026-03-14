import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vibe-link-me.lovable.app",
  "https://mytaptap.com",
  "https://www.mytaptap.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin)
    || origin.endsWith(".lovable.app")
    || origin.startsWith("http://localhost");
  const allowed = isAllowed ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

// In-memory rate limit store (per edge function instance)
const clickCounts = new Map<string, { count: number; resetAt: number }>();

const MAX_CLICKS_PER_MINUTE = 10;
const WINDOW_MS = 60_000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = clickCounts.get(key);

  if (!entry || now > entry.resetAt) {
    clickCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_CLICKS_PER_MINUTE) {
    return true;
  }
  return false;
}

// Cleanup old entries periodically to avoid memory leaks
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of clickCounts) {
    if (now > entry.resetAt) clickCounts.delete(key);
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { link_id, referrer, ab_variant } = await req.json();

    if (!link_id || typeof link_id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid link_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Skip demo links (not in DB)
    if (link_id.startsWith("00000000-0000-0000-0000-d")) {
      return new Response(JSON.stringify({ ok: true, recorded: false }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Page view events — acknowledged, not recorded in link_clicks
    // These are tracked via GA4/Meta Pixel instead
    if (link_id.startsWith("pageview_")) {
      return new Response(JSON.stringify({ ok: true, recorded: false, type: "pageview" }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Rate limit by IP + link combo
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    const rateLimitKey = `${ip}:${link_id}`;

    // Periodic cleanup
    if (Math.random() < 0.1) cleanup();

    if (isRateLimited(rateLimitKey)) {
      // Silently accept — visitor doesn't notice, but we don't record
      return new Response(JSON.stringify({ ok: true, recorded: false }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Record the click using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.rpc("record_click", {
      p_link_id: link_id,
      p_referrer: referrer || null,
      p_country: null,
      p_city: null,
      p_ab_variant: ab_variant || null,
    });

    if (error) {
      console.error("record_click error:", error);
      return new Response(JSON.stringify({ error: "Failed to record" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true, recorded: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
