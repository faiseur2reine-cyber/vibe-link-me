import { Profile, LinkItem } from '@/hooks/useDashboard';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Heart } from 'lucide-react';
import LinkFavicon from '@/components/LinkFavicon';
import SocialIcons from '@/components/profile/SocialIcons';
import { getTheme } from '@/lib/themes';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkPreviewProps {
  profile: Profile;
  links: LinkItem[];
}

const LinkPreview = ({ profile, links }: LinkPreviewProps) => {
  const { t } = useTranslation();
  const theme = getTheme(profile.theme);
  const displayName = profile.display_name || profile.username;
  const hasThumb = links.some(l => l.thumbnail_url);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={profile.theme}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`rounded-3xl overflow-hidden ${theme.bg} relative`}
      >
        {/* Cover */}
        {profile.cover_url && (
          <div className="w-full h-24 overflow-hidden">
            <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className={`relative z-10 p-5 ${profile.cover_url ? '-mt-8' : 'pt-6'}`}>
          {/* Avatar */}
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full mx-auto overflow-hidden ring-3 ring-background shadow-lg ${!profile.cover_url ? theme.avatarRing : ''}`}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{displayName?.[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="mt-2 space-y-0.5">
              <h3 className={`font-bold text-sm tracking-tight ${theme.text}`}>{displayName}</h3>
              <p className={`text-[11px] ${theme.subtleText}`}>@{profile.username}</p>
              {profile.bio && <p className={`text-[11px] mt-1 opacity-70 ${theme.text}`}>{profile.bio}</p>}
            </div>

            {/* Social icons */}
            {profile.social_links?.length > 0 && (
              <div className="mt-2">
                <SocialIcons links={profile.social_links} theme={theme} size="sm" />
              </div>
            )}
          </div>

          {/* Links */}
          <div className={`mt-3 ${hasThumb ? 'grid grid-cols-2 gap-2' : 'space-y-1.5'}`}>
            {links.map((link) => (
              <div
                key={link.id}
                className={
                  link.thumbnail_url
                    ? `relative rounded-xl overflow-hidden aspect-square ${theme.cardBg}`
                    : `group flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-medium ${theme.btn}`
                }
              >
                {link.thumbnail_url ? (
                  <>
                    <img src={link.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-1.5 left-2 right-2 text-white text-[10px] font-semibold truncate">{link.title}</p>
                  </>
                ) : (
                  <>
                    <LinkFavicon url={link.url} size="sm" />
                    <span className="flex-1 text-center">{link.title}</span>
                  </>
                )}
              </div>
            ))}
            {links.length === 0 && (
              <p className={`text-[11px] py-4 text-center opacity-40 ${theme.text}`}>No links yet</p>
            )}
          </div>

          {/* Badge */}
          {profile.plan !== 'pro' && (
            <p className={`text-[9px] pt-4 opacity-30 flex items-center justify-center gap-1 font-medium ${theme.text}`}>
              Créé avec <Heart className="w-2 h-2" /> MyTaptap
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LinkPreview;
