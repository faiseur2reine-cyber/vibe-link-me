import { CreatorPage } from '@/hooks/useCreatorPages';
import { LinkItem } from '@/hooks/useDashboard';
import { getTheme } from '@/lib/themes';
import LinkFavicon from '@/components/LinkFavicon';
import SocialIcons from '@/components/profile/SocialIcons';
import { TapHeart as Heart, TapExternalLink as ExternalLink } from '@/components/icons/TapIcons';
import { motion } from 'framer-motion';

interface DesignLivePreviewProps {
  page: CreatorPage;
  links: LinkItem[];
  /** Live overrides from the design editor (not yet saved) */
  designState: {
    bgColor: string;
    textColor: string;
    accentColor: string;
    btnColor: string;
    btnTextColor: string;
    font: string;
    layout: string;
    customCss: string;
  };
}

const DesignLivePreview = ({ page, links, designState }: DesignLivePreviewProps) => {
  const theme = getTheme(page.theme);
  const displayName = page.display_name || page.username;

  const { bgColor, textColor, accentColor, btnColor, btnTextColor, font, layout, customCss } = designState;

  const hasCustomColors = bgColor || textColor;

  const fontFamily = font && font !== 'default'
    ? `'${font.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}', sans-serif`
    : undefined;

  const fontUrl = font && font !== 'default'
    ? `https://fonts.googleapis.com/css2?family=${font.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('+')}&display=swap`
    : null;

  const containerStyle: React.CSSProperties = {
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(fontFamily ? { fontFamily } : {}),
  };

  const textStyle: React.CSSProperties = textColor ? { color: textColor } : {};
  const accentStyle: React.CSSProperties = accentColor ? { color: accentColor } : {};
  const btnStyle: React.CSSProperties = {
    ...(btnColor ? { backgroundColor: btnColor } : {}),
    ...(btnTextColor ? { color: btnTextColor } : {}),
  };

  return (
    <div className="space-y-2">
      {fontUrl && (
        <link rel="stylesheet" href={fontUrl} />
      )}
      {customCss && (
        <style>{customCss}</style>
      )}
      <motion.div
        key={`${bgColor}-${font}-${layout}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`page-container rounded-3xl overflow-hidden relative ${hasCustomColors ? '' : theme.bg}`}
        style={containerStyle}
      >
        {/* Cover */}
        {page.cover_url && (
          <div className="w-full h-20 overflow-hidden">
            <img src={page.cover_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className={`profile-header relative z-10 p-4 ${page.cover_url ? '-mt-6' : 'pt-5'}`}>
          {/* Avatar */}
          <div className="text-center">
            <div className={`w-14 h-14 rounded-full mx-auto overflow-hidden ring-2 ring-background shadow-lg ${!page.cover_url ? theme.avatarRing : ''}`}>
              {page.avatar_url ? (
                <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{displayName?.[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="mt-2 space-y-0.5">
              <h3 className={`font-bold text-xs tracking-tight ${hasCustomColors ? '' : theme.text}`} style={textStyle}>
                {displayName}
              </h3>
              <p className={`text-[10px] ${hasCustomColors ? 'opacity-60' : theme.subtleText}`} style={textStyle}>
                @{page.username}
              </p>
              {page.bio && (
                <p className={`text-[10px] mt-1 opacity-70 ${hasCustomColors ? '' : theme.text}`} style={textStyle}>
                  {page.bio.length > 60 ? page.bio.slice(0, 60) + '…' : page.bio}
                </p>
              )}
            </div>

            {page.social_links?.length > 0 && (
              <div className="mt-2">
                <SocialIcons links={page.social_links as any} theme={theme} size="sm" />
              </div>
            )}
          </div>

          {/* Links */}
          <div className={`mt-3 ${layout === 'grid-2' ? 'grid grid-cols-2 gap-1.5' : 'space-y-1.5'}`}>
            {links.slice(0, 5).map((link) => {
              const isMinimal = link.style === 'minimal' || layout === 'minimal';
              const isCard = link.style === 'card' || !!link.thumbnail_url;

              if (isCard && link.thumbnail_url) {
                return (
                  <div
                    key={link.id}
                    className="link-item relative rounded-xl overflow-hidden aspect-[3/2]"
                  >
                    <img src={link.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <p className="absolute bottom-1 left-2 right-2 text-white text-[9px] font-semibold truncate">
                      {link.title}
                    </p>
                  </div>
                );
              }

              if (isMinimal) {
                return (
                  <div
                    key={link.id}
                    className={`link-item flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] ${hasCustomColors ? '' : theme.text}`}
                    style={textStyle}
                  >
                    <LinkFavicon url={link.url} size="sm" />
                    <span className="flex-1 truncate font-medium">{link.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-30 shrink-0" />
                  </div>
                );
              }

              return (
                <div
                  key={link.id}
                  className={`link-item flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-medium ${btnColor ? '' : theme.btn}`}
                  style={btnStyle}
                >
                  <LinkFavicon url={link.url} size="sm" />
                  <span className="flex-1 text-center truncate">{link.title}</span>
                </div>
              );
            })}
            {links.length === 0 && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-medium opacity-50 ${btnColor ? '' : theme.btn}`}
                style={btnStyle}
              >
                <span className="flex-1 text-center">Exemple de lien</span>
              </div>
            )}
            {links.length > 5 && (
              <p className={`text-[9px] text-center opacity-40 pt-1 ${hasCustomColors ? '' : theme.text}`} style={textStyle}>
                +{links.length - 5} autres liens
              </p>
            )}
          </div>

          {/* Accent color indicator */}
          {accentColor && (
            <div className="flex items-center justify-center gap-1 mt-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-[8px] font-medium" style={accentStyle}>Accent</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DesignLivePreview;
