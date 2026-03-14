// InlinePreview — renders a miniature version of the public page
// directly in React. Zero iframe, zero network, instant updates.

import { useState } from 'react';
import { CreatorPage, PageLink } from '@/hooks/useCreatorPages';
import { getTheme } from '@/lib/themes';
import { detectPlatform } from '@/lib/platforms';
import { Monitor, Smartphone } from 'lucide-react';
import LinkFavicon from '@/components/LinkFavicon';

interface InlinePreviewProps {
  page: CreatorPage;
  links: PageLink[];
}

function isColorDark(hex: string): boolean {
  try {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } catch { return false; }
}

export const InlinePreview = ({ page, links }: InlinePreviewProps) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const theme = getTheme(page.theme);

  const hasCustomBg = !!page.custom_bg_color;
  const hasCustomText = !!page.custom_text_color;
  const isDark = page.theme === 'midnight' || page.theme === 'neon' || page.theme === 'glass_dark' ||
    page.theme === 'cyber' || page.theme === 'immersive' ||
    (page.custom_bg_color && isColorDark(page.custom_bg_color));

  const bgStyle = hasCustomBg ? { backgroundColor: page.custom_bg_color! } : {};
  const textStyle = hasCustomText ? { color: page.custom_text_color! } : {};

  const isMobile = device === 'mobile';
  const frameW = isMobile ? 280 : 480;
  const frameH = isMobile ? 500 : 320;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <span className="text-[11px] font-medium text-muted-foreground">Aperçu</span>
        <div className="flex gap-0.5">
          {([
            { key: 'mobile', icon: Smartphone },
            { key: 'desktop', icon: Monitor },
          ] as const).map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`p-1.5 rounded-lg transition-colors ${device === key ? 'bg-foreground text-background' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Preview frame */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20 overflow-hidden">
        <div
          className="relative rounded-2xl border border-border/60 shadow-xl shadow-black/[0.06] overflow-hidden transition-all duration-300"
          style={{ width: frameW, height: frameH }}
        >
          {/* Phone notch */}
          {isMobile && (
            <div className="absolute top-0 inset-x-0 z-10 h-5 flex items-center justify-center" style={bgStyle}>
              <div className="w-16 h-1 rounded-full bg-current opacity-10" style={textStyle} />
            </div>
          )}

          {/* Page content */}
          <div
            className={`w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide ${hasCustomBg ? '' : theme.bg}`}
            style={{ ...bgStyle, fontSize: isMobile ? 10 : 9 }}
          >
            {/* Immersive hero */}
            {page.theme === 'immersive' ? (
              <ImmersivePreview page={page} links={links} />
            ) : (
              <StandardPreview page={page} links={links} theme={theme} isDark={isDark} isMobile={isMobile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══ STANDARD THEMES ═══
const StandardPreview = ({ page, links, theme, isDark, isMobile }: {
  page: CreatorPage; links: PageLink[]; theme: ReturnType<typeof getTheme>; isDark: boolean; isMobile: boolean;
}) => {
  const hasCustomBg = !!page.custom_bg_color;
  const hasCustomText = !!page.custom_text_color;
  const textStyle = hasCustomText ? { color: page.custom_text_color! } : {};
  const btnBg = page.custom_btn_color;
  const btnText = page.custom_btn_text_color;

  return (
    <div className={`flex flex-col items-center ${isMobile ? 'pt-10 px-4 pb-6' : 'pt-6 px-6 pb-4'}`}>
      {/* Avatar */}
      <div className={`${isMobile ? 'w-14 h-14' : 'w-10 h-10'} rounded-full overflow-hidden ${theme.avatarRing} shrink-0`}>
        {page.avatar_url ? (
          <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            <span className={`${isMobile ? 'text-lg' : 'text-sm'} font-bold ${isDark ? 'text-white/60' : 'text-gray-400'}`}>
              {(page.display_name || page.username)?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <p
        className={`${isMobile ? 'text-[13px] mt-2.5' : 'text-[11px] mt-2'} font-bold tracking-tight ${hasCustomText ? '' : theme.text}`}
        style={textStyle}
      >
        {page.display_name || page.username}
      </p>

      {/* Username */}
      <p className={`text-[9px] mt-0.5 ${hasCustomText ? 'opacity-40' : theme.subtleText}`} style={textStyle}>
        @{page.username}
      </p>

      {/* Bio */}
      {page.bio && (
        <p
          className={`${isMobile ? 'text-[9px] mt-2' : 'text-[8px] mt-1.5'} text-center leading-relaxed max-w-[200px] ${hasCustomText ? 'opacity-50' : theme.subtleText}`}
          style={textStyle}
        >
          {page.bio.length > 60 ? page.bio.slice(0, 60) + '…' : page.bio}
        </p>
      )}

      {/* Links */}
      <div className={`w-full ${isMobile ? 'mt-4 space-y-1.5' : 'mt-3 space-y-1'} max-w-[240px]`}>
        {links.slice(0, 6).map((link) => {
          const platform = !link.bg_color && !btnBg ? detectPlatform(link.url) : null;
          const bg = link.bg_color || btnBg;
          const text = link.text_color || btnText;
          const platformColor = platform?.bgColor;

          return (
            <div
              key={link.id}
              className={`flex items-center gap-2 ${isMobile ? 'px-2.5 py-2 rounded-lg' : 'px-2 py-1.5 rounded-md'} transition-all ${bg ? '' : theme.btn.split('hover:')[0]}`}
              style={{
                ...(bg ? { backgroundColor: bg, color: text || '#fff' } : {}),
                ...(platformColor && !bg ? { boxShadow: `inset 2px 0 0 ${platformColor}` } : {}),
              }}
            >
              {/* Icon dot */}
              <div
                className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} rounded-md flex items-center justify-center shrink-0`}
                style={platformColor && !bg ? { backgroundColor: platformColor } : bg ? { backgroundColor: isDark || isColorDark(bg) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' } : { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
              >
                <LinkFavicon url={link.url} size="xs" className={platformColor || (bg && isColorDark(bg)) ? 'text-white' : ''} />
              </div>

              {/* Title */}
              <span className={`${isMobile ? 'text-[10px]' : 'text-[8px]'} font-semibold truncate flex-1`}>
                {link.title}
              </span>
            </div>
          );
        })}
        {links.length > 6 && (
          <p className={`text-center text-[8px] mt-1 ${isDark ? 'text-white/30' : 'text-black/20'}`}>
            +{links.length - 6} liens
          </p>
        )}
      </div>

      {/* Powered by */}
      <p className={`text-[7px] mt-4 ${isDark ? 'text-white/10' : 'text-black/10'}`}>
        MyTaptap
      </p>
    </div>
  );
};

