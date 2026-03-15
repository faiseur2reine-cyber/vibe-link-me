// src/components/profile/ImmersiveLayout.tsx
// Premium mobile-first link-in-bio. Black background, full-bleed hero,
// frosted glass buttons, cinematic gradients, touch-optimized.

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { TapMapPin as MapPin, TapChevronRight as ChevronRight, TapChevronDown as ChevronDownIcon, TapHeart as Heart, TapShare as Share2 } from '@/components/icons/TapIcons';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { deeplinkNavigate } from '@/lib/deeplink';
import { appendUtm, type UtmParams } from '@/lib/utm';
import { throttleClick } from '@/lib/throttle';
import { getTheme } from '@/lib/themes';
import { BRAND } from '@/lib/brand';
import { recordClick } from '@/hooks/useAnalytics';
import { usePageView } from '@/hooks/usePageView';
import { TrackingPixels, trackPixelClick } from '@/components/profile/TrackingPixels';
import GeoGreeting from '@/components/profile/GeoGreeting';
import NsfwInlineGate from '@/components/profile/NsfwInlineGate';
import SocialIcons from '@/components/profile/SocialIcons';
import { ProfileUrgencyBanner, ProfileScarcityWidgets, ProfileLocationToast } from '@/components/profile/UrgencyWidgets';
import LinkFavicon from '@/components/LinkFavicon';
import type { UrgencyConfig } from '@/components/dashboard/UrgencyEditor';

interface SocialLink { platform: string; url: string; }

interface PageData {
  id: string; username: string; display_name: string | null;
  bio: string | null; avatar_url: string | null; cover_url: string | null;
  is_nsfw: boolean; social_links: SocialLink[];
  plan?: string; theme?: string; user_id?: string;
  connected_label?: string | null; location?: string | null;
  urgency_config?: UrgencyConfig | null;
  tracking_meta_pixel?: string | null; tracking_ga4?: string | null;
  tracking_tiktok_pixel?: string | null;
  utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null;
  geo_greeting_enabled?: boolean;
  safe_page_enabled?: boolean; safe_page_redirect_url?: string | null;
  [key: string]: any;
}

interface LinkData {
  id: string; title: string; url: string; icon: string; position: number;
  description: string | null; bg_color: string | null; text_color: string | null;
  style: string; section_title: string | null; thumbnail_url: string | null;
  scheduled_at: string | null; expires_at: string | null; is_visible: boolean;
}

interface Props { page: PageData; links: LinkData[]; abVariant: 'A' | 'B'; paymentIssue?: boolean; }

const ease = [0.16, 1, 0.3, 1] as const;

// ── Hero image — blur-up + parallax ──
const HeroImage = ({ src }: { src: string }) => {
  const [loaded, setLoaded] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 100]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.06]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
  }, [src]);

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        height: '125%',
        top: '-12%',
        y,
        scale,
        filter: loaded ? 'none' : 'blur(24px)',
        transform: loaded ? undefined : 'scale(1.08)',
        transition: 'filter 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}
    />
  );
};

