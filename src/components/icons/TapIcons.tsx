/**
 * TapIcons — MyTaptap custom SVG icon set
 * Style: Neo-geometric, bold rounded strokes (2.5px), slightly playful proportions.
 * Every path is hand-crafted to give MyTaptap a distinctive visual identity.
 */

import { forwardRef, SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

const I = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className, children, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
);
I.displayName = 'IconBase';

// ─── Arrows ─────────────────────────────────────────
export const TapArrowRight = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="M4 12h15" /><path d="m14 6 6 6-6 6" /></I>
));
TapArrowRight.displayName = 'TapArrowRight';

export const TapArrowLeft = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="M20 12H5" /><path d="m10 18-6-6 6-6" /></I>
));
TapArrowLeft.displayName = 'TapArrowLeft';

export const TapArrowUp = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="M12 20V5" /><path d="m6 10 6-6 6 6" /></I>
));
TapArrowUp.displayName = 'TapArrowUp';

export const TapArrowUpRight = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="M8 16 17 7" /><path d="M10 7h7v7" /></I>
));
TapArrowUpRight.displayName = 'TapArrowUpRight';

export const TapChevronDown = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="m6 9 6 6 6-6" /></I>
));
TapChevronDown.displayName = 'TapChevronDown';

export const TapChevronRight = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="m9 6 6 6-6 6" /></I>
));
TapChevronRight.displayName = 'TapChevronRight';

// ─── Actions ────────────────────────────────────────
export const TapPlus = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="M12 5v14" /><path d="M5 12h14" /></I>
));
TapPlus.displayName = 'TapPlus';

export const TapX = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></I>
));
TapX.displayName = 'TapX';

export const TapCheck = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}><path d="M4 12.5 9.5 18 20 6" /></I>
));
TapCheck.displayName = 'TapCheck';

export const TapCopy = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2.5" />
    <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
  </I>
));
TapCopy.displayName = 'TapCopy';

export const TapTrash = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M4 7h16" />
    <path d="M6 7v11a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M10 11v5" /><path d="M14 11v5" />
  </I>
));
TapTrash.displayName = 'TapTrash';

export const TapPencil = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M15.232 5.232a2.5 2.5 0 0 1 3.536 3.536L7.5 20.035 3 21l.965-4.5Z" />
    <path d="m13.5 6.5 4 4" />
  </I>
));
TapPencil.displayName = 'TapPencil';

export const TapSearch = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m21 21-4.35-4.35" />
  </I>
));
TapSearch.displayName = 'TapSearch';

// ─── Navigation / UI ────────────────────────────────
export const TapHome = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.5" />
    <path d="M10 21v-6h4v6" />
  </I>
));
TapHome.displayName = 'TapHome';

export const TapGrid = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </I>
));
TapGrid.displayName = 'TapGrid';

export const TapSettings = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" />
  </I>
));
TapSettings.displayName = 'TapSettings';

export const TapUser = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="12" cy="8" r="4.5" />
    <path d="M4 21c0-3.5 3.5-6.5 8-6.5s8 3 8 6.5" />
  </I>
));
TapUser.displayName = 'TapUser';

export const TapLogOut = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M15 12H3" /><path d="m7 8-4 4 4 4" />
    <path d="M11 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" />
  </I>
));
TapLogOut.displayName = 'TapLogOut';

// ─── Theme / Display ────────────────────────────────
export const TapSun = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3" /><path d="M12 19v3" />
    <path d="m5.64 5.64 2.12 2.12" /><path d="m16.24 16.24 2.12 2.12" />
    <path d="M2 12h3" /><path d="M19 12h3" />
    <path d="m5.64 18.36 2.12-2.12" /><path d="m16.24 7.76 2.12-2.12" />
  </I>
));
TapSun.displayName = 'TapSun';

export const TapMoon = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
  </I>
));
TapMoon.displayName = 'TapMoon';

export const TapPalette = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 8 10 8 1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3.1 0 4.6-2.5 4.6-5.2C22 5.8 17.52 2 12 2Z" />
    <circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
  </I>
));
TapPalette.displayName = 'TapPalette';

export const TapEye = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </I>
));
TapEye.displayName = 'TapEye';

export const TapEyeOff = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M2 2 22 22" />
    <path d="M6.71 6.71C4.57 8.27 3 10.5 2.5 12c1 3 4.5 6.5 9.5 6.5 1.87 0 3.54-.56 4.95-1.46" />
    <path d="M12 5.5c5 0 9.5 6.5 9.5 6.5-.42.79-1.13 1.87-2.08 2.9" />
    <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
  </I>
));
TapEyeOff.displayName = 'TapEyeOff';

// ─── Brand / Decorative ────────────────────────────
export const TapSparkles = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M9.5 2 11 7.5 16.5 9 11 10.5 9.5 16 8 10.5 2.5 9 8 7.5Z" />
    <path d="M17 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" />
  </I>
));
TapSparkles.displayName = 'TapSparkles';

export const TapZap = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M13 2 4.5 13H12l-1 9L19.5 11H12l1-9Z" />
  </I>
));
TapZap.displayName = 'TapZap';

export const TapStar = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z" />
  </I>
));
TapStar.displayName = 'TapStar';

export const TapHeart = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M12 21C12 21 3.5 14.5 3.5 8.5A4.5 4.5 0 0 1 12 5.09 4.5 4.5 0 0 1 20.5 8.5C20.5 14.5 12 21 12 21Z" />
  </I>
));
TapHeart.displayName = 'TapHeart';

export const TapCrown = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M3 18h18" />
    <path d="M3 14 6 6l4.5 5L12 3l1.5 8L18 6l3 8Z" />
  </I>
));
TapCrown.displayName = 'TapCrown';

