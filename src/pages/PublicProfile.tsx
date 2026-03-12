import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Heart, Share2, ChevronRight, Check, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/themes';
import { recordClick } from '@/hooks/useAnalytics';
import { toast } from '@/hooks/use-toast';
import LinkFavicon from '@/components/LinkFavicon';
import ParticleField from '@/components/profile/ParticleField';
import SocialIcons from '@/components/profile/SocialIcons';
import NsfwLinkOverlay from '@/components/profile/NsfwLinkOverlay';
import { ProfileUrgencyBanner, ProfileScarcityWidgets, ProfileLocationToast } from '@/components/profile/UrgencyWidgets';
import type { UrgencyConfig } from '@/components/dashboard/UrgencyEditor';

interface SocialLink { platform: string; url: string; }

interface CreatorPageData {
  id: string; username: string; display_name: string | null;
  bio: string | null; avatar_url: string | null; cover_url: string | null;
  theme: string; user_id: string; is_nsfw: boolean; social_links: SocialLink[];
  plan?: string;
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
const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const scaleIn = {
  hidden: { scale: 0.85, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
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
          className="w-6 h-6 rounded-full border-2 border-white/15 border-t-white/80"
        />
      </div>
    );
  }

  /* ── 404 ── */
  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-white/[0.015] blur-[120px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-white/90 to-white/20 bg-clip-text text-transparent select-none"
          >
            404
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-white/40 text-base sm:text-lg font-medium max-w-xs">
            {t('public.notFound', 'This page doesn\'t exist — yet.')}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link to="/" className="px-6 py-2.5 rounded-full bg-white text-[#0a0a0a] text-sm font-semibold hover:bg-white/90 transition-all duration-200 hover:-translate-y-0.5">
              {t('public.backHome', 'Go Home')}
            </Link>
            <Link to={`/auth?tab=signup&username=${encodeURIComponent(username || '')}`} className="px-6 py-2.5 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:border-white/25 hover:text-white/80 transition-all duration-200">
              {t('public.claimPage', 'Claim this page')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const isDemo = username === 'demo';
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
    page.theme === 'aurora' || page.theme === 'cyber' ||
    (page.custom_bg_color && isColorDark(page.custom_bg_color));
  const urgency = page.urgency_config;
  const showUrgencyWidgets = urgency && (urgency.abTest?.enabled ? abVariant === 'A' : true);
  const clickVariant = urgency?.abTest?.enabled ? abVariant : null;

  const ScarcityBlock = () => (
    showUrgencyWidgets && urgency?.scarcity?.enabled ? (
      <div className="mt-5"><ProfileScarcityWidgets config={urgency.scarcity} pageId={page.id} /></div>
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

  // In demo mode, prevent link navigation
  const demoLinkProps = isDemo ? {
    href: undefined as unknown as string,
    target: undefined as unknown as string,
    rel: undefined as unknown as string,
    onClick: (e: React.MouseEvent) => e.preventDefault(),
    style: { cursor: 'default' as const },
  } : {};

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
        {/* ── Ambient background effects ── */}
        {isDarkTheme && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 blur-[150px] pointer-events-none"
              style={{ background: page.custom_accent_color || (page.theme === 'neon' ? 'rgba(217,70,239,0.08)' : page.theme === 'aurora' ? 'rgba(52,211,153,0.06)' : page.theme === 'cyber' ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.02)') }}
            />
            <ParticleField
              color={page.theme === 'neon' ? '217,70,239' : page.theme === 'aurora' ? '52,211,153' : page.theme === 'cyber' ? '34,211,238' : '255,255,255'}
              count={35}
              className="z-0 opacity-60"
            />
          </>
        )}

        {/* ── Cover image ── */}
        {page.cover_url && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease }}
            className="w-full h-52 sm:h-64 md:h-72 relative"
          >
            <img src={page.cover_url} alt="" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          </motion.div>
        )}

        {/* ── Main content card ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className={`w-full max-w-[440px] mx-auto ${page.cover_url ? '-mt-20 sm:-mt-24' : 'pt-12 sm:pt-16'} pb-8 safe-area-bottom relative z-10`}
        >
          {/* Glassmorphism wrapper for dark themes */}
          <div className={`px-5 sm:px-6 py-6 rounded-[28px] ${
            isDarkTheme
              ? 'bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-[0_8px_60px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]'
              : ''
          }`}
            style={isDarkTheme ? {
              background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
            } : {}}
          >
          {/* ── Profile header ── */}
          <div className="profile-header text-center relative">
            {/* Share pill */}
            <motion.button
              variants={fadeUp}
              onClick={handleShare}
              className={`absolute -top-1 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium backdrop-blur-xl transition-all duration-300 active:scale-90 ${
                isDarkTheme || page.cover_url
                  ? 'bg-white/[0.08] text-white/50 hover:bg-white/[0.14] hover:text-white/80 border border-white/[0.06]'
                  : 'bg-black/[0.04] text-black/35 hover:bg-black/[0.08] hover:text-black/60 border border-black/[0.04]'
              }`}
            >
              <Share2 className="w-3 h-3" />
              Share
            </motion.button>

            {/* Avatar with online indicator */}
            <motion.div variants={scaleIn} className="flex justify-center">
              <div className="relative">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ${
                  page.cover_url
                    ? 'ring-4 ring-white/20 shadow-2xl shadow-black/40'
                    : theme.avatarRing
                }`}>
                  {page.avatar_url ? (
                    <img src={page.avatar_url} alt={displayName} className="w-full h-full object-cover" loading="eager" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      isDarkTheme
                        ? 'bg-gradient-to-br from-white/15 to-white/5'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <span className={`text-3xl sm:text-4xl font-bold ${isDarkTheme ? 'text-white/80' : 'text-gray-500'}`}>
                        {displayName[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-400 border-[3px] border-current shadow-lg shadow-emerald-500/30"
                  style={{ borderColor: isDarkTheme ? '#0a0a0f' : page.custom_bg_color || '#fafafa' }}
                >
                  <div className="w-full h-full rounded-full animate-ping bg-emerald-400 opacity-40" />
                </div>
              </div>
            </motion.div>

            {/* Name + bio */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-5 space-y-1.5">
              <h1
                className={`text-[22px] sm:text-2xl font-bold tracking-[-0.02em] leading-tight ${hasCustomColors ? '' : theme.text} flex items-center justify-center gap-1.5`}
                style={page.custom_text_color ? { color: page.custom_text_color } : {}}
              >
                {displayName}
                {(page.plan === 'starter' || page.plan === 'pro') && (
                  <span className="relative inline-flex items-center justify-center w-[22px] h-[22px] sm:w-6 sm:h-6 shrink-0" title="Verified creator">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/25" />
                    <Check className="relative w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[3]" />
                  </span>
                )}
              </h1>
              <p
                className={`text-xs font-medium tracking-wide ${hasCustomColors ? 'opacity-30' : theme.subtleText}`}
                style={page.custom_text_color ? { color: page.custom_text_color, opacity: 0.3 } : {}}
              >
                @{page.username}
              </p>
            </motion.div>

            {page.bio && (
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5, ease }}
                className={`text-[13px] sm:text-sm mt-3 leading-relaxed max-w-[320px] mx-auto ${theme.text} opacity-50`}
                style={page.custom_text_color ? { color: page.custom_text_color } : {}}
              >
                {page.bio.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                  /^https?:\/\//.test(part) ? (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                      className={`${theme.accent} underline underline-offset-2 decoration-current/30 hover:decoration-current/60 transition-all`}
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
              <motion.div variants={fadeUp} className="mt-5">
                <SocialIcons links={page.social_links} theme={theme} />
              </motion.div>
            )}

            {urgency?.scarcity?.position === 'below-bio' && <ScarcityBlock />}
          </div>

          {urgency?.scarcity?.position === 'above-links' && <ScarcityBlock />}

          {/* ── Links ── */}
          <motion.div variants={stagger} className="mt-8 space-y-5">
            {sections.map((section, sIdx) => (
              <motion.div key={sIdx} variants={fadeUp} className="space-y-2.5">
                {section.title && (
                  <div className="flex items-center gap-3 px-1 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.15em] ${hasCustomColors ? 'opacity-25' : theme.subtleText}`}
                      style={page.custom_text_color ? { color: page.custom_text_color } : {}}
                    >
                      {section.title}
                    </span>
                    <div className={`h-px flex-1 ${isDarkTheme ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`} />
                  </div>
                )}

                <div className={linkLayout === 'grid-2' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}>
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
                          key={link.id} href={isDemo ? undefined : link.url} target={isDemo ? undefined : "_blank"} rel={isDemo ? undefined : "noopener noreferrer"}
                          onClick={(e) => { if (isDemo) { e.preventDefault(); return; } recordClick(link.id, clickVariant); }}
                          variants={fadeUp}
                          whileHover={isDemo ? {} : { scale: 1.015, y: -2 }} whileTap={isDemo ? {} : { scale: 0.98 }}
                          className={`group relative rounded-[20px] overflow-hidden aspect-[2.2/1] transition-shadow duration-500 ${isDemo ? 'cursor-default opacity-80' : 'hover:shadow-2xl'}`}
                        >
                          <img src={link.thumbnail_url} alt={link.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-sm font-semibold tracking-tight" style={customBtnText ? { color: customBtnText } : {}}>{link.title}</p>
                            {link.description && <p className="text-white/40 text-xs mt-0.5 truncate">{link.description}</p>}
                          </div>
                        </motion.a>,
                        link,
                      );
                    }

                    /* Featured — larger, more prominent */
                    if (isFeatured) {
                      return wrapNsfw(
                        <motion.a
                          key={link.id} href={isDemo ? undefined : link.url} target={isDemo ? undefined : "_blank"} rel={isDemo ? undefined : "noopener noreferrer"}
                          onClick={(e) => { if (isDemo) { e.preventDefault(); return; } recordClick(link.id, clickVariant); }}
                          variants={fadeUp}
                          whileHover={isDemo ? {} : { y: -3, scale: 1.01 }} whileTap={isDemo ? {} : { scale: 0.98 }}
                          className={`link-item group relative flex items-center gap-4 px-4 sm:px-5 py-4 sm:py-[18px] rounded-[20px] text-sm font-semibold transition-all duration-300 overflow-hidden ${customBtnBg ? '' : theme.btn} ${isDemo ? 'cursor-default' : ''}`}
                          style={{
                            ...(customBtnBg ? { backgroundColor: customBtnBg } : {}),
                            ...(customBtnText ? { color: customBtnText } : {}),
                          }}
                        >
                          {!isDemo && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{ background: `linear-gradient(105deg, transparent 40%, ${isDarkTheme ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'} 50%, transparent 60%)` }}
                            />
                          )}
                          <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 ${!isDemo ? 'group-hover:scale-105' : ''} ${
                            isDarkTheme ? 'bg-white/[0.08]' : 'bg-black/[0.04]'
                          }`}>
                            <LinkFavicon url={link.url} size="md" />
                          </div>
                          <div className="flex-1 min-w-0 relative">
                            <span className="block truncate tracking-tight">{link.title}</span>
                            {link.description && <span className="block text-xs font-normal opacity-40 truncate mt-0.5">{link.description}</span>}
                          </div>
                          {!isDemo && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-all duration-300 group-hover:translate-x-0.5 shrink-0" />}
                        </motion.a>,
                        link,
                      );
                    }

                    /* Minimal */
                    if (isMinimal) {
                      return wrapNsfw(
                        <motion.a
                          key={link.id} href={isDemo ? undefined : link.url} target={isDemo ? undefined : "_blank"} rel={isDemo ? undefined : "noopener noreferrer"}
                          onClick={(e) => { if (isDemo) { e.preventDefault(); return; } recordClick(link.id, clickVariant); }}
                          variants={fadeUp}
                          whileTap={isDemo ? {} : { scale: 0.98 }}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${theme.text} ${isDemo ? 'cursor-default' : isDarkTheme ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'}`}
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
                          {!isDemo && <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-25 transition-opacity duration-200 shrink-0" />}
                        </motion.a>,
                        link,
                      );
                    }

                    /* Default — clean premium style */
                    return wrapNsfw(
                      <motion.a
                        key={link.id} href={isDemo ? undefined : link.url} target={isDemo ? undefined : "_blank"} rel={isDemo ? undefined : "noopener noreferrer"}
                        onClick={(e) => { if (isDemo) { e.preventDefault(); return; } recordClick(link.id, clickVariant); }}
                        variants={fadeUp}
                        whileHover={isDemo ? {} : { y: -2 }} whileTap={isDemo ? {} : { scale: 0.98 }}
                        className={`link-item group relative flex items-center gap-3.5 px-4 py-3.5 sm:py-4 rounded-[18px] text-[13px] sm:text-sm font-medium transition-all duration-300 overflow-hidden ${customBtnBg ? '' : theme.btn} ${isDemo ? 'cursor-default' : ''}`}
                        style={{
                          ...(customBtnBg ? { backgroundColor: customBtnBg } : {}),
                          ...(customBtnText ? { color: customBtnText } : {}),
                        }}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${!isDemo ? 'group-hover:scale-105' : ''} ${
                          isDarkTheme ? 'bg-white/[0.07]' : 'bg-black/[0.035]'
                        }`}>
                          <LinkFavicon url={link.url} size="sm" />
                        </div>
                        <span className="flex-1 truncate tracking-[-0.01em]">{link.title}</span>
                        {!isDemo && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-25 transition-all duration-300 group-hover:translate-x-0.5 shrink-0" />}
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
          <motion.div variants={fadeUp} className="pt-14 pb-4 safe-area-bottom">
            <Link
              to="/"
              className={`group flex items-center justify-center gap-1.5 text-[10px] font-medium tracking-wide uppercase opacity-15 hover:opacity-40 transition-all duration-300 ${theme.text}`}
            >
              {t('footer.madeWith')} <Heart className="w-2.5 h-2.5 transition-transform group-hover:scale-125" /> MyTaptap
            </Link>
          </motion.div>
          </div>{/* end glassmorphism wrapper */}
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