const ImmersiveLayout = ({ page, links, abVariant, paymentIssue = false }: Props) => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  usePageView(page.id);

  useEffect(() => {
    const handler = () => { if (window.scrollY > 40) setScrolled(true); };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const displayName = page.display_name || page.username;
  const location = page.location || '';
  const connectedLabel = page.connected_label || 'Active now';
  const urgency = page.urgency_config;
  const showUrgency = urgency && (urgency.abTest?.enabled ? abVariant === 'A' : true);
  const clickVariant = urgency?.abTest?.enabled ? abVariant : null;
  const heroSrc = page.cover_url || null; // Never stretch avatar as hero
  const ogImage = page.cover_url || page.avatar_url; // OG can use either

  const trackingConfig = {
    metaPixel: page.tracking_meta_pixel,
    ga4: page.tracking_ga4,
    tiktokPixel: page.tracking_tiktok_pixel,
  };

  const utmParams: UtmParams = {
    source: page.utm_source || undefined,
    medium: page.utm_medium || undefined,
    campaign: page.utm_campaign || undefined,
  };

  const handleLinkClick = (link: LinkData) => {
    if (paymentIssue) return;
    if (!throttleClick(link.id)) return;
    const finalUrl = appendUtm(link.url, utmParams);
    recordClick(link.id, clickVariant);
    trackPixelClick(link.title, trackingConfig);
    deeplinkNavigate(finalUrl);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: displayName, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  // Group links into sections
  const sections: { title: string | null; links: LinkData[] }[] = [];
  links.forEach(link => {
    const key = link.section_title || null;
    const existing = sections.find(s => s.title === key);
    if (existing) existing.links.push(link);
    else sections.push({ title: key, links: [link] });
  });

  let globalLinkIndex = 0;

  return (
    <>
      <TrackingPixels {...trackingConfig} />

      <Helmet>
        <title>{`${displayName} | MyTaptap`}</title>
        <meta name="description" content={page.bio || `${displayName}'s links`} />
        <link rel="canonical" href={`${window.location.origin}/${page.username}`} />
        {page.is_nsfw && <meta name="robots" content="noindex, nofollow" />}
        <meta property="og:title" content={`${displayName} | MyTaptap`} />
        <meta property="og:description" content={page.bio || `${displayName}'s links`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/${page.username}`} />
        <meta property="og:site_name" content="MyTaptap" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content={page.cover_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={`${displayName} | MyTaptap`} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {page.is_nsfw && <meta name="rating" content="adult" />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "name": `${displayName} | MyTaptap`,
          "url": `${window.location.origin}/${page.username}`,
          ...(ogImage ? { "image": ogImage } : {}),
        })}</script>
      </Helmet>

      {showUrgency && urgency?.banner?.enabled && <ProfileUrgencyBanner config={urgency.banner} pageId={page.id} />}
      {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.locationToastEnabled && <ProfileLocationToast enabled={true} pageId={page.id} />}

      <div className="min-h-screen min-h-[100dvh] bg-[#0a0a0a] text-white antialiased" style={{ fontFamily: "'Public Sans', -apple-system, sans-serif" }}>

        {/* ═══ HERO ═══ */}
        <div ref={heroRef} className="relative w-full overflow-hidden" style={{ height: '55dvh', minHeight: 380, maxHeight: 520 }}>
          {heroSrc ? (
            <HeroImage src={heroSrc} />
          ) : (
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1035 35%, #0d2847 65%, #0a1628 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradient-shift 12s ease infinite',
            }} />
          )}

          {/* Film grain */}
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
          />

          {/* Cinematic gradient — 5 stops for smoothness */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg,
              rgba(10,10,10,0.15) 0%,
              transparent 25%,
              transparent 40%,
              rgba(10,10,10,0.35) 55%,
              rgba(10,10,10,0.75) 72%,
              rgba(10,10,10,0.95) 85%,
              #0a0a0a 98%
            )`,
          }} />

          {/* Share — safe area aware */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleShare}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/25 backdrop-blur-2xl border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-black/40 transition-all duration-200 active:scale-90"
            style={{ top: 'max(16px, env(safe-area-inset-top, 16px))' }}
          >
            <Share2 className="w-4 h-4" />
          </motion.button>

          {/* ── Profile info ── */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 text-center z-10">
            <GeoGreeting enabled={page.geo_greeting_enabled !== false} className="mb-4" />

            {/* Avatar */}
            {page.avatar_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="flex justify-center mb-5"
              >
                <div className="relative">
                  <img
                    src={page.avatar_url}
                    alt={displayName}
                    className={`${heroSrc ? 'w-[88px] h-[88px]' : 'w-[100px] h-[100px]'} rounded-full object-cover shadow-[0_4px_24px_rgba(0,0,0,0.4)]`}
                    style={{ border: '3px solid rgba(255,255,255,0.15)' }}
                  />
                  <div className={`absolute bottom-0 right-0 ${heroSrc ? 'w-[22px] h-[22px]' : 'w-[24px] h-[24px]'} rounded-full bg-emerald-400 border-[3px] border-[#0a0a0a] shadow-[0_0_8px_rgba(52,211,153,0.4)]`} />
                </div>
              </motion.div>
            )}

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease }}
              className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] leading-none line-clamp-2"
            >
              {displayName}
            </motion.h1>

            {/* Status line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center justify-center gap-2 mt-3 text-[13px] text-white/40"
            >
              {!page.avatar_url && (
                <span className="relative w-[7px] h-[7px] shrink-0">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                  <span className="relative block w-[7px] h-[7px] rounded-full bg-emerald-400" />
                </span>
              )}
              <span className="font-medium">{connectedLabel}</span>
              {location && (
                <>
                  <span className="text-white/15">·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-white/25" />
                    {location}
                  </span>
                </>
              )}
            </motion.div>

            {/* Bio */}
            {page.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22, duration: 0.4 }}
                className="text-[14px] sm:text-[15px] text-white/55 leading-[1.6] max-w-[340px] mx-auto mt-4 line-clamp-3"
              >
                {page.bio}
              </motion.p>
            )}

            {/* Scarcity below bio */}
            {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'below-bio' && (
              <div className="mt-5">
                <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
              </div>
            )}

            {/* Social icons */}
            {page.social_links.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5">
                <SocialIcons links={page.social_links} theme={getTheme('midnight')} />
              </motion.div>
            )}

            {/* Scroll hint */}
            <AnimatePresence>
              {links.length > 0 && !scrolled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="mt-7 flex justify-center"
                >
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronDownIcon className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scarcity above links */}
        {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'above-links' && (
          <div className="px-5 pt-4 max-w-[480px] mx-auto">
            <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
          </div>
        )}

        {/* ═══ LINKS ═══ */}
        {paymentIssue && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease }}
            className="px-5 mt-4 max-w-[480px] mx-auto"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.05]">
              <span className="text-[17px] shrink-0">💤</span>
              <p className="text-[12px] text-white/40 leading-relaxed">
                Les liens de cette page sont temporairement indisponibles. Revenez bientôt !
              </p>
            </div>
          </motion.div>
        )}

        <div className={`px-5 pt-7 pb-8 max-w-[480px] mx-auto flex flex-col gap-[16px] ${paymentIssue ? 'opacity-30 pointer-events-none select-none' : ''}`}>
          {links.length === 0 && !paymentIssue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-8"
            >
              <p className="text-[13px] text-white/20">Pas encore de liens</p>
            </motion.div>
          )}
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section header */}
              {section.title && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 mt-3 mb-2 px-1"
                >
                  <div className="h-px flex-1 bg-white/[0.05]" />
                  <span className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.2em]">{section.title}</span>
                  <div className="h-px flex-1 bg-white/[0.05]" />
                </motion.div>
              )}

              {section.links.map((link) => {
                const idx = globalLinkIndex++;
                const isFeatured = link.style === 'featured';
                const iconBg = link.bg_color && link.bg_color !== '#FFFFFF' && link.bg_color !== '#ffffff'
                  ? link.bg_color
                  : '#e8503a';

                const linkButton = (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10px' }}
                    transition={{ delay: idx < 5 ? idx * 0.06 : 0, duration: 0.45, ease }}
                    onClick={(e) => { e.preventDefault(); handleLinkClick(link); }}
                    className={`group relative w-full flex items-center gap-[14px] text-left ${
                      paymentIssue ? 'cursor-default' : ''
                    }`}
                    style={{
                      background: isFeatured
                        ? `linear-gradient(135deg, #FFFFFF 0%, #F8F8FA 100%)`
                        : 'rgba(255,255,255,0.96)',
                      borderRadius: 18,
                      minHeight: isFeatured ? 76 : 68,
                      padding: '14px 16px 14px 14px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: isFeatured
                        ? `0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 1px ${iconBg}10`
                        : '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
                      transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)',
                      transform: 'translateY(0)',
                    }}
                    {...(!paymentIssue ? {
                      onPointerDown: (e: React.PointerEvent) => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(0.975)';
                      },
                      onPointerUp: (e: React.PointerEvent) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      },
                      onPointerLeave: (e: React.PointerEvent) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = isFeatured
                          ? `0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 1px ${iconBg}10`
                          : '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)';
                      },
                      onMouseEnter: (e: React.MouseEvent) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = isFeatured
                          ? `0 2px 4px rgba(0,0,0,0.04), 0 14px 36px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 1px ${iconBg}15`
                          : '0 2px 4px rgba(0,0,0,0.04), 0 14px 36px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)';
                      },
                    } : {})}
                  >
                    {/* Icon / Thumbnail */}
                    {link.thumbnail_url ? (
                      <div className={`w-[48px] h-[48px] rounded-[13px] overflow-hidden shrink-0 transition-transform duration-200 ${
                        paymentIssue ? '' : 'group-hover:scale-[1.06]'
                      }`}
                        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                      >
                        <img
                          src={link.thumbnail_url}
                          alt={link.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-[48px] h-[48px] rounded-[13px] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                          paymentIssue ? '' : 'group-hover:scale-[1.06]'
                        }`}
                        style={{
                          backgroundColor: iconBg,
                          boxShadow: `0 2px 8px ${iconBg}20, inset 0 1px 0 rgba(255,255,255,0.15)`,
                        }}
                      >
                        <LinkFavicon url={link.url} size="sm" />
                      </div>
                    )}

                    {/* Text */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <span className="block text-[15px] sm:text-[16px] font-semibold leading-tight truncate text-[#111]">
                        {link.title}
                      </span>
                      {link.description && (
                        <span className="block text-[12px] mt-[4px] truncate text-[#999] font-medium">
                          {link.description}
                        </span>
                      )}
                    </div>

                    {/* Arrow — squircle to match */}
                    <div className={`w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                      paymentIssue ? 'bg-black/[0.03]' : 'bg-black/[0.04] group-hover:bg-black/[0.07] group-hover:translate-x-0.5'
                    }`}>
                      <ChevronRight className="w-[13px] h-[13px] text-black/25 group-hover:text-black/45 transition-colors duration-200" />
                    </div>

                    {/* First link pulse */}
                    {idx === 0 && !paymentIssue && (
                      <div className="absolute inset-0 rounded-[18px] animate-ring-glow pointer-events-none"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                    )}
                  </motion.button>
                );

                if (page.is_nsfw) {
                  return (
                    <NsfwInlineGate
                      key={link.id}
                      url={appendUtm(link.url, utmParams)}
                      onConfirm={() => handleLinkClick(link)}
                    >
                      {linkButton}
                    </NsfwInlineGate>
                  );
                }

                return linkButton;
              })}
            </div>
          ))}
        </div>

        {/* Scarcity bottom */}
        {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'bottom' && (
          <div className="px-5 pb-4 max-w-[480px] mx-auto">
            <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
          </div>
        )}

        {/* Footer */}
        {(!page.plan || page.plan === 'free') && (
          <div className="text-center pt-8 pb-10" style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom, 40px))' }}>
            <a
              href={BRAND.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] text-[10px] text-white/15 hover:text-white/30 hover:bg-white/[0.06] transition-all duration-200"
            >
              {t('footer.madeWith')} <Heart className="w-2.5 h-2.5" /> {BRAND.name}
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
};

export default ImmersiveLayout;
