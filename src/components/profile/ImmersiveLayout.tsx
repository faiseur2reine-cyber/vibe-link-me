// src/components/profile/ImmersiveLayout.tsx
// ═══ IMMERSIVE LAYOUT ═══
// Full-screen hero, pill buttons, Public Sans, deeplink engine.

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { TapMapPin as MapPin, TapChevronRight as ChevronRight, TapChevronDown as ChevronDownIcon, TapHeart as Heart, TapShare as Share2 } from '@/components/icons/TapIcons';
import { Link } from 'react-router-dom';
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

// ── Hero image with blur-up loading ──
const HeroImage = ({ src }: { src: string }) => {
  const [loaded, setLoaded] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
  }, [src]);

  return (
    <motion.div
      className="absolute inset-0 bg-cover bg-center will-change-transform"
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: 'center 15%',
        height: '120%',
        top: '-10%',
        y,
        filter: loaded ? 'none' : 'blur(20px)',
        transform: loaded ? undefined : 'scale(1.05)',
        transition: 'filter 0.6s ease, transform 0.6s ease',
      }}
    />
  );
};

const ImmersiveLayout = ({ page, links, abVariant, paymentIssue = false }: Props) => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);

  usePageView(page.id);

  const displayName = page.display_name || page.username;
  const location = page.location || '';
  const connectedLabel = page.connected_label || 'Active now';
  const urgency = page.urgency_config;
  const showUrgency = urgency && (urgency.abTest?.enabled ? abVariant === 'A' : true);
  const clickVariant = urgency?.abTest?.enabled ? abVariant : null;
  const heroSrc = page.cover_url || page.avatar_url;

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
    if (paymentIssue) return; // links disabled during payment issue
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
      // Small visual feedback without toast (cleaner on public page)
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
        {heroSrc && <meta property="og:image" content={heroSrc} />}
        <meta name="twitter:card" content={page.cover_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={`${displayName} | MyTaptap`} />
        {heroSrc && <meta name="twitter:image" content={heroSrc} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        {page.is_nsfw && <meta name="rating" content="adult" />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "name": `${displayName} | MyTaptap`,
          "url": `${window.location.origin}/${page.username}`,
          ...(heroSrc ? { "image": heroSrc } : {}),
        })}</script>
      </Helmet>

      {showUrgency && urgency?.banner?.enabled && <ProfileUrgencyBanner config={urgency.banner} pageId={page.id} />}
      {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.locationToastEnabled && <ProfileLocationToast enabled={true} pageId={page.id} />}

      <div className="min-h-screen min-h-[100dvh] bg-black text-white" style={{ fontFamily: "'Public Sans', sans-serif" }}>

        {/* ═══ HERO ═══ */}
        <div ref={heroRef} className="relative w-full overflow-hidden" style={{ height: '62dvh', minHeight: 400, maxHeight: 560 }}>
          {/* Image with blur-up */}
          {heroSrc ? (
            <HeroImage src={heroSrc} />
          ) : (
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 8s ease infinite',
            }} />
          )}

          {/* Grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
          />

          {/* Gradient overlay — cinematic */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 20%, transparent 35%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 80%, #000 95%)',
          }} />

          {/* Share button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleShare}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/20 transition-all active:scale-90"
          >
            <Share2 className="w-3.5 h-3.5" />
          </motion.button>

          {/* Profile info at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 text-center z-10">
            <GeoGreeting enabled={page.geo_greeting_enabled !== false} className="mb-2" />

            {/* Avatar */}
            {page.avatar_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease }}
                className="flex justify-center mb-3"
              >
                <div className="relative">
                  <img
                    src={page.avatar_url}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover ring-[3px] ring-black/40 ring-offset-2 ring-offset-black/20"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-400 border-[2.5px] border-black flex items-center justify-center">
                    <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-[28px] font-bold tracking-tight leading-tight mb-2"
            >
              {displayName}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="flex items-center justify-center gap-1.5 text-[13px] text-white/45 mb-3"
            >
              {!page.avatar_url && (
                <span className="relative w-2 h-2 shrink-0">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-soft" />
                  <span className="relative block w-2 h-2 rounded-full bg-emerald-400" />
                </span>
              )}
              <span>{connectedLabel}</span>
              {location && (
                <>
                  <span className="opacity-25 mx-0.5">·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-white/30" />
                    {location}
                  </span>
                </>
              )}
            </motion.div>

            {page.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-[14px] text-white/65 leading-relaxed max-w-[320px] mx-auto mb-4"
              >
                {page.bio}
              </motion.p>
            )}

            {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'below-bio' && (
              <div className="mt-3">
                <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
              </div>
            )}

            {page.social_links.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3">
                <SocialIcons links={page.social_links} theme={getTheme('midnight')} />
              </motion.div>
            )}

            {/* Scroll indicator */}
            {links.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-5 flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-white/15"
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Scarcity above links */}
        {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'above-links' && (
          <div className="px-4 pt-4">
            <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
          </div>
        )}

        {/* ═══ BUTTONS ═══ */}
        {paymentIssue && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease }}
            className="mx-4 sm:mx-6 mt-4 max-w-[440px] sm:max-w-[480px] mx-auto"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/[0.06]">
              <span className="text-[18px] shrink-0">💤</span>
              <p className="text-[12px] text-white/50 leading-relaxed">
                Les liens de cette page sont temporairement indisponibles. Revenez bientôt !
              </p>
            </div>
          </motion.div>
        )}
        <div className={`px-4 sm:px-6 pt-5 pb-4 max-w-[440px] sm:max-w-[480px] mx-auto flex flex-col gap-3 ${paymentIssue ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section header */}
              {section.title && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + globalLinkIndex * 0.04 }}
                  className="flex items-center gap-3 mt-3 mb-2 px-1"
                >
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{section.title}</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.05, duration: 0.35, ease }}
                    onClick={(e) => { e.preventDefault(); handleLinkClick(link); }}
                    className={`group relative w-full flex items-center gap-4 rounded-full text-left transition-all duration-250 ${
                      paymentIssue
                        ? 'cursor-default'
                        : 'active:scale-[0.97] hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
                    } ${idx === 0 && !paymentIssue ? 'animate-bounce-subtle' : ''}`}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      minHeight: isFeatured ? 72 : 66,
                      padding: '11px 18px 11px 11px',
                      boxShadow: isFeatured
                        ? `0 2px 8px rgba(0,0,0,0.06), 0 0 0 1.5px ${iconBg}18, 0 8px 24px ${iconBg}14`
                        : '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Colored icon circle */}
                    <div
                      className={`w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 transition-all duration-250 ${
                        paymentIssue ? '' : 'group-hover:scale-110 group-hover:shadow-lg'
                      }`}
                      style={{
                        backgroundColor: iconBg,
                        boxShadow: `0 2px 8px ${iconBg}30`,
                      }}
                    >
                      <LinkFavicon url={link.url} size="sm" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <span className="block text-[15px] font-semibold leading-tight truncate text-black">
                        {link.title}
                      </span>
                      {link.description && (
                        <span className="block text-[12px] mt-0.5 truncate text-black/35">
                          {link.description}
                        </span>
                      )}
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 text-black/10 transition-all duration-250 ${
                      paymentIssue ? '' : 'group-hover:text-black/30 group-hover:translate-x-1'
                    }`} />

                    {/* Subtle glow on first link */}
                    {idx === 0 && !paymentIssue && (
                      <div className="absolute inset-0 rounded-full border border-black/[0.03] animate-ring-glow pointer-events-none" />
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
          <div className="px-4 pb-4">
            <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
          </div>
        )}

        {/* Footer — hidden on paid plans */}
        {(!page.plan || page.plan === 'free') && (
          <div className="text-center py-10 pb-safe">
            <a
              href={BRAND.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-white/10 hover:text-white/25 transition-colors"
            >
              {t('footer.madeWith')} <Heart className="w-2.5 h-2.5" /> {BRAND.name}
            </a>
          </div>
        )}
      </div>

      {/* Gradient shift animation for fallback hero */}
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
