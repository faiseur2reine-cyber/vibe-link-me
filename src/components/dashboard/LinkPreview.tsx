import { Profile, LinkItem } from '@/hooks/useDashboard';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Heart } from 'lucide-react';
import LinkFavicon from '@/components/LinkFavicon';
import { getTheme } from '@/lib/themes';

interface LinkPreviewProps {
  profile: Profile;
  links: LinkItem[];
}

const LinkPreview = ({ profile, links }: LinkPreviewProps) => {
  const { t } = useTranslation();
  const theme = getTheme(profile.theme);
  const displayName = profile.display_name || profile.username;

  return (
    <div className={`rounded-3xl overflow-hidden ${theme.bg} transition-all duration-300 relative`}>
      {/* Decorative blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-purple-300/15 to-pink-300/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6">
        {/* Header card */}
        <div className={`rounded-2xl p-5 text-center ${theme.cardBg} mb-4`}>
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto overflow-hidden ${theme.avatarRing}`}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {displayName?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name & Bio */}
          <div className="mt-3 space-y-1">
            <h3 className={`font-display font-bold text-lg tracking-tight ${theme.text}`}>{displayName}</h3>
            <p className={`text-xs font-medium ${theme.subtleText}`}>@{profile.username}</p>
            {profile.bio && <p className={`text-xs mt-2 leading-relaxed opacity-75 ${theme.text}`}>{profile.bio}</p>}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 ${theme.btn}`}
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(link.url).hostname; } catch { return ''; } })()}&sz=32`}
                alt=""
                className="w-4 h-4 rounded shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="flex-1 text-center">{link.title}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
            </div>
          ))}
          {links.length === 0 && (
            <p className={`text-xs py-6 text-center opacity-40 ${theme.text}`}>No links yet</p>
          )}
        </div>

        {/* Badge */}
        {profile.plan !== 'pro' && (
          <p className={`text-[10px] pt-5 opacity-40 flex items-center justify-center gap-1 font-medium ${theme.text}`}>
            Créé avec <Heart className="w-2.5 h-2.5" /> MyTaptap
          </p>
        )}
      </div>
    </div>
  );
};

export default LinkPreview;
