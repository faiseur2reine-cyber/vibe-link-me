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
    bg: 'bg-gradient-to-b from-gray-50 to-white',
    btn: 'bg-white text-gray-900 border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-gray-300/80 hover:-translate-y-[1px]',
    text: 'text-gray-900',
    subtleText: 'text-gray-400',
    accent: 'text-gray-900',
    preview: 'bg-gradient-to-b from-gray-100 to-white',
    cardBg: 'bg-white border border-gray-100',
    avatarRing: 'ring-[3px] ring-white shadow-lg shadow-black/8',
    tier: 'free',
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50',
    btn: 'bg-white/90 backdrop-blur-sm text-gray-800 border border-orange-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(251,146,60,0.12)] hover:border-orange-200/80 hover:-translate-y-[1px]',
    text: 'text-gray-900',
    subtleText: 'text-orange-400/70',
    accent: 'text-orange-500',
    preview: 'bg-gradient-to-b from-orange-200 to-rose-200',
    cardBg: 'bg-white/60 backdrop-blur-sm border border-orange-100/40',
    avatarRing: 'ring-[3px] ring-white/80 shadow-lg shadow-orange-200/30',
    tier: 'free',
  },
  ocean: {
    name: 'Ocean',
    bg: 'bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50',
    btn: 'bg-white/90 backdrop-blur-sm text-gray-800 border border-blue-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(56,189,248,0.12)] hover:border-blue-200/80 hover:-translate-y-[1px]',
    text: 'text-gray-900',
    subtleText: 'text-blue-400/70',
    accent: 'text-blue-500',
    preview: 'bg-gradient-to-b from-sky-300 to-blue-400',
    cardBg: 'bg-white/60 backdrop-blur-sm border border-blue-100/40',
    avatarRing: 'ring-[3px] ring-white/80 shadow-lg shadow-blue-200/30',
    tier: 'free',
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-[#0a0a0f]',
    btn: 'bg-white/[0.06] backdrop-blur-md text-white/90 border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.14] hover:-translate-y-[1px]',
    text: 'text-white',
    subtleText: 'text-white/35',
    accent: 'text-blue-400',
    preview: 'bg-gradient-to-b from-slate-800 to-slate-950',
    cardBg: 'bg-white/[0.04] backdrop-blur-md border border-white/[0.06]',
    avatarRing: 'ring-[3px] ring-white/10 shadow-lg shadow-blue-500/10',
    tier: 'starter',
  },
  forest: {
    name: 'Forest',
    bg: 'bg-gradient-to-b from-emerald-50 via-green-50/50 to-teal-50',
    btn: 'bg-white/90 backdrop-blur-sm text-gray-800 border border-emerald-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(52,211,153,0.12)] hover:border-emerald-200/80 hover:-translate-y-[1px]',
    text: 'text-gray-900',
    subtleText: 'text-emerald-500/60',
    accent: 'text-emerald-500',
    preview: 'bg-gradient-to-b from-emerald-300 to-teal-400',
    cardBg: 'bg-white/60 backdrop-blur-sm border border-emerald-100/40',
    avatarRing: 'ring-[3px] ring-white/80 shadow-lg shadow-emerald-200/30',
    tier: 'starter',
  },
  neon: {
    name: 'Neon',
    bg: 'bg-[#08080c]',
    btn: 'bg-fuchsia-500/[0.08] backdrop-blur-md text-fuchsia-100 border border-fuchsia-500/15 hover:bg-fuchsia-500/[0.14] hover:border-fuchsia-400/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.12)] hover:-translate-y-[1px]',
    text: 'text-white',
    subtleText: 'text-fuchsia-300/40',
    accent: 'text-fuchsia-400',
    preview: 'bg-gradient-to-b from-fuchsia-600 to-purple-900',
    cardBg: 'bg-white/[0.03] backdrop-blur-md border border-fuchsia-500/10',
    avatarRing: 'ring-[3px] ring-fuchsia-500/20 shadow-lg shadow-fuchsia-500/10',
    tier: 'starter',
  },
  // --- PRO THEMES ---
  glass_dark: {
    name: 'Glass Dark',
    bg: 'bg-gradient-to-b from-[#111118] via-[#16161f] to-[#111118]',
    btn: 'bg-white/[0.05] backdrop-blur-xl text-white/90 border border-white/[0.06] hover:bg-white/[0.09] hover:border-white/[0.12] hover:-translate-y-[1px]',
    text: 'text-white',
    subtleText: 'text-white/30',
    accent: 'text-sky-400',
    preview: 'bg-gradient-to-b from-gray-800 to-slate-900',
    cardBg: 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]',
    avatarRing: 'ring-[3px] ring-white/8 shadow-xl shadow-sky-500/5',
    tier: 'pro',
  },
  pastel: {
    name: 'Pastel Dream',
    bg: 'bg-gradient-to-b from-pink-50 via-violet-50 to-cyan-50',
    btn: 'bg-white/80 backdrop-blur-sm text-violet-900 border border-violet-100/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(139,92,246,0.1)] hover:border-violet-200/60 hover:-translate-y-[1px]',
    text: 'text-violet-950',
    subtleText: 'text-violet-300',
    accent: 'text-pink-500',
    preview: 'bg-gradient-to-b from-pink-200 to-violet-200',
    cardBg: 'bg-white/50 backdrop-blur-sm border border-violet-100/30',
    avatarRing: 'ring-[3px] ring-violet-100/50 shadow-lg shadow-pink-200/20',
    tier: 'pro',
  },
  brutalist: {
    name: 'Brutalist',
    bg: 'bg-[#f5f0e8]',
    btn: 'bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]',
    text: 'text-black',
    subtleText: 'text-gray-500',
    accent: 'text-red-600',
    preview: 'bg-[#f5f0e8] border-2 border-black',
    cardBg: 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    avatarRing: 'ring-[3px] ring-black',
    tier: 'pro',
  },
  aurora: {
    name: 'Aurora',
    bg: 'bg-gradient-to-b from-[#0c0a1a] via-[#0a1a15] to-[#0a1220]',
    btn: 'bg-white/[0.05] backdrop-blur-md text-white/90 border border-emerald-500/10 hover:bg-white/[0.09] hover:border-emerald-400/20 hover:shadow-[0_0_24px_rgba(52,211,153,0.08)] hover:-translate-y-[1px]',
    text: 'text-white',
    subtleText: 'text-emerald-300/35',
    accent: 'text-emerald-400',
    preview: 'bg-gradient-to-b from-violet-500 via-emerald-400 to-sky-400',
    cardBg: 'bg-white/[0.03] backdrop-blur-xl border border-emerald-500/8',
    avatarRing: 'ring-[3px] ring-emerald-400/15 shadow-lg shadow-emerald-500/8',
    tier: 'pro',
  },
  cyber: {
    name: 'Cyber',
    bg: 'bg-[#050510]',
    btn: 'bg-cyan-500/[0.06] backdrop-blur-md text-cyan-50 border border-cyan-400/12 hover:bg-cyan-400/[0.1] hover:border-cyan-400/25 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] hover:-translate-y-[1px]',
    text: 'text-white',
    subtleText: 'text-cyan-400/35',
    accent: 'text-cyan-400',
    preview: 'bg-gradient-to-b from-cyan-900 to-gray-950',
    cardBg: 'bg-cyan-500/[0.03] backdrop-blur-xl border border-cyan-500/8',
    avatarRing: 'ring-[3px] ring-cyan-400/15 shadow-lg shadow-cyan-500/10',
    tier: 'pro',
  },
  marble: {
    name: 'Marble',
    bg: 'bg-gradient-to-b from-stone-50 via-white to-stone-100',
    btn: 'bg-white text-stone-800 border border-stone-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-stone-300/60 hover:-translate-y-[1px]',
    text: 'text-stone-900',
    subtleText: 'text-stone-400',
    accent: 'text-amber-700',
    preview: 'bg-gradient-to-b from-stone-200 to-stone-100',
    cardBg: 'bg-white/70 border border-stone-200/40',
    avatarRing: 'ring-[3px] ring-stone-200/60 shadow-lg shadow-stone-200/20',
    tier: 'pro',
  },
  minimal: {
    name: 'Minimal',
    bg: 'bg-white',
    btn: 'bg-transparent text-[#1a1a1a] border border-[#e5e5e5] hover:border-[#1a1a1a] hover:bg-[#fafafa] hover:-translate-y-[1px]',
    text: 'text-[#1a1a1a]',
    subtleText: 'text-[#999]',
    accent: 'text-[#1a1a1a]',
    preview: 'bg-white border border-[#e5e5e5]',
    cardBg: 'bg-white border border-[#f0f0f0]',
    avatarRing: 'ring-[2px] ring-[#e5e5e5]',
    tier: 'pro',
  },
  immersive: {
    name: 'Immersive',
    bg: 'bg-black',
    btn: 'bg-white text-black hover:-translate-y-[1px]',
    text: 'text-white',
    subtleText: 'text-white/35',
    accent: 'text-white',
    preview: 'bg-gradient-to-b from-gray-700 to-black',
    cardBg: 'bg-white/[0.04] border border-white/[0.06]',
    avatarRing: 'ring-[3px] ring-white/10',
    tier: 'starter',
  },
};

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 };

export const canAccessTheme = (themeTier: ThemeTier, userPlan: string): boolean => {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[themeTier] ?? 0);
};

export const getTheme = (key: string) => THEMES[key] || THEMES.default;
