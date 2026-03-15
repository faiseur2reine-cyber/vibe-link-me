// InlinePreview — renders a miniature version of the public page
// directly in React. Zero iframe, zero network, instant updates.

import { useState } from 'react';
import { CreatorPage, PageLink } from '@/hooks/useCreatorPages';
import { detectPlatform } from '@/lib/platforms';
import { TapSmartphone as Smartphone, TapExternalLink as ExternalLink } from '@/components/icons/TapIcons';
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
                key={page.theme + (page.custom_bg_color || '') + (page.custom_font || '') + (page.link_layout || '') + (page.button_radius ?? '') + (page.button_style || '') + (page.avatar_shape || '') + (page.content_spacing || '')}
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

// Saturated colors for 260px miniature — must be visually distinct at a glance
const THEME_COLORS: Record<string, { bg: string; text: string; sub: string; btn: string; btnText: string; ring: string; border?: string }> = {
  default:    { bg: '#f0f0f2',  text: '#18181b', sub: '#a1a1aa', btn: '#ffffff',              btnText: '#18181b', ring: '#d4d4d8' },
  sunset:     { bg: '#fcc891',  text: '#7c2d12', sub: '#ea580c', btn: '#fde68a',              btnText: '#92400e', ring: '#f59e0b' },
  ocean:      { bg: '#93c5fd',  text: '#1e3a5f', sub: '#1d4ed8', btn: '#bfdbfe',              btnText: '#1e3a5f', ring: '#3b82f6' },
  midnight:   { bg: '#09090f',  text: '#e4e4e7', sub: '#52525b', btn: 'rgba(255,255,255,0.08)', btnText: '#d4d4d8', ring: '#27272a' },
  neon:       { bg: '#0a0a0f',  text: '#f0abfc', sub: '#c026d3', btn: 'rgba(192,38,211,0.25)', btnText: '#f0abfc', ring: '#86198f' },
  pastel:     { bg: '#f0abfc',  text: '#581c87', sub: '#7c3aed', btn: '#e9d5ff',              btnText: '#6b21a8', ring: '#a855f7' },
  brutalist:  { bg: '#f5f0e8',  text: '#000000', sub: '#000000', btn: '#ffffff',              btnText: '#000000', ring: '#000000', border: '2px solid #000' },
  cyber:      { bg: '#050510',  text: '#a5f3fc', sub: '#06b6d4', btn: 'rgba(6,182,212,0.15)',  btnText: '#67e8f9', ring: '#155e75' },
  minimal:    { bg: '#ffffff',  text: '#171717', sub: '#a3a3a3', btn: '#f5f5f5',              btnText: '#171717', ring: '#e5e5e5' },
};

