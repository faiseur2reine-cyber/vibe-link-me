# MyTaptap — TODO
# Ce fichier est la source de vérité. Quand on dit "continuer", lire ce fichier et prendre le prochain item non coché.
# Cocher avec [x] après chaque push réussi.

## ═══ PRIORITY 1 — BUGS & BROKEN ═══

- [ ] Dashboard: verify all tabs render without crash on a fresh page (no data)
- [ ] ImmersiveLayout: buttons with no bg_color set should default white pill + red icon circle
- [ ] ImmersiveLayout: links with `style: 'featured'` should have visual distinction (glow/border)
- [x] PublicProfile: the `<a>` tags — verified, no double navigation (e.preventDefault in all handlers)
- [x] PagesListView: revenue_monthly/revenue_commission use ?? fallback
- [ ] TrackingEditor/SafePageEditor: test save → reload → values persist
- [ ] ThemeSelector: "immersive" theme preview swatch is black on black — needs visual indicator
- [ ] NsfwInlineGate: `rounded-[inherit]` might not work in all button contexts — test on all 4 link styles (default, featured, card, minimal)
- [x] GeoGreeting: 3 fallbacks (ipapi.co → ipwho.is → ipinfo.io) + sessionStorage cache
- [ ] LivePreview iframe: loads AgeGate on NSFW pages even with ?preview=true (verify this actually works)

## ═══ PRIORITY 2 — UX IMPROVEMENTS ═══

- [ ] Dashboard: auto-save on editors instead of manual "Sauvegarder" button (debounced 1.5s)
- [ ] Dashboard: toast notifications should be consistent — some use sonner, some use shadcn toast
- [x] LinksManager: show platform icon (OF, MYM, IG, etc.) via LinkFavicon
- [ ] LinksManager: drag handle should be more visible on mobile
- [ ] PageProfileEditor: cover photo upload should show crop guide for immersive hero ratio
- [ ] DashboardOverview: add "last edited" timestamp per page
- [x] DashboardOverview: click on a page → navigates to detail via ?page=id
- [ ] Share dialog: add "Copy for Instagram bio" button (just the short URL)
- [ ] Share dialog: QR code should include small logo in center
- [ ] Mobile dashboard: bottom nav has 9 tabs — too many, group into fewer with submenu
- [ ] Onboarding: currently 24 lines — needs a proper wizard (username → template → first links → theme)

## ═══ PRIORITY 3 — FEATURES ═══

- [ ] Bulk actions: select multiple pages → change status / assign operator / export CSV
- [ ] Analytics: add conversion rate (clicks / page views) — needs page view tracking
- [ ] Analytics: export to CSV
- [ ] Link scheduling: set a link to appear/disappear at a specific date/time
- [ ] A/B test editor: visual editor for creating A/B variants (currently just a field)
- [ ] Custom domain per page: let creators use their own domain (CNAME setup guide)
- [ ] Webhook on click: notify external URL when a link is clicked
- [ ] Email notifications: daily/weekly summary of clicks per page
- [ ] Dashboard: dark/light mode should persist and sync with system preference
- [ ] i18n: all hardcoded French strings should use t() — audit and fix

## ═══ PRIORITY 4 — DESIGN POLISH ═══

- [ ] Landing page: hero section needs a demo phone mockup showing a live page
- [ ] Landing page: add testimonials section
- [ ] Landing page: add comparison table vs Linktree/GAML/Beacons
- [ ] All themes: audit on mobile Safari (safe area, scroll, keyboard)
- [ ] ImmersiveLayout: add subtle parallax on hero photo scroll
- [ ] PublicProfile: footer with "Powered by MyTaptap" + link (removable on Pro plan)
- [ ] Favicon: generate proper set (16, 32, 180, 192, 512) from logo
- [ ] PWA: proper icons set + splash screens
- [ ] Loading skeleton: show skeleton cards instead of spinner while pages load

## ═══ PRIORITY 5 — PERFORMANCE & INFRA ═══

- [ ] Dashboard chunk is 811KB — split further (lazy load editors)
- [ ] Images: add srcset/responsive images for avatars and covers
- [ ] Service worker: cache public pages for offline viewing
- [ ] Edge function: add ETag support for conditional requests
- [ ] Supabase: add indexes on link_clicks(link_id, clicked_at) if not exists
- [ ] Error boundary: wrap App with React ErrorBoundary to catch crashes gracefully
- [ ] Sentry/error tracking: add basic error reporting

## ═══ PRIORITY 6 — SECURITY ═══

- [ ] CSP headers: add Content-Security-Policy to edge function responses
- [ ] Rate limit: add rate limiting on the client side too (prevent accidental rapid clicks)
- [ ] CORS: when domain is purchased, add it to ALLOWED_ORIGINS in both edge functions
- [ ] Audit: check all Supabase RLS policies are correct (no cross-user data access)
- [ ] Audit: check that operator/notes/revenue are never exposed in any public API response

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
