# MyTaptap — TODO
# Ce fichier est la source de vérité. Quand on dit "continuer", lire ce fichier et prendre le prochain item non coché.
# Cocher avec [x] après chaque push réussi.

## ═══ PRIORITY 1 — BUGS & BROKEN ═══

- [x] Dashboard: all tabs render fine on fresh pages — select('*') returns DB defaults, all editors have fallbacks
- [x] ImmersiveLayout: featured links have glow border + taller (72px)
- [x] ImmersiveLayout: buttons with no bg_color default to white pill + red #e8503a icon
- [x] PublicProfile: the `<a>` tags — verified, no double navigation (e.preventDefault in all handlers)
- [x] PagesListView: revenue_monthly/revenue_commission use ?? fallback
- [x] TrackingEditor/SafePageEditor: auto-save with useAutoSave hook — values persist automatically
- [x] ThemeSelector: immersive preview now indigo-900 gradient (visible)
- [x] NsfwInlineGate: explicit rounded-full (dark) / rounded-xl (light) — no inherit
- [x] GeoGreeting: 3 fallbacks (ipapi.co → ipwho.is → ipinfo.io) + sessionStorage cache
- [x] LivePreview iframe: ?preview=true bypass works — verified flow

## ═══ PRIORITY 2 — UX IMPROVEMENTS ═══

- [x] Dashboard: auto-save on all editors (TrackingEditor, SafePageEditor, AgencyEditor, ImmersiveSettings)
- [x] Dashboard: toast notifications all use sonner (verified — no shadcn toast imports remain)
- [x] LinksManager: show platform icon (OF, MYM, IG, etc.) via LinkFavicon
- [x] LinksManager: drag handle bigger touch target, visible on mobile
- [x] PageProfileEditor: visual crop guide overlay + updated help text for immersive hero
- [x] DashboardOverview: add "last edited" timestamp per page
- [x] DashboardOverview: click on a page → navigates to detail via ?page=id
- [x] Share dialog: add "Copy for Instagram bio" button (short URL without https://)
- [x] Share dialog: QR code with T logo center (level=H, excavate)
- [x] Mobile dashboard: bottom nav grouped — 4 primary + "Plus" drawer with 5 secondary tabs
- [x] Onboarding: already a proper 322-line wizard (welcome → template → customize → preview → success)

## ═══ PRIORITY 3 — FEATURES ═══

- [x] Bulk actions: select pages → change status (active/paused) + export CSV
- [x] Analytics: page view tracking via usePageView hook (once per session per page)
- [x] Analytics: export to CSV (per-page, all sections: links, daily, country, city, referrer, A/B)
- [x] Link scheduling: scheduled_at/expires_at with datetime pickers + public page filtering
- [x] A/B test editor: side-by-side preview cards (variant A with widgets vs B plain)
- [ ] Custom domain per page: let creators use their own domain (CNAME setup guide)
- [ ] Webhook on click: notify external URL when a link is clicked
- [ ] Email notifications: daily/weekly summary of clicks per page
- [x] Dashboard: dark/light mode syncs with system preference + persists manual choice
- [x] i18n: 6 key groups added to 6 locales + wired in PageDetailView & PagesListView

## ═══ PRIORITY 4 — DESIGN POLISH ═══

- [x] Landing page: hero section already has 3D phone mockup with tilt
- [x] Landing page: testimonials section with 4 creator quotes
- [x] Landing page: comparison table vs Linktree/GAML/Beacons added
- [x] Safari audit: viewport-fit=cover, dvh, tap highlight, overscroll, input zoom, safe areas
- [x] ImmersiveLayout: parallax on hero photo via framer-motion useScroll/useTransform
- [x] PublicProfile: "Powered by MyTaptap" footer — visible on free plan, hidden on starter/pro
- [x] Favicon: full set generated (16, 32, 180, 192, 512, SVG, apple-touch-icon, favicon.ico)
- [x] PWA: manifest.json with proper icons (192, 512, SVG) + maskable purpose
- [x] Loading skeleton: skeleton cards shown during pages load (replaces spinner)

## ═══ PRIORITY 5 — PERFORMANCE & INFRA ═══

- [x] Dashboard chunk split: 811KB → 680KB base + lazy loaded editors
- [ ] Images: add srcset/responsive images for avatars and covers
- [ ] Service worker: cache public pages for offline viewing
- [x] Edge function: ETag + If-None-Match → 304 on public-profile
- [x] Supabase: indexes on link_clicks(link_id, clicked_at), creator_pages(username), page_links(page_id, position)
- [x] Error boundary: App wrapped with ErrorBoundary (branded crash page + Go Home button)
- [ ] Sentry/error tracking: add basic error reporting

## ═══ PRIORITY 6 — SECURITY ═══

- [x] CSP headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy on both edge functions
- [x] Rate limit: client-side throttleClick (1.5s cooldown per link, prevents double-clicks)
- [x] CORS: mytaptap.com + www already in both edge functions
- [x] Audit: operator/notes/revenue stripped from public API (verified)
- [ ] Audit: check all Supabase RLS policies are correct (no cross-user data access)

## ═══ DONE ═══

- [x] Immersive layout GAML-style (hero photo, pill buttons)
- [x] Deeplink engine all themes (IG/FB/TikTok breakout)
- [x] UTM auto on all outbound links
- [x] Meta Pixel, GA4, TikTok Pixel injection
- [x] Safe Page (bot redirect)
- [x] AgeGate + NsfwInlineGate (double 18+ protection)
- [x] Platform auto-detect on URL paste
- [x] Tracking, Safe Page, Agency tabs in dashboard
- [x] Agency editor (operator, revenue, commission, notes, status)
- [x] Dashboard Overview separated from Pages
- [x] All animations slowed down and polished
- [x] CORS whitelisted, in-memory cache 30s, circuit breaker 600 req/min
- [x] Internal fields stripped from public API
- [x] QR code share dialog
- [x] 404 page branded
- [x] Code splitting (40x faster for visitors)
- [x] Copy link button on pages list
- [x] Revenue display on pages list
- [x] GeoGreeting cache + HTTPS fallback
- [x] Immersive settings editor (connected label, location, geo greeting)
- [x] SEO: noindex NSFW, canonical URLs
- [x] robots.txt improved
- [x] Gradient fallback on immersive with no photo
- [x] SafePageEditor/TrackingEditor useEffect fix (toggle reset bug)
- [x] Edge function: 16 new columns in SELECT
- [x] NsfwInlineGate: multi-language, theme variants
- [x] All animate-ping replaced with animate-pulse-soft
