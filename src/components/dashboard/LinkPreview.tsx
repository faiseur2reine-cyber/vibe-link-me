import { Profile, LinkItem } from '@/hooks/useDashboard';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Heart } from 'lucide-react';
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
    <div className={`rounded-3xl p-6 max-w-sm mx-auto ${theme.bg} transition-all duration-300`}>
      <div className="text-center space-y-3">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto overflow-hidden flex items-center justify-center shadow-lg">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">
              {displayName?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Name & Bio */}
        <div>
          <h3 className={`font-display font-bold text-lg ${theme.text}`}>{displayName}</h3>
          <p className={`text-sm opacity-60 ${theme.text}`}>@{profile.username}</p>
          {profile.bio && <p className={`text-sm mt-2 opacity-80 ${theme.text}`}>{profile.bio}</p>}
        </div>

        {/* Links */}
        <div className="space-y-2 pt-2">
          {links.map((link) => (
            <div
              key={link.id}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${theme.btn}`}
            >
              {link.title}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
          ))}
          {links.length === 0 && (
            <p className={`text-xs py-4 opacity-50 ${theme.text}`}>No links yet</p>
          )}
        </div>

        {/* Badge */}
        {profile.plan !== 'pro' && (
          <p className={`text-xs pt-4 opacity-50 flex items-center justify-center gap-1 ${theme.text}`}>
            Créé avec <Heart className="w-3 h-3" /> MyTaptap
          </p>
        )}
      </div>
    </div>
  );
};

export default LinkPreview;
