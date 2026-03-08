export type ThemeTier = 'free' | 'starter' | 'pro';

export interface ThemeConfig {
  name: string;
  bg: string;
  btn: string;
  text: string;
  accent: string;
  preview: string;
  tier: ThemeTier;
  cardBg: string;
  avatarRing: string;
  subtleText: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  default: {
    name: 'Default',
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50',
    btn: 'bg-white/70 backdrop-blur-sm text-gray-800 border border-white/50 shadow-sm hover:shadow-md hover:bg-white/90 hover:-translate-y-0.5',
    text: 'text-gray-900',
    subtleText: 'text-gray-500',
    accent: 'text-purple-600',
    preview: 'bg-gradient-to-br from-purple-400 to-pink-400',
    cardBg: 'bg-white/40 backdrop-blur-md border border-white/60',
    avatarRing: 'ring-4 ring-white/60 shadow-xl',
    tier: 'free',
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100',
    btn: 'bg-white/60 backdrop-blur-sm text-gray-800 border border-orange-200/50 shadow-sm hover:shadow-md hover:bg-white/80 hover:-translate-y-0.5',
    text: 'text-gray-900',
    subtleText: 'text-orange-700/60',
    accent: 'text-orange-600',
    preview: 'bg-gradient-to-br from-orange-400 to-red-400',
    cardBg: 'bg-white/30 backdrop-blur-md border border-orange-200/40',
    avatarRing: 'ring-4 ring-orange-200/60 shadow-xl',
    tier: 'free',
  },
  ocean: {
    name: 'Ocean',
    bg: 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100',
    btn: 'bg-white/60 backdrop-blur-sm text-gray-800 border border-blue-200/50 shadow-sm hover:shadow-md hover:bg-white/80 hover:-translate-y-0.5',
    text: 'text-gray-900',
    subtleText: 'text-blue-700/60',
    accent: 'text-cyan-600',
    preview: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    cardBg: 'bg-white/30 backdrop-blur-md border border-blue-200/40',
    avatarRing: 'ring-4 ring-blue-200/60 shadow-xl',
    tier: 'free',
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900',
    btn: 'bg-white/10 backdrop-blur-md text-white border border-white/10 shadow-lg shadow-blue-500/5 hover:bg-white/15 hover:border-white/20 hover:-translate-y-0.5',
    text: 'text-white',
    subtleText: 'text-blue-300/60',
    accent: 'text-blue-400',
    preview: 'bg-gradient-to-br from-gray-800 to-blue-900',
    cardBg: 'bg-white/5 backdrop-blur-md border border-white/10',
    avatarRing: 'ring-4 ring-blue-500/30 shadow-xl shadow-blue-500/20',
    tier: 'starter',
  },
  forest: {
    name: 'Forest',
    bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
    btn: 'bg-white/60 backdrop-blur-sm text-gray-800 border border-emerald-200/50 shadow-sm hover:shadow-md hover:bg-white/80 hover:-translate-y-0.5',
    text: 'text-gray-900',
    subtleText: 'text-emerald-700/60',
    accent: 'text-emerald-600',
    preview: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    cardBg: 'bg-white/30 backdrop-blur-md border border-emerald-200/40',
    avatarRing: 'ring-4 ring-emerald-200/60 shadow-xl',
    tier: 'starter',
  },
  neon: {
    name: 'Neon',
    bg: 'bg-gray-950',
    btn: 'bg-fuchsia-500/10 backdrop-blur-md text-fuchsia-300 border border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10 hover:bg-fuchsia-500/20 hover:shadow-fuchsia-500/20 hover:border-fuchsia-400/50 hover:-translate-y-0.5',
    text: 'text-white',
    subtleText: 'text-fuchsia-400/60',
    accent: 'text-fuchsia-400',
    preview: 'bg-gradient-to-br from-fuchsia-600 to-purple-900',
    cardBg: 'bg-white/5 backdrop-blur-md border border-fuchsia-500/20',
    avatarRing: 'ring-4 ring-fuchsia-500/30 shadow-xl shadow-fuchsia-500/20',
    tier: 'starter',
  },
};

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 };

export const canAccessTheme = (themeTier: ThemeTier, userPlan: string): boolean => {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[themeTier] ?? 0);
};

export const getTheme = (key: string) => THEMES[key] || THEMES.default;
