import { Profile, LinkItem } from '@/hooks/useDashboard';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  profile: Profile;
  links: LinkItem[];
}

const LinkPreview = ({ profile, links }: LinkPreviewProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-border p-6 max-w-sm mx-auto">
      <div className="text-center space-y-3">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto overflow-hidden flex items-center justify-center">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary-foreground">
              {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Name & Bio */}
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">{profile.display_name || profile.username}</h3>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-foreground/80 mt-2">{profile.bio}</p>}
        </div>

        {/* Links */}
        <div className="space-y-2 pt-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-border transition-all text-sm font-medium text-foreground"
            >
              {link.title}
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          ))}
          {links.length === 0 && (
            <p className="text-xs text-muted-foreground py-4">No links yet</p>
          )}
        </div>

        {/* Badge */}
        {profile.plan !== 'pro' && (
          <p className="text-xs text-muted-foreground pt-4">{t('public.madeWith')}</p>
        )}
      </div>
    </div>
  );
};

export default LinkPreview;