const StandardPreview = ({ page, links, displayName }: {
  page: CreatorPage; links: PageLink[]; displayName: string;
}) => {
  const hasBg = !!page.custom_bg_color;
  const hasText = !!page.custom_text_color;
  const colors = THEME_COLORS[page.theme] || THEME_COLORS.default;
  const isDark = page.theme === 'midnight' || page.theme === 'neon' || page.theme === 'cyber' ||
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

  // Design controls
  const isBrutalist = page.theme === 'brutalist';
  const btnRadius = page.button_radius ?? 16;
  const avatarShape = page.avatar_shape || 'circle';
  const avatarR = avatarShape === 'circle' ? '50%' : avatarShape === 'rounded' ? '20%' : '0';
  const spacing = page.content_spacing || 'default';
  const linkGap = spacing === 'compact' ? '4px' : spacing === 'spacious' ? '12px' : '8px';

  return (
    <div
      className="min-h-full flex flex-col items-center pt-12 px-5 pb-6"
      style={{ backgroundColor: bg, color: text, ...(fontFamily ? { fontFamily } : {}) }}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 overflow-hidden shrink-0"
        style={{ borderRadius: avatarR, boxShadow: `0 0 0 3px ${colors.ring}` }}
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
      <div className={`w-full mt-5 max-w-[220px] ${isGrid ? 'grid grid-cols-2 gap-1.5' : ''}`}
        style={!isGrid ? { display: 'flex', flexDirection: 'column', gap: linkGap } : {}}
      >
        {visibleLinks.slice(0, isGrid ? 6 : 5).map((link, idx) => {
          const platform = !link.bg_color && !page.custom_btn_color ? detectPlatform(link.url) : null;
          const linkBg = link.bg_color || btnBg;
          const linkText = link.text_color || btnText;
          const platformColor = platform?.bgColor;

          const buttonStyle: React.CSSProperties = {
            backgroundColor: linkBg,
            color: linkText,
            borderRadius: `${Math.min(btnRadius, isGrid ? 12 : btnRadius)}px`,
            ...(isBrutalist ? { border: '2px solid #000', boxShadow: '2px 2px 0 #000' } :
              !isDark ? { border: '1px solid rgba(0,0,0,0.06)' } : { border: '1px solid rgba(255,255,255,0.06)' }),
            ...(platformColor && !link.bg_color && !page.custom_btn_color ? { borderLeft: `2px solid ${platformColor}` } : {}),
          };

          if (isGrid) {
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.15 }}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 text-center"
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
              className="flex items-center gap-2.5 px-3 py-[9px] text-[10px] font-semibold"
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
  const heroSrc = page.cover_url || null;
  const visibleLinks = links.filter(l => l.is_visible !== false);

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white flex flex-col" style={{ fontFamily: "'Public Sans', -apple-system, sans-serif" }}>
      {/* Hero — mirrors real 55dvh hero */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: '48%' }}>
        {heroSrc ? (
          <img src={heroSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1035 35%, #0d2847 65%, #0a1628 100%)' }} />
        )}
        {/* Cinematic gradient — matches real 7-stop */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(10,10,10,0.15) 0%, transparent 25%, transparent 40%, rgba(10,10,10,0.35) 55%, rgba(10,10,10,0.75) 72%, rgba(10,10,10,0.95) 85%, #0a0a0a 98%)',
        }} />

        {/* Profile info at bottom of hero */}
        <div className="absolute bottom-2.5 left-3 right-3 text-center">
          {/* Avatar */}
          {page.avatar_url && (
            <div className="flex justify-center mb-2">
              <div className="relative">
                <img
                  src={page.avatar_url}
                  alt=""
                  className={`${heroSrc ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover`}
                  style={{ border: '2px solid rgba(255,255,255,0.15)' }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-[1.5px] border-[#0a0a0a]" />
              </div>
            </div>
          )}
          <p className="text-[13px] font-extrabold tracking-tight leading-tight">{displayName}</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            {!page.avatar_url && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
            <span className="text-[7px] text-white/35 font-medium">{page.connected_label || 'Active now'}</span>
          </div>
          {page.bio && (
            <p className="text-[7px] text-white/40 mt-1 line-clamp-2 max-w-[180px] mx-auto leading-relaxed">{page.bio}</p>
          )}
        </div>
      </div>

      {/* Links — glass squircle buttons like real layout */}
      <div className="flex-1 px-3 pt-3 pb-3 flex flex-col gap-[6px] overflow-y-auto scrollbar-hide">
        {visibleLinks.slice(0, 5).map((link, idx) => {
          const iconBg = link.bg_color && link.bg_color !== '#FFFFFF' && link.bg_color !== '#ffffff'
            ? link.bg_color : '#e8503a';

          const isFeatured = link.style === 'featured';

          return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
              className="flex items-center"
              style={{
                background: isFeatured ? iconBg : 'rgba(255,255,255,0.97)',
                borderRadius: 8,
                padding: '0 8px 0 0',
                minHeight: isFeatured ? 36 : 32,
                border: isFeatured ? 'none' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isFeatured
                  ? `0 2px 8px ${iconBg}40`
                  : '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Icon */}
              <div className="w-[32px] h-full flex items-center justify-center shrink-0" style={{ minHeight: isFeatured ? 36 : 32 }}>
                {link.thumbnail_url ? (
                  <div className="w-[22px] h-[22px] rounded-[5px] overflow-hidden shrink-0">
                    <img src={link.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isFeatured ? 'rgba(255,255,255,0.2)' : iconBg }}>
                    <LinkFavicon url={link.url} size="xs" className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`block text-[9px] font-bold truncate ${isFeatured ? 'text-white' : 'text-[#111]'}`}>{link.title}</span>
                {link.description && (
                  <span className={`block text-[6px] truncate mt-px ${isFeatured ? 'text-white/50' : 'text-[#999]'}`}>{link.description}</span>
                )}
              </div>
            </motion.div>
          );
        })}
        {visibleLinks.length > 5 && (
          <p className="text-center text-[7px] text-white/15 pt-0.5">+{visibleLinks.length - 5} liens</p>
        )}
        {visibleLinks.length === 0 && (
          <p className="text-center text-[7px] text-white/15 pt-4">Pas encore de liens</p>
        )}
      </div>
    </div>
  );
};

export default InlinePreview;
