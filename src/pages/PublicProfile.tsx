import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme } from '@/lib/themes';
import { recordClick } from '@/hooks/useAnalytics';
import { toast } from '@/hooks/use-toast';
import LinkFavicon from '@/components/LinkFavicon';
import SocialIcons from '@/components/profile/SocialIcons';
import NsfwLinkOverlay from '@/components/profile/NsfwLinkOverlay';
import { ProfileUrgencyBanner, ProfileScarcityWidgets, ProfileLocationToast } from '@/components/profile/UrgencyWidgets';
import type { UrgencyConfig } from '@/components/dashboard/UrgencyEditor';

interface SocialLink { platform: string; url: string; }

interface CreatorPageData {
  id: string; username: string; display_name: string | null;
  bio: string | null; avatar_url: string | null; cover_url: string | null;
  theme: string; user_id: string; is_nsfw: boolean; social_links: SocialLink[];
  custom_bg_color?: string | null; custom_text_color?: string | null;
  custom_accent_color?: string | null; custom_btn_color?: string | null;
  custom_btn_text_color?: string | null; custom_font?: string;
  link_layout?: string; custom_css?: string | null;
  urgency_config?: UrgencyConfig | null;
}

interface LinkItem {
  id: string; title: string; url: string; icon: string; position: number;
  thumbnail_url: string | null; description: string | null;
  bg_color: string | null; text_color: string | null;
  style: string; section_title: string | null;
}

