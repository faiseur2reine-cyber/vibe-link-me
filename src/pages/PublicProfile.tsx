import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/themes';
import { recordClick } from '@/hooks/useAnalytics';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <h1 className="text-4xl font-display font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">{t('public.notFound')}</p>
        <Link to="/" className="text-primary hover:underline">{t('public.backHome')}</Link>
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

      <div className={`min-h-screen ${theme.bg} flex flex-col items-center px-4 py-12`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Avatar */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
              )}
            </motion.div>

            <div>
              <h1 className={`text-xl font-display font-bold ${theme.text}`}>{displayName}</h1>
              <p className={`text-sm opacity-60 ${theme.text}`}>@{profile.username}</p>
              {profile.bio && (
                <p className={`text-sm mt-2 opacity-80 ${theme.text} max-w-xs mx-auto`}>{profile.bio}</p>
              )}
            </div>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm ${theme.btn}`}
              >
                {link.title}
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </motion.a>
            ))}
          </div>

          {/* Badge */}
          {profile.plan !== 'pro' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-8">
              <Link
                to="/"
                className={`flex items-center justify-center gap-1 text-xs opacity-50 hover:opacity-80 transition-opacity ${theme.text}`}
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
