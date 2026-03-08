import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Heart, Share2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/themes';
import { recordClick } from '@/hooks/useAnalytics';
import { toast } from '@/hooks/use-toast';
import LinkFavicon from '@/components/LinkFavicon';
import SocialIcons from '@/components/profile/SocialIcons';
import AgeGate from '@/components/profile/AgeGate';

interface SocialLink {
  platform: string;
  url: string;
}

interface CreatorPageData {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  theme: string;
  user_id: string;
  is_nsfw: boolean;
  social_links: SocialLink[];
  custom_bg_color?: string | null;
  custom_text_color?: string | null;
  custom_accent_color?: string | null;
  custom_btn_color?: string | null;
  custom_btn_text_color?: string | null;
  custom_font?: string;
  link_layout?: string;
  custom_css?: string | null;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
  thumbnail_url: string | null;
  description: string | null;
  bg_color: string | null;
  text_color: string | null;
  style: string;
  section_title: string | null;
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const [page, setPage] = useState<CreatorPageData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|slackbot|discordbot|googlebot/i.test(ua);
    if (isCrawler) return;

    const fetchData = async () => {
      if (!username) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/public-profile?username=${encodeURIComponent(username)}`,
          { headers: { 'apikey': anonKey } }
        );

        if (res.status === 429 || res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const result = await res.json();

        if (result.page) {
          setPage({
            ...result.page,
            social_links: (result.page.social_links as unknown as SocialLink[]) || [],
          } as CreatorPageData);
          setLinks((result.links as LinkItem[]) || []);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }

      setLoading(false);
    };
    fetchData();
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: page?.display_name || username, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: t('common.success'), description: 'Link copied!' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white"
        />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h1 className="text-7xl font-bold text-white">404</h1>
        </motion.div>
        <p className="text-white/50">{t('public.notFound')}</p>
        <Link to="/" className="text-white/70 hover:text-white underline font-medium">{t('public.backHome')}</Link>
      </div>
    );
  }

  if (page.is_nsfw && !ageVerified) {
    return <AgeGate onVerified={() => setAgeVerified(true)} profile={page} />;
  }

  const theme = getTheme(page.theme);
  const displayName = page.display_name || page.username;
  const pageTitle = `${displayName} | MyTaptap`;
  const pageDescription = page.bio || `Check out ${displayName}'s links on MyTaptap`;

  return (
    <>
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
      </Helmet>

      <div className={`min-h-screen ${theme.bg} flex flex-col items-center relative overflow-hidden`}>
        {page.cover_url && (
          <div className="w-full h-48 sm:h-64 relative">
            <img src={page.cover_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-lg px-4 ${page.cover_url ? '-mt-16' : 'pt-12'} pb-8 relative z-10`}
        >
          <div className="text-center relative">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleShare}
              className={`absolute top-0 right-0 p-2.5 rounded-full ${theme.cardBg} transition-colors ${theme.subtleText} hover:opacity-100 opacity-70`}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto overflow-hidden ring-4 ring-background shadow-2xl ${page.cover_url ? '' : theme.avatarRing}`}
            >
              {page.avatar_url ? (
                <img src={page.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 space-y-1"
            >
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme.text}`}>{displayName}</h1>
              <p className={`text-sm ${theme.subtleText}`}>@{page.username}</p>
              {page.bio && (
                <p className={`text-sm mt-2 leading-relaxed ${theme.text} opacity-70 max-w-sm mx-auto`}>
                  {page.bio.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                    /^https?:\/\//.test(part) ? (
                      <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${theme.accent} underline underline-offset-2 hover:opacity-80 transition-opacity`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </p>
              )}
            </motion.div>

            {page.social_links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-4"
              >
                <SocialIcons links={page.social_links} theme={theme} />
              </motion.div>
            )}
          </div>

          {/* Links */}
          <div className="mt-6 space-y-6">
            {(() => {
              const sections: { title: string | null; links: LinkItem[] }[] = [];
              links.forEach(link => {
                const sectionKey = link.section_title || null;
                const existing = sections.find(s => s.title === sectionKey);
                if (existing) existing.links.push(link);
                else sections.push({ title: sectionKey, links: [link] });
              });

              let globalIndex = 0;

              return sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2.5">
                  {section.title && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + sIdx * 0.05 }}
                      className="flex items-center gap-3 pt-2"
                    >
                      <div className={`h-px flex-1 ${theme.text} opacity-10`} />
                      <span className={`text-xs font-semibold uppercase tracking-widest ${theme.subtleText}`}>{section.title}</span>
                      <div className={`h-px flex-1 ${theme.text} opacity-10`} />
                    </motion.div>
                  )}
                  {section.links.map((link) => {
                    const i = globalIndex++;
                    const isFeatured = link.style === 'featured';
                    const isCard = link.style === 'card' || !!link.thumbnail_url;
                    const isMinimal = link.style === 'minimal';
                    const customStyle: React.CSSProperties = {
                      ...(link.bg_color ? { backgroundColor: link.bg_color } : {}),
                      ...(link.text_color ? { color: link.text_color } : {}),
                    };

                    if (isCard && link.thumbnail_url) {
                      return (
                        <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => recordClick(link.id)}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className={`group relative rounded-2xl overflow-hidden ${isFeatured ? 'aspect-[2/1]' : 'aspect-[3/2]'}`}
                          style={customStyle}
                        >
                          <img src={link.thumbnail_url} alt={link.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-base font-bold truncate" style={link.text_color ? { color: link.text_color } : {}}>{link.title}</p>
                            {link.description && <p className="text-white/70 text-xs mt-0.5 truncate">{link.description}</p>}
                          </div>
                          <div className="absolute top-3 right-3">
                            <LinkFavicon url={link.url} size="sm" className="opacity-80" />
                          </div>
                        </motion.a>
                      );
                    }

                    if (isFeatured) {
                      return (
                        <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => recordClick(link.id)}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className={`group flex flex-col items-center gap-1 px-6 py-5 rounded-2xl text-base font-bold transition-all duration-200 ${link.bg_color ? '' : theme.btn}`}
                          style={customStyle}
                        >
                          <LinkFavicon url={link.url} size="md" />
                          <span>{link.title}</span>
                          {link.description && <span className="text-xs font-normal opacity-60">{link.description}</span>}
                        </motion.a>
                      );
                    }

                    if (isMinimal) {
                      return (
                        <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => recordClick(link.id)}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.04 }}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:bg-white/5 ${theme.text}`}
                          style={customStyle}
                        >
                          <LinkFavicon url={link.url} size="sm" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{link.title}</span>
                            {link.description && <p className="text-xs opacity-50 truncate">{link.description}</p>}
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
                        </motion.a>
                      );
                    }

                    return (
                      <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                        onClick={() => recordClick(link.id)}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.04 }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`group flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 ${link.bg_color ? '' : theme.btn}`}
                        style={customStyle}
                      >
                        <LinkFavicon url={link.url} size="md" />
                        <div className="flex-1 min-w-0 text-center">
                          <span>{link.title}</span>
                          {link.description && <p className="text-xs font-normal opacity-60 truncate mt-0.5">{link.description}</p>}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                      </motion.a>
                    );
                  })}
                </div>
              ));
            })()}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-8 pb-2">
            <Link
              to="/"
              className={`flex items-center justify-center gap-1.5 text-xs font-medium opacity-30 hover:opacity-60 transition-opacity ${theme.text}`}
            >
              {t('footer.madeWith')} <Heart className="w-3 h-3" /> MyTaptap
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default PublicProfile;
