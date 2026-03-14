// src/components/profile/ImmersiveLayout.tsx
// ═══ GAML-STYLE IMMERSIVE LAYOUT ═══
// Full-screen hero photo with gradient, pill buttons with round colored icons,
// Public Sans font, "Active now" indicator, bounce animation, deeplink engine.
// Used when theme === 'immersive' in PublicProfile.

import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { deeplinkNavigate } from '@/lib/deeplink';
import { appendUtm, type UtmParams } from '@/lib/utm';
import { getTheme } from '@/lib/themes';
import { recordClick } from '@/hooks/useAnalytics';
import { TrackingPixels, trackPixelClick } from '@/components/profile/TrackingPixels';
import GeoGreeting from '@/components/profile/GeoGreeting';
import NsfwInlineGate from '@/components/profile/NsfwInlineGate';
import SocialIcons from '@/components/profile/SocialIcons';
import { ProfileUrgencyBanner, ProfileScarcityWidgets, ProfileLocationToast } from '@/components/profile/UrgencyWidgets';
import LinkFavicon from '@/components/LinkFavicon';
import type { UrgencyConfig } from '@/components/dashboard/UrgencyEditor';

interface SocialLink { platform: string; url: string; }

interface PageData {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_nsfw: boolean;
  social_links: SocialLink[];
  plan?: string;
  theme?: string;
  user_id?: string;
  connected_label?: string | null;
  location?: string | null;
  urgency_config?: UrgencyConfig | null;
  // Tracking
  tracking_meta_pixel?: string | null;
  tracking_ga4?: string | null;
  tracking_tiktok_pixel?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  // GeoIP
  geo_greeting_enabled?: boolean;
  // Safe page
  safe_page_enabled?: boolean;
  safe_page_redirect_url?: string | null;
  // Allow extra fields from CreatorPageData
  [key: string]: any;
}

interface LinkData {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
  description: string | null;
  bg_color: string | null;
  text_color: string | null;
  style: string;
  section_title: string | null;
  thumbnail_url: string | null;
}

interface Props {
  page: PageData;
  links: LinkData[];
  abVariant: 'A' | 'B';
}

const ease = [0.16, 1, 0.3, 1] as const;

const ImmersiveLayout = ({ page, links, abVariant }: Props) => {
  const { t } = useTranslation();
  const displayName = page.display_name || page.username;
  const location = page.location || '';
  const connectedLabel = page.connected_label || 'Active now';
  const urgency = page.urgency_config;
  const showUrgency = urgency && (urgency.abTest?.enabled ? abVariant === 'A' : true);
  const clickVariant = urgency?.abTest?.enabled ? abVariant : null;

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
    const finalUrl = appendUtm(link.url, utmParams);
    recordClick(link.id, clickVariant);
    trackPixelClick(link.title, trackingConfig);
    deeplinkNavigate(finalUrl);
  };

  return (
    <>
      <TrackingPixels {...trackingConfig} />

      <Helmet>
        <title>{`${displayName} | MyTaptap`}</title>
        <meta name="description" content={page.bio || `${displayName}'s links`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        {page.is_nsfw && <meta name="rating" content="adult" />}
      </Helmet>

      {showUrgency && urgency?.banner?.enabled && <ProfileUrgencyBanner config={urgency.banner} pageId={page.id} />}
      {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.locationToastEnabled && <ProfileLocationToast enabled={true} pageId={page.id} />}

      <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Public Sans', sans-serif" }}>

        {/* ═══ HERO ═══ */}
        <div className="relative w-full" style={{ height: '65vh', minHeight: 420, maxHeight: 580 }}>
          {/* Photo */}
          {page.cover_url && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${page.cover_url})`, backgroundPosition: 'center 12%' }}
            />
          )}
          {!page.cover_url && page.avatar_url && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${page.avatar_url})`, backgroundPosition: 'center 12%' }}
            />
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 15%, rgba(0,0,0,0.04) 35%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.92) 80%, #000 92%)',
            }}
          />

          {/* Profile section */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 text-center z-10">
            {/* GeoIP greeting */}
            <GeoGreeting
              enabled={page.geo_greeting_enabled !== false}
              className="mb-2"
            />

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-[26px] font-bold tracking-tight leading-tight mb-2"
            >
              {displayName}
            </motion.h1>

            {/* Meta: Active now · Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center justify-center gap-1.5 text-sm text-white/50 mb-3"
            >
              <span className="relative w-2 h-2 shrink-0">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-soft" />
                <span className="relative block w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span>{connectedLabel}</span>
              {location && (
                <>
                  <span className="opacity-30 mx-0.5">·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3.5 h-3.5 text-white/40" />
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
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-[15px] text-white/80 leading-relaxed max-w-xs mx-auto mb-4"
              >
                {page.bio}
              </motion.p>
            )}

            {/* Scarcity below bio */}
            {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'below-bio' && (
              <div className="mt-3">
                <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
              </div>
            )}

            {/* Social icons */}
            {page.social_links.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-3"
              >
                <SocialIcons links={page.social_links} theme={getTheme('midnight')} />
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
        <div className="px-4 pt-5 pb-4 max-w-[480px] mx-auto flex flex-col gap-4">
          {links.map((link, idx) => {
            const isFirst = idx === 0;
            // In immersive: buttons are ALWAYS white, icon circle gets the platform color
            const iconBg = link.bg_color && link.bg_color !== '#FFFFFF' && link.bg_color !== '#ffffff'
              ? link.bg_color
              : '#e8503a'; // fallback red if no color set
            const isDarkIcon = isColorDark(iconBg);

            const linkButton = (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.06, duration: 0.4, ease }}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link);
                }}
                className={`group relative w-full flex items-center gap-4 rounded-full text-left transition-all duration-200 active:scale-[0.98] hover:-translate-y-[1px] ${isFirst ? 'animate-bounce-subtle' : ''}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  minHeight: 68,
                  padding: '12px 20px 12px 12px',
                }}
              >
                {/* Round colored icon */}
                <div
                  className="w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: iconBg }}
                >
                  <LinkFavicon url={link.url} size="sm" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold leading-tight truncate text-black">
                    {link.title}
                  </span>
                  {link.description && (
                    <span className="block text-[12px] mt-0.5 truncate text-black/40">
                      {link.description}
                    </span>
                  )}
                </div>

                <ChevronRight
                  className="w-4 h-4 shrink-0 text-black/15 group-hover:text-black/30 group-hover:translate-x-0.5 transition-all"
                />

                {/* Subtle glow ring on first link */}
                {isFirst && (
                  <div className="absolute inset-0 rounded-full border border-black/[0.04] animate-ring-glow pointer-events-none" />
                )}

                {/* Popular badge on first link */}
                {isFirst && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 180, damping: 15 }}
                    className="absolute -top-2.5 right-4 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/20 backdrop-blur-md"
                  >
                    🔥 Popular
                  </motion.span>
                )}
              </motion.button>
            );

            // Wrap with NSFW gate if page is NSFW
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

        {/* Scarcity bottom */}
        {showUrgency && urgency?.scarcity?.enabled && urgency.scarcity.position === 'bottom' && (
          <div className="px-4 pb-4">
            <ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} />
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-10 pb-safe">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[10px] text-white/10 hover:text-white/25 transition-colors"
          >
            {t('footer.madeWith')} <Heart className="w-2.5 h-2.5" /> MyTaptap
          </Link>
        </div>
      </div>
    </>
  );
};

function isColorDark(hex: string): boolean {
  try {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } catch { return false; }
}

export default ImmersiveLayout;
