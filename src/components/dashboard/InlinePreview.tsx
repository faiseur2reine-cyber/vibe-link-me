// InlinePreview — renders a miniature version of the public page
// directly in React. Zero iframe, zero network, instant updates.

import { useState } from 'react';
import { CreatorPage, PageLink } from '@/hooks/useCreatorPages';
import { getTheme } from '@/lib/themes';
import { detectPlatform } from '@/lib/platforms';
import { Smartphone, ExternalLink } from 'lucide-react';
import LinkFavicon from '@/components/LinkFavicon';
import { motion } from 'framer-motion';

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
  const theme = getTheme(page.theme);
  const displayName = page.display_name || page.username;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[11px] font-medium text-muted-foreground/60">Aperçu</span>
        </div>
        <a
          href={`/${page.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/40 hover:text-primary flex items-center gap-1 transition-colors"
        >
          Ouvrir <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Phone container */}
      <div className="flex-1 flex items-center justify-center p-5 overflow-hidden">
        <div className="relative" style={{ width: 260 }}>
          {/* Phone bezel */}
          <div className="rounded-[2rem] bg-gray-900 p-[6px] shadow-2xl shadow-black/20">
            {/* Screen */}
            <div
              className="rounded-[1.6rem] overflow-hidden relative"
              style={{ height: 480 }}
            >
              {/* Dynamic island */}
              <div className="absolute top-0 inset-x-0 z-20 flex justify-center pt-[6px]">
                <div className="w-20 h-[18px] bg-gray-900 rounded-full" />
              </div>

              {/* Page content */}
              <motion.div
                key={page.theme + (page.custom_bg_color || '') + (page.custom_font || '') + (page.link_layout || '')}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide"
              >
                {page.theme === 'immersive' ? (
                  <ImmersivePreview page={page} links={links} displayName={displayName} />
                ) : (
                  <StandardPreview page={page} links={links} theme={theme} displayName={displayName} />
                )}
              </motion.div>
            </div>
          </div>

          {/* Page URL below phone */}
          <p className="text-center text-[9px] text-muted-foreground/30 mt-3 font-mono">
            mytaptap.com/{page.username}
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══ STANDARD THEMES ═══
const StandardPreview = ({ page, links, theme, displayName }: {
  page: CreatorPage; links: PageLink[]; theme: ReturnType<typeof getTheme>; displayName: string;
}) => {
  const hasBg = !!page.custom_bg_color;
  const hasText = !!page.custom_text_color;
  const isDark = page.theme === 'midnight' || page.theme === 'neon' || page.theme === 'glass_dark' ||
    page.theme === 'cyber' || (page.custom_bg_color && isColorDark(page.custom_bg_color));

  const bgStyle = hasBg ? { backgroundColor: page.custom_bg_color! } : {};
  const textStyle = hasText ? { color: page.custom_text_color! } : {};
  const btnBg = page.custom_btn_color;
  const btnText = page.custom_btn_text_color;

  // Font mapping
  const fontMap: Record<string, string> = {
    'inter': "'Inter', sans-serif",
    'poppins': "'Poppins', sans-serif",
    'dm-sans': "'DM Sans', sans-serif",
    'playfair': "'Playfair Display', serif",
    'space-grotesk': "'Space Grotesk', sans-serif",
    'jetbrains': "'JetBrains Mono', monospace",
  };
  const fontFamily = page.custom_font && page.custom_font !== 'default' ? fontMap[page.custom_font] : undefined;
  const isGrid = page.link_layout === 'grid';

  const visibleLinks = links.filter(l => l.is_visible !== false);

  return (
    <div
      className={`min-h-full flex flex-col items-center pt-12 px-5 pb-6 ${hasBg ? '' : theme.bg}`}
      style={{ ...bgStyle, ...(fontFamily ? { fontFamily } : {}) }}
    >
      {/* Avatar */}
      <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ${theme.avatarRing}`}>
        {page.avatar_url ? (
          <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            <span className={`text-xl font-bold ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
              {displayName[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <p
        className={`text-[14px] mt-3 font-bold tracking-tight ${hasText ? '' : theme.text}`}
        style={textStyle}
      >
        {displayName}
      </p>

      {/* Username */}
      <p className={`text-[9px] mt-0.5 ${hasText ? 'opacity-35' : theme.subtleText}`} style={textStyle}>
        @{page.username}
      </p>

      {/* Bio */}
      {page.bio && (
        <p
          className={`text-[9px] mt-2 text-center leading-relaxed max-w-[180px] ${hasText ? 'opacity-40' : theme.subtleText}`}
          style={textStyle}
        >
          {page.bio.length > 80 ? page.bio.slice(0, 80) + '…' : page.bio}
        </p>
      )}

      {/* Links */}
      <div className={`w-full mt-5 max-w-[220px] ${isGrid ? 'grid grid-cols-2 gap-1.5' : 'space-y-2'}`}>
        {visibleLinks.slice(0, isGrid ? 6 : 5).map((link, idx) => {
          const platform = !link.bg_color && !btnBg ? detectPlatform(link.url) : null;
          const bg = link.bg_color || btnBg;
          const text = link.text_color || btnText;
          const platformColor = platform?.bgColor;

          if (isGrid) {
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.15 }}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl text-center ${bg ? '' : theme.btn.split(' hover:')[0]}`}
                style={bg ? { backgroundColor: bg, color: text || '#fff' } : {}}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={platformColor && !bg ? { backgroundColor: platformColor } :
                    bg ? { backgroundColor: isColorDark(bg) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' } :
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
                >
                  <LinkFavicon url={link.url} size="xs" className={platformColor || (bg && isColorDark(bg)) ? 'text-white' : ''} />
                </div>
                <span className="text-[8px] font-semibold truncate w-full">{link.title}</span>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
              className={`flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[10px] font-semibold ${bg ? '' : theme.btn.split(' hover:')[0]}`}
              style={{
                ...(bg ? { backgroundColor: bg, color: text || '#fff' } : {}),
                ...(platformColor && !bg ? { boxShadow: `inset 3px 0 0 ${platformColor}` } : {}),
              }}
            >
              <div
                className="w-[22px] h-[22px] rounded-lg flex items-center justify-center shrink-0"
                style={platformColor && !bg ? { backgroundColor: platformColor } :
                  bg ? { backgroundColor: isColorDark(bg) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)' } :
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
              >
                <LinkFavicon url={link.url} size="xs" className={platformColor || (bg && isColorDark(bg)) ? 'text-white' : ''} />
              </div>
              <span className="truncate flex-1">{link.title}</span>
            </motion.div>
          );
        })}
        {visibleLinks.length > (isGrid ? 6 : 5) && (
          <p className={`text-center text-[8px] pt-1 ${isGrid ? 'col-span-2' : ''} ${isDark ? 'text-white/20' : 'text-black/15'}`}>
            +{visibleLinks.length - (isGrid ? 6 : 5)} autres liens
          </p>
        )}
        {visibleLinks.length === 0 && (
          <div className={`text-center py-6 text-[9px] ${isGrid ? 'col-span-2' : ''} ${isDark ? 'text-white/20' : 'text-black/15'}`}>
            Aucun lien
          </div>
        )}
      </div>

      {/* Footer */}
      <p className={`text-[7px] mt-auto pt-4 ${isDark ? 'text-white/10' : 'text-black/8'}`}>
        Made with ♥ MyTaptap
      </p>
    </div>
  );
};

