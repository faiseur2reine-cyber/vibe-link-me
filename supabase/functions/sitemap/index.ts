import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const baseUrl = "https://mytaptap.com";

    // Get all active, non-NSFW public pages
    const { data: pages, error } = await supabase
      .from("creator_pages")
      .select("username, updated_at")
      .eq("status", "active")
      .eq("is_nsfw", false)
      .order("updated_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("[SITEMAP] Error:", error.message);
      return new Response("Error generating sitemap", { status: 500 });
    }

    const now = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;

    for (const page of pages || []) {
      const lastmod = page.updated_at
        ? new Date(page.updated_at).toISOString().split("T")[0]
        : now;
      xml += `
  <url>
    <loc>${baseUrl}/${page.username}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[SITEMAP] Unexpected error:", message);
    return new Response("Error generating sitemap", { status: 500 });
  }
});
