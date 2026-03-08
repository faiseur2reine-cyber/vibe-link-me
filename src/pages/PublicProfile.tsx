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

interface Profile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  theme: string;
  plan: string;
  user_id: string;
  is_nsfw: boolean;
  social_links: SocialLink[];
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
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    // Block known social media crawlers
    const ua = navigator.userAgent.toLowerCase();
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|slackbot|discordbot|googlebot/i.test(ua);
    if (isCrawler) return;

    const fetchData = async () => {
      if (!username) return;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profileData) { setNotFound(true); setLoading(false); return; }
      
      const p = {
        ...profileData,
        social_links: (profileData.social_links as unknown as SocialLink[]) || [],
      } as Profile;
      setProfile(p);

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', p.user_id)
        .order('position', { ascending: true });

      setLinks((linksData as LinkItem[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.display_name || username, url });
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

  if (notFound || !profile) {
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

  // Age gate for NSFW profiles
  if (profile.is_nsfw && !ageVerified) {
    return <AgeGate onVerified={() => setAgeVerified(true)} profile={profile} />;
  }

  const theme = getTheme(profile.theme);
  const displayName = profile.display_name || profile.username;
  const pageTitle = `${displayName} | MyTaptap`;
  const pageDescription = profile.bio || `Check out ${displayName}'s links on MyTaptap`;
  const hasThumb = links.some(l => l.thumbnail_url);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/${username}`} />
        {profile.avatar_url && <meta property="og:image" content={profile.avatar_url} />}
        {profile.is_nsfw && <meta name="rating" content="adult" />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <div className={`min-h-screen ${theme.bg} flex flex-col items-center relative overflow-hidden`}>
        
        {/* Cover Photo */}
        {profile.cover_url && (
          <div className="w-full h-48 sm:h-64 relative">
            <img 
              src={profile.cover_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-lg px-4 ${profile.cover_url ? '-mt-16' : 'pt-12'} pb-8 relative z-10`}
        >
          {/* Profile Header */}
          <div className="text-center relative">
            {/* Share button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleShare}
              className={`absolute top-0 right-0 p-2.5 rounded-full ${theme.cardBg} transition-colors ${theme.subtleText} hover:opacity-100 opacity-70`}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto overflow-hidden ring-4 ring-background shadow-2xl ${profile.cover_url ? '' : theme.avatarRing}`}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
            </motion.div>

            {/* Name & Bio */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 space-y-1"
            >
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme.text}`}>
                {displayName}
              </h1>
              <p className={`text-sm ${theme.subtleText}`}>@{profile.username}</p>
              {profile.bio && (
                <p className={`text-sm mt-2 leading-relaxed ${theme.text} opacity-70 max-w-sm mx-auto`}>
                  {profile.bio}
                </p>
              )}
            </motion.div>

            {/* Social Icons */}
            {profile.social_links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-4"
              >
                <SocialIcons links={profile.social_links} theme={theme} />
              </motion.div>
            )}
          </div>

          {/* Links */}
          <div className="mt-6 space-y-2.5">
            {links.map((link, i) => {
              const isFeatured = link.style === 'featured';
              const isCard = link.style === 'card' || !!link.thumbnail_url;
              const isMinimal = link.style === 'minimal';

              const customStyle: React.CSSProperties = {
                ...(link.bg_color ? { backgroundColor: link.bg_color } : {}),
                ...(link.text_color ? { color: link.text_color } : {}),
              };

              // Card style with thumbnail
              if (isCard && link.thumbnail_url) {
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordClick(link.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative rounded-2xl overflow-hidden ${isFeatured ? 'aspect-[2/1]' : 'aspect-[3/2]'}`}
                    style={customStyle}
                  >
                    <img 
                      src={link.thumbnail_url} 
                      alt={link.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-base font-bold truncate" style={link.text_color ? { color: link.text_color } : {}}>
                        {link.title}
                      </p>
                      {link.description && (
                        <p className="text-white/70 text-xs mt-0.5 truncate" style={link.text_color ? { color: link.text_color, opacity: 0.7 } : {}}>
                          {link.description}
                        </p>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <LinkFavicon url={link.url} size="sm" className="opacity-80" />
                    </div>
                  </motion.a>
                );
              }

              // Featured style (no thumb)
              if (isFeatured) {
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordClick(link.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex flex-col items-center gap-1 px-6 py-5 rounded-2xl text-base font-bold transition-all duration-200 ${link.bg_color ? '' : theme.btn}`}
                    style={customStyle}
                  >
                    <LinkFavicon url={link.url} size="md" />
                    <span>{link.title}</span>
                    {link.description && (
                      <span className="text-xs font-normal opacity-60">{link.description}</span>
                    )}
                  </motion.a>
                );
              }

              // Minimal style
              if (isMinimal) {
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordClick(link.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:bg-white/5 ${theme.text}`}
                    style={customStyle}
                  >
                    <LinkFavicon url={link.url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{link.title}</span>
                      {link.description && (
                        <p className="text-xs opacity-50 truncate">{link.description}</p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
                  </motion.a>
                );
              }

              // Default style
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordClick(link.id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 ${link.bg_color ? '' : theme.btn}`}
                  style={customStyle}
                >
                  <LinkFavicon url={link.url} size="md" />
                  <div className="flex-1 min-w-0 text-center">
                    <span>{link.title}</span>
                    {link.description && (
                      <p className="text-xs font-normal opacity-60 truncate mt-0.5">{link.description}</p>
                    )}
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                </motion.a>
              );
            })}
          </div>

          {/* Footer Badge */}
          {profile.plan !== 'pro' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-8 pb-2"
            >
              <Link
                to="/"
                className={`flex items-center justify-center gap-1.5 text-xs font-medium opacity-30 hover:opacity-60 transition-opacity ${theme.text}`}
              >
                {t('footer.madeWith')} <Heart className="w-3 h-3" /> MyTaptap
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default PublicProfile;
