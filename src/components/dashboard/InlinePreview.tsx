// InlinePreview — renders a miniature version of the public page
// directly in React. Zero iframe, zero network, instant updates.

import { useState } from 'react';
import { CreatorPage, PageLink } from '@/hooks/useCreatorPages';
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
                  <StandardPreview page={page} links={links} displayName={displayName} />
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

// Explicit colors per theme for the miniature preview (Tailwind gradients are too subtle at 260px)
const THEME_COLORS: Record<string, { bg: string; text: string; sub: string; btn: string; btnText: string; ring: string }> = {
  default:    { bg: '#f9fafb', text: '#111827', sub: '#9ca3af', btn: '#ffffff', btnText: '#111827', ring: '#ffffff' },
  sunset:     { bg: '#fff5ed', text: '#431407', sub: '#c2410c', btn: '#fff7ed', btnText: '#9a3412', ring: '#fed7aa' },
  ocean:      { bg: '#eff6ff', text: '#1e3a5f', sub: '#3b82f6', btn: '#eff6ff', btnText: '#1e40af', ring: '#bfdbfe' },
  midnight:   { bg: '#0a0a0f', text: '#e5e7eb', sub: '#6b7280', btn: 'rgba(255,255,255,0.06)', btnText: '#d1d5db', ring: '#374151' },
  forest:     { bg: '#ecfdf5', text: '#064e3b', sub: '#059669', btn: '#f0fdf4', btnText: '#065f46', ring: '#a7f3d0' },
  neon:       { bg: '#08080c', text: '#f0abfc', sub: '#a855f7', btn: 'rgba(217,70,239,0.08)', btnText: '#e879f9', ring: '#581c87' },
  glass_dark: { bg: '#111118', text: '#e5e7eb', sub: '#6b7280', btn: 'rgba(255,255,255,0.05)', btnText: '#d1d5db', ring: '#1f2937' },
  pastel:     { bg: '#fdf2f8', text: '#4c1d95', sub: '#8b5cf6', btn: '#faf5ff', btnText: '#5b21b6', ring: '#e9d5ff' },
  brutalist:  { bg: '#f5f0e8', text: '#000000', sub: '#000000', btn: '#ffffff', btnText: '#000000', ring: '#000000' },
  aurora:     { bg: '#0c0a1a', text: '#e5e7eb', sub: '#34d399', btn: 'rgba(255,255,255,0.05)', btnText: '#a7f3d0', ring: '#064e3b' },
  cyber:      { bg: '#050510', text: '#ecfeff', sub: '#22d3ee', btn: 'rgba(34,211,238,0.06)', btnText: '#a5f3fc', ring: '#164e63' },
  marble:     { bg: '#f5f5f0', text: '#44403c', sub: '#a8a29e', btn: '#ffffff', btnText: '#44403c', ring: '#e7e5e4' },
  minimal:    { bg: '#ffffff', text: '#171717', sub: '#a3a3a3', btn: '#ffffff', btnText: '#171717', ring: '#e5e5e5' },
};

const StandardPreview = ({ page, links, displayName }: {
  page: CreatorPage; links: PageLink[]; displayName: string;
}) => {
  const hasBg = !!page.custom_bg_color;
  const hasText = !!page.custom_text_color;
  const colors = THEME_COLORS[page.theme] || THEME_COLORS.default;
  const isDark = page.theme === 'midnight' || page.theme === 'neon' || page.theme === 'glass_dark' ||
    page.theme === 'aurora' || page.theme === 'cyber' ||
    (page.custom_bg_color && isColorDark(page.custom_bg_color));

  const bg = hasBg ? page.custom_bg_color! : colors.bg;
  const text = hasText ? page.custom_text_color! : colors.text;
  const sub = hasText ? page.custom_text_color! : colors.sub;
  const btnBg = page.custom_btn_color || colors.btn;
  const btnText = page.custom_btn_text_color || colors.btnText;

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

  // Brutalist special: thick borders + offset shadow
  const isBrutalist = page.theme === 'brutalist';

  return (
    <div
      className="min-h-full flex flex-col items-center pt-12 px-5 pb-6"
      style={{ backgroundColor: bg, color: text, ...(fontFamily ? { fontFamily } : {}) }}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden shrink-0"
        style={{ boxShadow: `0 0 0 3px ${colors.ring}` }}
      >
        {page.avatar_url ? (
          <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }}>
            <span className="text-xl font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>
              {displayName[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <p className="text-[14px] mt-3 font-bold tracking-tight">{displayName}</p>

      {/* Username */}
      <p className="text-[9px] mt-0.5" style={{ color: sub, opacity: 0.6 }}>@{page.username}</p>

      {/* Bio */}
      {page.bio && (
        <p className="text-[9px] mt-2 text-center leading-relaxed max-w-[180px]" style={{ color: sub, opacity: 0.5 }}>
          {page.bio.length > 80 ? page.bio.slice(0, 80) + '…' : page.bio}
        </p>
      )}

      {/* Links */}
      <div className={`w-full mt-5 max-w-[220px] ${isGrid ? 'grid grid-cols-2 gap-1.5' : 'space-y-2'}`}>
        {visibleLinks.slice(0, isGrid ? 6 : 5).map((link, idx) => {
          const platform = !link.bg_color && !page.custom_btn_color ? detectPlatform(link.url) : null;
          const linkBg = link.bg_color || btnBg;
          const linkText = link.text_color || btnText;
          const platformColor = platform?.bgColor;

          const buttonStyle: React.CSSProperties = {
            backgroundColor: linkBg,
            color: linkText,
            ...(isBrutalist ? { border: '2px solid #000', boxShadow: '2px 2px 0 #000' } : {}),
            ...(platformColor && !link.bg_color && !page.custom_btn_color ? { boxShadow: `inset 3px 0 0 ${platformColor}` } : {}),
          };

          if (isGrid) {
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.15 }}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl text-center"
                style={buttonStyle}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: platformColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') }}
                >
                  <LinkFavicon url={link.url} size="xs" className={platformColor ? 'text-white' : ''} />
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
              className="flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[10px] font-semibold"
              style={buttonStyle}
            >
              <div
                className="w-[22px] h-[22px] rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: platformColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') }}
              >
                <LinkFavicon url={link.url} size="xs" className={platformColor ? 'text-white' : ''} />
              </div>
              <span className="truncate flex-1">{link.title}</span>
            </motion.div>
          );
        })}
        {visibleLinks.length > (isGrid ? 6 : 5) && (
          <p className={`text-center text-[8px] pt-1 ${isGrid ? 'col-span-2' : ''}`} style={{ color: sub, opacity: 0.3 }}>
            +{visibleLinks.length - (isGrid ? 6 : 5)} autres liens
          </p>
        )}
        {visibleLinks.length === 0 && (
          <div className={`text-center py-6 text-[9px] ${isGrid ? 'col-span-2' : ''}`} style={{ color: sub, opacity: 0.3 }}>
            Aucun lien
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-[7px] mt-auto pt-4" style={{ color: text, opacity: 0.08 }}>
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
