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

// In-memory rate limit: max requests per IP per window
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 30; // 30 profile loads per minute per IP
const WINDOW_MS = 60_000;

// In-memory page cache: avoids DB hit for repeated requests to same username
const pageCache = new Map<string, { data: string; expiresAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

// Global circuit breaker: if total requests exceed threshold, reject without DB
let globalRequestCount = 0;
let globalResetAt = Date.now() + 60_000;
const GLOBAL_MAX_REQUESTS_PER_MINUTE = 600; // across ALL IPs on this instance

function checkGlobalLimit(): boolean {
  const now = Date.now();
  if (now > globalResetAt) {
    globalRequestCount = 0;
    globalResetAt = now + 60_000;
  }
  globalRequestCount++;
  return globalRequestCount > GLOBAL_MAX_REQUESTS_PER_MINUTE;
}

function getCachedPage(username: string): string | null {
  const entry = pageCache.get(username);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { pageCache.delete(username); return null; }
  return entry.data;
}

function setCachedPage(username: string, data: string) {
  // Cap cache size to prevent memory leak under attack
  if (pageCache.size > 500) {
    const now = Date.now();
    for (const [key, entry] of pageCache) {
      if (now > entry.expiresAt) pageCache.delete(key);
    }
    // If still too big, clear oldest half
    if (pageCache.size > 400) {
      const keys = Array.from(pageCache.keys());
      for (let i = 0; i < keys.length / 2; i++) pageCache.delete(keys[i]);
    }
  }
  pageCache.set(username, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function checkRateLimit(ip: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return { limited: true, remaining: 0 };
  }
  return { limited: false, remaining: MAX_REQUESTS - entry.count };
}

// Periodic cleanup
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(key);
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Global circuit breaker — reject all if instance is being flooded
    if (checkGlobalLimit()) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Retry-After": "30" },
        }
      );
    }

    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    if (!username || typeof username !== "string" || username.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid username" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Built-in demo page — no DB row needed
    if (username === "demo") {
      const demoPage = {
        id: "00000000-0000-0000-0000-000000000001",
        username: "demo",
        display_name: "Alex Martin",
        bio: "Créateur de contenu & designer ✨ Retrouvez tous mes liens ici.",
        avatar_url: "/demo-avatar.jpg",
        cover_url: null,
        theme: "default",
        user_id: "00000000-0000-0000-0000-000000000000",
        is_nsfw: false,
        plan: "pro",
        social_links: [
          { platform: "twitter", url: "https://twitter.com/alexmartin" },
          { platform: "instagram", url: "https://instagram.com/alexmartin" },
          { platform: "youtube", url: "https://youtube.com/@alexmartin" },
        ],
        custom_bg_color: null, custom_text_color: null, custom_accent_color: null,
        custom_btn_color: null, custom_btn_text_color: null, custom_font: "default",
        link_layout: "list", custom_css: null, urgency_config: null,
      };
      const demoLinks = [
        { id: "00000000-0000-0000-0000-d00000000001", title: "OnlyFans", url: "https://onlyfans.com/alexmartin", icon: "link", position: 0, thumbnail_url: null, description: "Subscribe to my exclusive content 💋", bg_color: "#1BAFE8", text_color: "#FFFFFF", style: "featured", section_title: null },
        { id: "00000000-0000-0000-0000-d00000000002", title: "OnlyFans VIP", url: "https://onlyfans.com/alexmartin", icon: "link", position: 1, thumbnail_url: null, description: "Subscribe to my exclusive content 💋", bg_color: "#FFFFFF", text_color: "#B05A90", style: "default", section_title: null },
        { id: "00000000-0000-0000-0000-d00000000003", title: "Instagram", url: "https://instagram.com/alexmartin", icon: "link", position: 2, thumbnail_url: null, description: null, bg_color: "#E4405F", text_color: "#FFFFFF", style: "default", section_title: "Réseaux sociaux" },
        { id: "00000000-0000-0000-0000-d00000000004", title: "Twitter / X", url: "https://x.com/alexmartin", icon: "link", position: 3, thumbnail_url: null, description: null, bg_color: "#0F1419", text_color: "#FFFFFF", style: "default", section_title: "Réseaux sociaux" },
        { id: "00000000-0000-0000-0000-d00000000005", title: "YouTube", url: "https://youtube.com/@alexmartin", icon: "link", position: 4, thumbnail_url: null, description: "Watch my latest videos 🎬", bg_color: "#FF1E1E", text_color: "#FFFFFF", style: "default", section_title: "Réseaux sociaux" },
      ];
      return new Response(
        JSON.stringify({ page: demoPage, links: demoLinks, source: "demo" }),
        { status: 200, headers: { ...corsHeaders, "Cache-Control": "public, s-maxage=3600" } }
      );
    }

    // Rate limit by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (Math.random() < 0.1) cleanup();

    const { limited, remaining } = checkRateLimit(ip);

    const rateLimitHeaders = {
      ...corsHeaders,
      "X-RateLimit-Limit": String(MAX_REQUESTS),
      "X-RateLimit-Remaining": String(remaining),
    };

    if (limited) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            "Retry-After": "60",
          },
        }
      );
    }

    // ── Check in-memory cache first (avoids DB hit entirely)
    const cached = getCachedPage(username);
    if (cached) {
      return new Response(cached, {
        status: 200,
        headers: {
          ...rateLimitHeaders,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "X-Cache": "HIT",
        },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try creator_pages first
    const { data: pageData } = await supabase
      .from("creator_pages")
      .select("id, username, display_name, bio, avatar_url, cover_url, theme, user_id, is_nsfw, social_links, custom_bg_color, custom_text_color, custom_accent_color, custom_btn_color, custom_btn_text_color, custom_font, link_layout, custom_css, urgency_config, tracking_meta_pixel, tracking_ga4, tracking_tiktok_pixel, utm_source, utm_medium, utm_campaign, safe_page_enabled, safe_page_redirect_url, geo_greeting_enabled, connected_label, location, operator, notes, revenue_monthly, revenue_commission, status")
      .eq("username", username)
      .single();

    if (pageData) {
      // Fetch links + user plan in parallel
      const [linksRes, profileRes] = await Promise.all([
        supabase
          .from("links")
          .select("id, title, url, icon, position, thumbnail_url, description, bg_color, text_color, style, section_title")
          .eq("page_id", pageData.id)
          .order("position", { ascending: true }),
        supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", pageData.user_id)
          .single(),
      ]);

      // Strip agency-internal fields from public response
      const { operator: _op, notes: _notes, revenue_monthly: _rm, revenue_commission: _rc, ...publicPageData } = pageData as any;
      const responseBody = JSON.stringify({ page: { ...publicPageData, plan: profileRes.data?.plan || 'free' }, links: linksRes.data || [], source: "creator_pages" });
      setCachedPage(username, responseBody);

      return new Response(
        responseBody,
        {
          status: 200,
          headers: {
            ...rateLimitHeaders,
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    // Fallback: profiles (legacy)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url, cover_url, theme, user_id, is_nsfw, social_links, plan")
      .eq("username", username)
      .single();

    if (!profileData) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: rateLimitHeaders,
      });
    }

    const { data: linksData } = await supabase
      .from("links")
      .select("id, title, url, icon, position, thumbnail_url, description, bg_color, text_color, style, section_title")
      .eq("user_id", profileData.user_id)
      .is("page_id", null)
      .order("position", { ascending: true });

    const legacyBody = JSON.stringify({ page: profileData, links: linksData || [], source: "profiles" });
    setCachedPage(username, legacyBody);

    return new Response(
      legacyBody,
      {
        status: 200,
        headers: {
          ...rateLimitHeaders,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
