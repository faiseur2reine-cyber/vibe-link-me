import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Heart, Share2 } from 'lucide-react';
import LinkFavicon from '@/components/LinkFavicon';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/themes';
import { recordClick } from '@/hooks/useAnalytics';
import { toast } from '@/hooks/use-toast';

interface Profile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  plan: string;
  user_id: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profileData) { setNotFound(true); setLoading(false); return; }
      setProfile(profileData as Profile);

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', (profileData as Profile).user_id)
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <h1 className="text-6xl font-display font-bold text-foreground">404</h1>
        </motion.div>
        <p className="text-muted-foreground">{t('public.notFound')}</p>
        <Link to="/" className="text-primary hover:underline font-medium">{t('public.backHome')}</Link>
      </div>
    );
  }

  const theme = getTheme(profile.theme);
  const displayName = profile.display_name || profile.username;
  const pageTitle = `${displayName} | MyTaptap`;
  const pageDescription = profile.bio || `Découvrez les liens de ${displayName} sur MyTaptap`;

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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <div className={`min-h-screen ${theme.bg} flex flex-col items-center px-4 py-8 sm:py-16 relative overflow-hidden`}>
        {/* Decorative blurred shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-300/20 to-pink-300/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-orange-300/10 to-yellow-300/10 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          {/* Header Card */}
          <div className={`rounded-3xl p-8 text-center ${theme.cardBg}`}>
            {/* Share button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={handleShare}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${theme.subtleText} hover:opacity-100 opacity-60`}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-28 h-28 rounded-full mx-auto overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 ${theme.avatarRing}`}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
            </motion.div>

            {/* Name & Bio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-5 space-y-1.5"
            >
              <h1 className={`text-2xl font-display font-bold tracking-tight ${theme.text}`}>{displayName}</h1>
              <p className={`text-sm font-medium ${theme.subtleText}`}>@{profile.username}</p>
              {profile.bio && (
                <p className={`text-sm mt-3 leading-relaxed ${theme.text} opacity-75 max-w-xs mx-auto`}>{profile.bio}</p>
              )}
            </motion.div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            {links.map((link, i) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordClick(link.id)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex items-center gap-3 px-5 py-4 rounded-2xl font-medium text-sm transition-all duration-200 ${theme.btn}`}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
                  alt=""
                  className="w-5 h-5 rounded shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="flex-1 text-center">{link.title}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
              </motion.a>
            ))}
          </div>

          {/* Footer Badge */}
          {profile.plan !== 'pro' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4 pb-2"
            >
              <Link
                to="/"
                className={`flex items-center justify-center gap-1.5 text-xs font-medium opacity-40 hover:opacity-70 transition-opacity ${theme.text}`}
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