/* ── Animation presets ── */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.045 } } };
const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const [page, setPage] = useState<CreatorPageData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [abVariant, setAbVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|slackbot|discordbot|googlebot/i.test(ua)) return;

    const fetchData = async () => {
      if (!username) return;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/public-profile?username=${encodeURIComponent(username)}`,
          { headers: { apikey: anonKey } },
        );
        if (res.status === 429 || res.status === 404) { setNotFound(true); setLoading(false); return; }
        const result = await res.json();
        if (result.page) {
          const pageData = { ...result.page, social_links: (result.page.social_links as unknown as SocialLink[]) || [] } as CreatorPageData;
          setPage(pageData);
          setLinks((result.links as LinkItem[]) || []);
          const uc = pageData.urgency_config;
          if (uc?.abTest?.enabled) {
            const storageKey = `ab_${pageData.id}`;
            const stored = sessionStorage.getItem(storageKey);
            if (stored === 'A' || stored === 'B') { setAbVariant(stored); }
            else {
              const variant = Math.random() * 100 < (uc.abTest.splitPercent ?? 50) ? 'A' : 'B';
              sessionStorage.setItem(storageKey, variant);
              setAbVariant(variant);
            }
          }
        } else { setNotFound(true); }
      } catch { setNotFound(true); }
      setLoading(false);
    };
    fetchData();
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: page?.display_name || username, url }); }
    else { await navigator.clipboard.writeText(url); toast({ title: t('common.success'), description: 'Link copied!' }); }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white"
        />
      </div>
    );
  }

  /* ── 404 ── */
  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 px-4">
        <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl font-bold text-white">404</motion.h1>
        <p className="text-white/50">{t('public.notFound')}</p>
        <Link to="/" className="text-white/70 hover:text-white underline font-medium">{t('public.backHome')}</Link>
      </div>
    );
  }

  const isNsfwPage = page.is_nsfw;
  const theme = getTheme(page.theme);
  const displayName = page.display_name || page.username;
  const pageTitle = `${displayName} | MyTaptap`;
  const pageDescription = page.bio || `Check out ${displayName}'s links on MyTaptap`;
  const hasCustomColors = page.custom_bg_color || page.custom_text_color;
  const fontFamily = page.custom_font && page.custom_font !== 'default'
    ? `'${page.custom_font.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}', sans-serif` : undefined;
  const linkLayout = page.link_layout || 'list';
  const fontUrl = page.custom_font && page.custom_font !== 'default'
    ? `https://fonts.googleapis.com/css2?family=${page.custom_font.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('+')}&display=swap` : null;
  const isDarkTheme = page.theme === 'midnight' || page.theme === 'neon' || page.theme === 'glass_dark' ||
    (page.custom_bg_color && isColorDark(page.custom_bg_color));
  const urgency = page.urgency_config;
  const showUrgencyWidgets = urgency && (urgency.abTest?.enabled ? abVariant === 'A' : true);
  const clickVariant = urgency?.abTest?.enabled ? abVariant : null;

  const ScarcityBlock = () => (
    showUrgencyWidgets && urgency?.scarcity?.enabled ? (
      <div className="mt-4"><ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} /></div>
    ) : null
  );

  // Group links into sections
  const sections: { title: string | null; links: LinkItem[] }[] = [];
  links.forEach(link => {
    const key = link.section_title || null;
    const existing = sections.find(s => s.title === key);
    if (existing) existing.links.push(link);
    else sections.push({ title: key, links: [link] });
  });

  const wrapNsfw = (node: React.ReactNode, link: LinkItem) =>
    isNsfwPage ? (
      <NsfwLinkOverlay key={link.id} url={link.url} onRevealClick={() => recordClick(link.id, clickVariant)}>
        {node}
      </NsfwLinkOverlay>
    ) : node;

  return (
    <>
      {showUrgencyWidgets && urgency?.banner?.enabled && <ProfileUrgencyBanner config={urgency.banner} pageId={page.id} />}
      {showUrgencyWidgets && urgency?.scarcity?.enabled && urgency.scarcity.locationToastEnabled && <ProfileLocationToast enabled={true} pageId={page.id} />}

      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/${username}`} />
        {page.avatar_url && <meta property="og:image" content={page.avatar_url} />}
        {page.is_nsfw && <meta name="rating" content="adult" />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {fontUrl && <link rel="stylesheet" href={fontUrl} />}
        {page.custom_css && <style>{page.custom_css}</style>}
      </Helmet>

      <div
        className={`page-container min-h-screen min-h-[100dvh] ${hasCustomColors ? '' : theme.bg} flex flex-col items-center relative overflow-hidden`}
        style={{
          ...(page.custom_bg_color ? { backgroundColor: page.custom_bg_color } : {}),
          ...(fontFamily ? { fontFamily } : {}),
        }}
      >
        {/* ── Cover ── */}
        {page.cover_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full h-48 sm:h-64 md:h-72 relative"
          >
            <img
              src={page.cover_url} alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />
          </motion.div>
        )}

        {/* ── Main content ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className={`w-full max-w-lg mx-auto px-5 sm:px-6 ${page.cover_url ? '-mt-16 sm:-mt-20' : 'pt-10 sm:pt-14'} pb-8 safe-area-bottom relative z-10`}
        >
          {/* Profile header */}
          <div className="profile-header text-center relative">
            {/* Share button */}
            <motion.button
              variants={fadeUp}
              onClick={handleShare}
              className={`absolute -top-1 right-0 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                isDarkTheme || page.cover_url
                  ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  : `bg-black/5 text-black/40 hover:bg-black/10 hover:text-black/70`
              }`}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            {/* Avatar */}
            <motion.div variants={scaleIn} className="flex justify-center">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ${
                page.cover_url
                  ? 'ring-[3px] ring-white/20 shadow-2xl shadow-black/30'
                  : theme.avatarRing
              }`}>
                {page.avatar_url ? (
                  <img src={page.avatar_url} alt={displayName} className="w-full h-full object-cover" loading="eager" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDarkTheme ? 'bg-white/10' : 'bg-primary'}`}>
                    <span className="text-2xl sm:text-3xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Name + bio */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-4 space-y-1">
              <h1
                className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-tight ${hasCustomColors ? '' : theme.text}`}
                style={page.custom_text_color ? { color: page.custom_text_color } : {}}
              >
                {displayName}
              </h1>
              <p
                className={`text-xs font-medium ${hasCustomColors ? 'opacity-40' : theme.subtleText}`}
                style={page.custom_text_color ? { color: page.custom_text_color, opacity: 0.4 } : {}}
              >
                @{page.username}
              </p>
            </motion.div>

            {page.bio && (
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, ease }}
                className={`text-sm mt-3 leading-relaxed max-w-xs mx-auto ${theme.text} opacity-60`}
                style={page.custom_text_color ? { color: page.custom_text_color } : {}}
              >
                {page.bio.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                  /^https?:\/\//.test(part) ? (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                      className={`${theme.accent} underline underline-offset-2 hover:opacity-80 transition-opacity`}
                      onClick={e => e.stopPropagation()}
                    >
                      {part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  ) : <span key={i}>{part}</span>
                )}
              </motion.p>
            )}

            {/* Social icons */}
            {page.social_links.length > 0 && (
              <motion.div variants={fadeUp} className="mt-4">
                <SocialIcons links={page.social_links} theme={theme} />
              </motion.div>
            )}

            {urgency?.scarcity?.position === 'below-bio' && <ScarcityBlock />}
          </div>

          {urgency?.scarcity?.position === 'above-links' && <ScarcityBlock />}

          {/* ── Links ── */}
          <motion.div variants={stagger} className="mt-6 space-y-4">
            {sections.map((section, sIdx) => (
              <motion.div key={sIdx} variants={fadeUp} className="space-y-2">
                {section.title && (
                  <div className="flex items-center gap-3 px-1 pb-1">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${hasCustomColors ? 'opacity-35' : theme.subtleText}`}
                      style={page.custom_text_color ? { color: page.custom_text_color } : {}}
                    >
                      {section.title}
                    </span>
                    <div className={`h-px flex-1 ${isDarkTheme ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
                  </div>
                )}

                <div className={linkLayout === 'grid-2' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                  {section.links.map((link) => {
                    const isFeatured = link.style === 'featured';
                    const isCard = link.style === 'card' || !!link.thumbnail_url;
                    const isMinimal = link.style === 'minimal' || linkLayout === 'minimal';
                    const customBtnBg = link.bg_color || page.custom_btn_color;
                    const customBtnText = link.text_color || page.custom_btn_text_color;

                    /* Card with thumbnail */
                    if (isCard && link.thumbnail_url) {
                      return wrapNsfw(
                        <motion.a
                          key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => recordClick(link.id, clickVariant)}
                          variants={fadeUp}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}
                          className="group relative rounded-2xl overflow-hidden aspect-[2.4/1] transition-shadow duration-300 hover:shadow-lg"
                        >
                          <img src={link.thumbnail_url} alt={link.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3.5">
                            <p className="text-white text-sm font-semibold truncate" style={customBtnText ? { color: customBtnText } : {}}>{link.title}</p>
                            {link.description && <p className="text-white/45 text-xs mt-0.5 truncate">{link.description}</p>}
                          </div>
                        </motion.a>,
                        link,
                      );
                    }

                    /* Featured */
                    if (isFeatured) {
                      return wrapNsfw(
                        <motion.a
                          key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => recordClick(link.id, clickVariant)}
                          variants={fadeUp}
                          whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                          className={`link-item group flex items-center gap-3.5 px-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${customBtnBg ? '' : theme.btn}`}
                          style={{
                            ...(customBtnBg ? { backgroundColor: customBtnBg } : {}),
                            ...(customBtnText ? { color: customBtnText } : {}),
                          }}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDarkTheme ? 'bg-white/[0.08]' : 'bg-black/[0.04]'}`}>
                            <LinkFavicon url={link.url} size="md" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{link.title}</span>
                            {link.description && <span className="block text-xs font-normal opacity-45 truncate mt-0.5">{link.description}</span>}
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-25 transition-opacity duration-300 shrink-0" />
                        </motion.a>,
                        link,
                      );
                    }

                    /* Minimal */
                    if (isMinimal) {
                      return wrapNsfw(
                        <motion.a
                          key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => recordClick(link.id, clickVariant)}
                          variants={fadeUp}
                          whileTap={{ scale: 0.98 }}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${theme.text} ${isDarkTheme ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'}`}
                          style={{
                            ...(customBtnBg ? { backgroundColor: customBtnBg } : {}),
                            ...(customBtnText ? { color: customBtnText } : {}),
                          }}
                        >
                          <LinkFavicon url={link.url} size="sm" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{link.title}</span>
                            {link.description && <p className="text-xs opacity-35 truncate">{link.description}</p>}
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-25 transition-opacity duration-300 shrink-0" />
                        </motion.a>,
                        link,
                      );
                    }

                    /* Default — clean & modern */
                    return wrapNsfw(
                      <motion.a
                        key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                        onClick={() => recordClick(link.id, clickVariant)}
                        variants={fadeUp}
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                        className={`link-item group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${customBtnBg ? '' : theme.btn}`}
                        style={{
                          ...(customBtnBg ? { backgroundColor: customBtnBg } : {}),
                          ...(customBtnText ? { color: customBtnText } : {}),
                        }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDarkTheme ? 'bg-white/[0.06]' : 'bg-black/[0.03]'}`}>
                          <LinkFavicon url={link.url} size="sm" />
                        </div>
                        <span className="flex-1 truncate">{link.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-20 transition-opacity duration-300 shrink-0" />
                      </motion.a>,
                      link,
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {urgency?.scarcity?.position === 'bottom' && <ScarcityBlock />}

          {/* Footer */}
          <motion.div variants={fadeUp} className="pt-12 pb-4 safe-area-bottom">
            <Link
              to="/"
              className={`flex items-center justify-center gap-1.5 text-[11px] font-medium opacity-15 hover:opacity-35 transition-opacity ${theme.text}`}
            >
              {t('footer.madeWith')} <Heart className="w-3 h-3" /> MyTaptap
            </Link>
          </motion.div>
        </motion.div>
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

export default PublicProfile;
