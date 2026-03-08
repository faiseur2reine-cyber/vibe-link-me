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
  // --- PRO THEMES ---
  glass_dark: {
    name: 'Glass Dark',
    bg: 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900',
    btn: 'bg-white/[0.07] backdrop-blur-xl text-white/90 border border-white/[0.12] shadow-lg shadow-black/20 hover:bg-white/[0.12] hover:border-white/20 hover:-translate-y-0.5',
    text: 'text-white',
    subtleText: 'text-white/40',
    accent: 'text-sky-400',
    preview: 'bg-gradient-to-br from-gray-800 to-slate-900',
    cardBg: 'bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/30',
    avatarRing: 'ring-4 ring-white/10 shadow-2xl shadow-sky-500/10',
    tier: 'pro',
  },
  pastel: {
    name: 'Pastel Dream',
    bg: 'bg-gradient-to-br from-pink-100 via-violet-100 to-cyan-100',
    btn: 'bg-white/80 backdrop-blur-sm text-violet-900 border border-violet-200/40 shadow-sm hover:shadow-md hover:bg-white/95 hover:-translate-y-0.5',
    text: 'text-violet-950',
    subtleText: 'text-violet-400',
    accent: 'text-pink-500',
    preview: 'bg-gradient-to-br from-pink-300 to-violet-300',
    cardBg: 'bg-white/50 backdrop-blur-md border border-violet-200/30',
    avatarRing: 'ring-4 ring-violet-200/50 shadow-xl shadow-pink-200/30',
    tier: 'pro',
  },
  brutalist: {
    name: 'Brutalist',
    bg: 'bg-yellow-50',
    btn: 'bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
    text: 'text-black',
    subtleText: 'text-gray-600',
    accent: 'text-red-600',
    preview: 'bg-yellow-300 border-2 border-black',
    cardBg: 'bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
    avatarRing: 'ring-4 ring-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    tier: 'pro',
  },
};

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 };

export const canAccessTheme = (themeTier: ThemeTier, userPlan: string): boolean => {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[themeTier] ?? 0);
};

export const getTheme = (key: string) => THEMES[key] || THEMES.default;