// ─── Data / Analytics ───────────────────────────────
export const TapChart = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M3 21V3" /><path d="M3 21h18" />
    <path d="M7 14v4" /><path d="M11 10v8" /><path d="M15 7v11" /><path d="M19 4v14" />
  </I>
));
TapChart.displayName = 'TapChart';

export const TapTrending = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </I>
));
TapTrending.displayName = 'TapTrending';

export const TapClick = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M9 9 4 20l5.5-2.5L12 23l3-11-6-3Z" />
    <path d="M12 2v4" /><path d="m18.4 5.6-2.8 2.8" /><path d="M22 12h-4" />
  </I>
));
TapClick.displayName = 'TapClick';

export const TapDollar = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
  </I>
));
TapDollar.displayName = 'TapDollar';

// ─── Links / External ───────────────────────────────
export const TapLink = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L12 5" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12 19" />
  </I>
));
TapLink.displayName = 'TapLink';

export const TapExternalLink = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" /><path d="M10 14 21 3" />
  </I>
));
TapExternalLink.displayName = 'TapExternalLink';

export const TapShare = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.59 13.51 6.83 3.98" /><path d="m15.41 6.51-6.82 3.98" />
  </I>
));
TapShare.displayName = 'TapShare';

// ─── Media ──────────────────────────────────────────
export const TapCamera = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <circle cx="12" cy="14" r="3.5" />
  </I>
));
TapCamera.displayName = 'TapCamera';

export const TapImagePlus = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="m3 16 5-5 4 4 3-3 6 6" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
  </I>
));
TapImagePlus.displayName = 'TapImagePlus';

// ─── Misc ───────────────────────────────────────────
export const TapGlobe = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
  </I>
));
TapGlobe.displayName = 'TapGlobe';

export const TapSmartphone = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <path d="M12 18h.01" />
  </I>
));
TapSmartphone.displayName = 'TapSmartphone';

export const TapGrip = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </I>
));
TapGrip.displayName = 'TapGrip';

export const TapClock = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2.5" />
  </I>
));
TapClock.displayName = 'TapClock';

export const TapCalendar = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
  </I>
));
TapCalendar.displayName = 'TapCalendar';

export const TapShield = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M12 2 4 6v6c0 5.5 3.5 10 8 12 4.5-2 8-6.5 8-12V6Z" />
    <path d="m9 12 2 2 4-4" />
  </I>
));
TapShield.displayName = 'TapShield';

export const TapLoader = forwardRef<SVGSVGElement, IconProps>(({ className, ...p }, ref) => (
  <I ref={ref} className={`animate-spin ${className || ''}`} {...p}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </I>
));
TapLoader.displayName = 'TapLoader';

export const TapMapPin = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M12 21c-4-4-7-7.5-7-11a7 7 0 0 1 14 0c0 3.5-3 7-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </I>
));
TapMapPin.displayName = 'TapMapPin';

export const TapWifi = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M5 12.86a10 10 0 0 1 14 0" />
    <path d="M8.5 16.73a5 5 0 0 1 7 0" />
    <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
  </I>
));
TapWifi.displayName = 'TapWifi';

export const TapCheckSquare = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="m8 12 3 3 5-5" />
  </I>
));
TapCheckSquare.displayName = 'TapCheckSquare';

export const TapSquare = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </I>
));
TapSquare.displayName = 'TapSquare';

export const TapBriefcase = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2.5" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <path d="M2 13h20" />
  </I>
));
TapBriefcase.displayName = 'TapBriefcase';

export const TapShoppingCart = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M1 1h4l1.68 8.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L22 5H6" />
    <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
  </I>
));
TapShoppingCart.displayName = 'TapShoppingCart';

export const TapBookmark = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18l-7-4-7 4Z" />
  </I>
));
TapBookmark.displayName = 'TapBookmark';

export const TapLayout = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M3 9h18" /><path d="M9 21V9" />
  </I>
));
TapLayout.displayName = 'TapLayout';

export const TapRefresh = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </I>
));
TapRefresh.displayName = 'TapRefresh';

export const TapCreditCard = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="1" y="4" width="22" height="16" rx="3" />
    <path d="M1 10h22" />
  </I>
));
TapCreditCard.displayName = 'TapCreditCard';

export const TapAlert = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4" /><circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </I>
));
TapAlert.displayName = 'TapAlert';

export const TapAtSign = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0V12a10 10 0 1 0-4 8" />
  </I>
));
TapAtSign.displayName = 'TapAtSign';

export const TapMusic = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </I>
));
TapMusic.displayName = 'TapMusic';

export const TapHash = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M4 9h16" /><path d="M4 15h16" /><path d="M10 3 8 21" /><path d="M16 3l-2 18" />
  </I>
));
TapHash.displayName = 'TapHash';

export const TapFacebook = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
  </I>
));
TapFacebook.displayName = 'TapFacebook';

export const TapSortAZ = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M3 6h7" /><path d="M3 12h5" /><path d="M3 18h3" />
    <path d="M16 4v16" /><path d="m13 17 3 3 3-3" />
  </I>
));
TapSortAZ.displayName = 'TapSortAZ';

export const TapSortUpDown = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="M8 4v16" /><path d="m5 7 3-3 3 3" />
    <path d="M16 20V4" /><path d="m13 17 3 3 3-3" />
  </I>
));
TapSortUpDown.displayName = 'TapSortUpDown';

export const TapTrendingDown = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <path d="m22 17-8.5-8.5-5 5L2 7" />
    <path d="M16 17h6v-6" />
  </I>
));
TapTrendingDown.displayName = 'TapTrendingDown';

export const TapLock = forwardRef<SVGSVGElement, IconProps>((p, ref) => (
  <I ref={ref} {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </I>
));
TapLock.displayName = 'TapLock';
