// src/components/profile/ImmersiveLayout.tsx
// ═══ IMMERSIVE LINK-IN-BIO — v2 ═══
// Full-bleed cover photo behind everything. Content scrolls over.
// No round profile pic as hero — the cover IS the hero.

import { motion } from 'framer-motion';
import { TapMapPin as MapPin, TapHeart as Heart, TapShare as Share2 } from '@/components/icons/TapIcons';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { deeplinkNavigate, detectBrowser } from '@/lib/deeplink';
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

const ImmersiveLayout = ({ page, links, abVariant, paymentIssue = false }: Props) => {
  const { t } = useTranslation();
  const [browserInfo] = useState(() => detectBrowser());
  const [imgLoaded, setImgLoaded] = useState(false);

  usePageView(page.id);

  const displayName = page.display_name || page.username;
  const location = page.location || '';
  const connectedLabel = page.connected_label || 'Active now';
  const urgency = page.urgency_config;
  const showUrgency = urgency && (urgency.abTest?.enabled ? abVariant === 'A' : true);
  const clickVariant = urgency?.abTest?.enabled ? abVariant : null;
  const coverSrc = page.cover_url || null;
  const ogImage = page.cover_url || page.avatar_url;

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

  const handleLinkClick = throttleClick((link: LinkData) => {
    if (paymentIssue) return;
    const finalUrl = appendUtm(link.url, utmParams);
    recordClick(link.id, clickVariant);
    trackPixelClick(link.title, trackingConfig);
    deeplinkNavigate(finalUrl);
  }, 400);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: displayName, url });
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
      <Helmet>
        <TrackingPixels {...trackingConfig} />
        <title>{displayName} | MyTaptap</title>
        <meta name="description" content={page.bio || `${displayName}'s links`} />
        {page.is_nsfw && <meta name="robots" content="noindex, nofollow" />}
        <meta property="og:title" content={`${displayName} | MyTaptap`} />
        <meta property="og:description" content={page.bio || `${displayName}'s links`} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
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

      <div className="relative min-h-screen min-h-[100dvh] bg-[#0a0a0a] text-white antialiased overflow-x-hidden" style={{ fontFamily: "'Public Sans', -apple-system, sans-serif" }}>

        {/* ═══ FIXED BACKGROUND ═══ */}
        <div className="fixed inset-0 z-0">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              fetchPriority="high"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover object-center"
              style={{
                filter: imgLoaded ? 'none' : 'blur(24px)',
                transform: imgLoaded ? 'scale(1)' : 'scale(1.05)',
                transition: 'filter 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          ) : (
            <div className="w-full h-full" style={{
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1035 35%, #0d2847 65%, #0a1628 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradient-shift 12s ease infinite',
            }} />
          )}
          {/* Film grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
          />
        </div>

        {/* ═══ SCROLLABLE CONTENT ═══ */}
        <div className="relative z-10">

          {/* ── In-app banner ── */}
          {browserInfo.isInApp && (
            <button
              onClick={() => {
                const goUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/go?url=${encodeURIComponent(window.location.href)}`;
                window.location.href = goUrl;
              }}
              className="sticky top-0 z-50 w-full bg-white flex items-center justify-between gap-3 active:bg-gray-50 transition-colors"
              style={{
                padding: 'max(14px, env(safe-area-inset-top, 14px)) 20px 14px 20px',
                minHeight: 56,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[14px] font-bold text-black">Ouvrir dans le navigateur</p>
                <p className="text-[11px] text-black/40 mt-0.5">Appuie ici pour une meilleure expérience</p>
              </div>
              <span className="shrink-0 bg-black text-white text-[13px] font-bold px-5 py-2.5 rounded-full">
                Ouvrir
              </span>
            </button>
          )}

          {/* ── Share button ── */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleShare}
            className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 transition-all active:scale-90"
            style={{ top: 'max(16px, env(safe-area-inset-top, 16px))' }}
          >
            <Share2 className="w-4 h-4" />
          </motion.button>

          {/* ── Photo spacer — lets the user see the cover photo ── */}
          <div style={{ height: '62dvh', minHeight: 340 }} />

          {/* ── Content overlay — fades from transparent to dark ── */}
          <div className="relative">
            {/* Gradient fade into content */}
            <div className="absolute -top-[160px] left-0 right-0 h-[160px] pointer-events-none" style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.4) 30%, rgba(10,10,10,0.8) 65%, #0a0a0a 100%)',
            }} />

            <div className="bg-[#0a0a0a]">
              {/* ── Profile ── */}
              <div className="max-w-[480px] mx-auto px-6">
                <GeoGreeting enabled={page.geo_greeting_enabled !== false} className="mb-4" />

                {/* Name + avatar row */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease }}
                  className="flex items-center gap-4"
                >
                  {page.avatar_url && (
                    <img
                      src={page.avatar_url}
                      alt={displayName}
                      width={52}
                      height={52}
                      decoding="async"
                      fetchPriority="high"
                      className="w-[52px] h-[52px] rounded-full object-cover shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                      style={{ border: '2px solid rgba(255,255,255,0.12)' }}
                    />
                  )}
                  <div className="min-w-0">
                    <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.02em] leading-none line-clamp-2">
                      {displayName}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-2 text-[12px] text-white/40">
                      <span className="relative w-[6px] h-[6px] shrink-0">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                        <span className="relative block w-[6px] h-[6px] rounded-full bg-emerald-400" />
                      </span>
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
                    </div>
                  </div>
                </motion.div>

                {/* Bio */}
                {page.bio && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.12, duration: 0.4 }}
                    className="text-[14px] text-white/50 leading-[1.65] mt-4 line-clamp-3"
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-5">
                    <SocialIcons links={page.social_links} theme={getTheme('midnight')} />
                  </motion.div>
                )}
              </div>

              {/* Scarcity above links */}
              {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'above-links' && (
                <div className="px-6 pt-5 max-w-[480px] mx-auto">
                  <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
                </div>
              )}

              {/* ── LINKS ── */}
              {paymentIssue && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease }}
                  className="px-6 mt-5 max-w-[480px] mx-auto"
                >
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.05]">
                    <span className="text-[17px] shrink-0">💤</span>
                    <p className="text-[12px] text-white/40 leading-relaxed">
                      Les liens de cette page sont temporairement indisponibles. Revenez bientôt !
                    </p>
                  </div>
                </motion.div>
              )}

              <div className={`px-6 pt-7 pb-8 max-w-[480px] mx-auto flex flex-col gap-[14px] ${paymentIssue ? 'opacity-30 pointer-events-none select-none' : ''}`}>
                {links.length === 0 && !paymentIssue && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-8">
                    <p className="text-[13px] text-white/20">Pas encore de liens</p>
                  </motion.div>
                )}

                {sections.map((section, sIdx) => (
                  <div key={sIdx}>
                    {section.title && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-3 mt-2 mb-2 px-1"
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
                        ? link.bg_color : '#e8503a';

                      const linkButton = (
                        <motion.button
                          key={link.id}
                          initial={{ opacity: 0, y: 14 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-10px' }}
                          transition={{ delay: idx < 5 ? idx * 0.06 : 0, duration: 0.45, ease }}
                          onClick={(e) => { e.preventDefault(); handleLinkClick(link); }}
                          className={`group relative w-full flex items-center gap-3 text-left ${
                            paymentIssue ? 'cursor-default' : ''
                          }`}
                          style={{
                            background: isFeatured ? iconBg : 'rgba(255,255,255,0.97)',
                            borderRadius: 16,
                            padding: '12px 16px',
                            border: isFeatured ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: isFeatured
                              ? `0 4px 20px ${iconBg}40, 0 2px 8px rgba(0,0,0,0.15)`
                              : '0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
                            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
                            transform: 'translateY(0)',
                            WebkitTapHighlightColor: 'transparent',
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
                            },
                            onMouseEnter: (e: React.MouseEvent) => {
                              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                              (e.currentTarget as HTMLElement).style.boxShadow = isFeatured
                                ? `0 8px 32px ${iconBg}50, 0 4px 12px rgba(0,0,0,0.2)`
                                : '0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.1)';
                            },
                          } : {})}
                        >
                          {link.thumbnail_url ? (
                            <div className={`w-[44px] h-[44px] rounded-[12px] overflow-hidden shrink-0 transition-transform duration-200 ${
                              paymentIssue ? '' : 'group-hover:scale-[1.06]'
                            }`}>
                              <img src={link.thumbnail_url} alt={link.title} width={44} height={44} decoding="async" loading="lazy" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div
                              className={`w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                paymentIssue ? '' : 'group-hover:scale-[1.06]'
                              }`}
                              style={{
                                backgroundColor: isFeatured ? 'rgba(255,255,255,0.2)' : iconBg,
                                boxShadow: isFeatured ? 'none' : `0 2px 8px ${iconBg}25`,
                              }}
                            >
                              <LinkFavicon url={link.url} size="sm" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className={`block font-bold leading-tight truncate ${
                              isFeatured ? 'text-[16px] sm:text-[17px] text-white' : 'text-[15px] sm:text-[16px] text-[#111]'
                            }`}>
                              {link.title}
                            </span>
                            {link.description && (
                              <span className={`block text-[12px] mt-[3px] truncate font-medium ${
                                isFeatured ? 'text-white/60' : 'text-[#999]'
                              }`}>
                                {link.description}
                              </span>
                            )}
                          </div>

                          {idx === 0 && !paymentIssue && (
                            <div className="absolute inset-0 rounded-[16px] animate-ring-glow pointer-events-none"
                              style={{ border: isFeatured ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)' }}
                            />
                          )}
                        </motion.button>
                      );

                      if (page.is_nsfw) {
                        return (
                          <NsfwInlineGate key={link.id} url={appendUtm(link.url, utmParams)} onConfirm={() => handleLinkClick(link)}>
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
                <div className="px-6 pb-4 max-w-[480px] mx-auto">
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
          </div>
        </div>
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