// ═══ IMMERSIVE THEME ═══
const ImmersivePreview = ({ page, links }: { page: CreatorPage; links: PageLink[] }) => {
  return (
    <div className="w-full h-full bg-black text-white flex flex-col">
      {/* Hero */}
      <div className="relative h-[55%] shrink-0 overflow-hidden">
        {page.cover_url || page.avatar_url ? (
          <img
            src={page.cover_url || page.avatar_url || ''}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 75%, #000 95%)' }} />

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[7px] text-white/50">{page.connected_label || 'Active now'}</span>
          </div>
          <p className="text-[12px] font-bold tracking-tight">{page.display_name || page.username}</p>
          {page.bio && (
            <p className="text-[7px] text-white/40 mt-0.5 line-clamp-1">{page.bio}</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="flex-1 px-3 pt-3 pb-2 space-y-1.5 overflow-y-auto scrollbar-hide">
        {links.slice(0, 4).map((link) => {
          const platform = detectPlatform(link.url);
          const iconBg = link.bg_color || platform?.bgColor || '#e8503a';

          return (
            <div
              key={link.id}
              className="flex items-center gap-2 bg-white rounded-full px-2.5 py-1.5"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: iconBg }}
              >
                <LinkFavicon url={link.url} size="xs" className="text-white" />
              </div>
              <span className="text-[9px] font-semibold text-black truncate flex-1">{link.title}</span>
            </div>
          );
        })}
        {links.length > 4 && (
          <p className="text-center text-[7px] text-white/20">+{links.length - 4} liens</p>
        )}
      </div>
    </div>
  );
};

export default InlinePreview;