// ═══ IMMERSIVE THEME ═══
const ImmersivePreview = ({ page, links, displayName }: {
  page: CreatorPage; links: PageLink[]; displayName: string;
}) => {
  return (
    <div className="w-full h-full bg-black text-white flex flex-col">
      {/* Hero */}
      <div className="relative h-[52%] shrink-0 overflow-hidden">
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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 15%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.8) 70%, #000 95%)' }} />

        {/* Name overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[7px] text-white/40">{page.connected_label || 'Active now'}</span>
          </div>
          <p className="text-[14px] font-bold tracking-tight leading-tight">{displayName}</p>
          {page.bio && (
            <p className="text-[8px] text-white/35 mt-0.5 line-clamp-1">{page.bio}</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="flex-1 px-4 pt-4 pb-3 space-y-2 overflow-y-auto scrollbar-hide">
        {links.filter(l => l.is_visible !== false).slice(0, 4).map((link, idx) => {
          const platform = detectPlatform(link.url);
          const iconBg = link.bg_color || platform?.bgColor || '#e8503a';

          return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
              className="flex items-center gap-2.5 bg-white rounded-full px-3 py-[7px]"
            >
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: iconBg }}
              >
                <LinkFavicon url={link.url} size="xs" className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-black truncate flex-1">{link.title}</span>
            </motion.div>
          );
        })}
        {links.length > 4 && (
          <p className="text-center text-[7px] text-white/15 pt-1">+{links.length - 4} liens</p>
        )}
      </div>
    </div>
  );
};

export default InlinePreview;
