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
    btn: 'bg-white/80 backdrop-blur-xl text-gray-800 border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.12),0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:bg-white/95 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
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
    btn: 'bg-white/70 backdrop-blur-xl text-gray-800 border border-orange-200/40 shadow-[0_2px_8px_-2px_rgba(234,88,12,0.08),0_4px_16px_-4px_rgba(234,88,12,0.05)] hover:shadow-[0_4px_16px_-2px_rgba(234,88,12,0.15),0_8px_24px_-4px_rgba(234,88,12,0.08)] hover:bg-white/90 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
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
    btn: 'bg-white/70 backdrop-blur-xl text-gray-800 border border-blue-200/40 shadow-[0_2px_8px_-2px_rgba(14,165,233,0.08),0_4px_16px_-4px_rgba(14,165,233,0.05)] hover:shadow-[0_4px_16px_-2px_rgba(14,165,233,0.15),0_8px_24px_-4px_rgba(14,165,233,0.08)] hover:bg-white/90 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
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
    btn: 'bg-white/[0.06] backdrop-blur-2xl text-white/90 border border-white/[0.08] shadow-[0_2px_12px_-2px_rgba(59,130,246,0.15),0_0_1px_0_rgba(255,255,255,0.1)_inset] hover:bg-white/[0.1] hover:border-white/[0.15] hover:shadow-[0_4px_20px_-2px_rgba(59,130,246,0.25),0_0_1px_0_rgba(255,255,255,0.15)_inset] hover:-translate-y-0.5 active:translate-y-0',
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
    btn: 'bg-white/70 backdrop-blur-xl text-gray-800 border border-emerald-200/40 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.08),0_4px_16px_-4px_rgba(16,185,129,0.05)] hover:shadow-[0_4px_16px_-2px_rgba(16,185,129,0.15),0_8px_24px_-4px_rgba(16,185,129,0.08)] hover:bg-white/90 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
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
    btn: 'bg-fuchsia-500/[0.08] backdrop-blur-2xl text-fuchsia-200 border border-fuchsia-500/20 shadow-[0_2px_16px_-2px_rgba(217,70,239,0.2),0_0_1px_0_rgba(217,70,239,0.3)_inset] hover:bg-fuchsia-500/[0.15] hover:border-fuchsia-400/40 hover:shadow-[0_4px_24px_-2px_rgba(217,70,239,0.35),0_0_1px_0_rgba(217,70,239,0.5)_inset] hover:-translate-y-0.5 active:translate-y-0',
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
    btn: 'bg-white/[0.05] backdrop-blur-2xl text-white/90 border border-white/[0.08] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.5),0_0_1px_0_rgba(255,255,255,0.08)_inset] hover:bg-white/[0.1] hover:border-white/[0.14] hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.6),0_0_1px_0_rgba(255,255,255,0.12)_inset] hover:-translate-y-0.5 active:translate-y-0',
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
    btn: 'bg-white/80 backdrop-blur-xl text-violet-900 border border-violet-200/30 shadow-[0_2px_8px_-2px_rgba(139,92,246,0.1),0_4px_16px_-4px_rgba(236,72,153,0.06)] hover:shadow-[0_4px_20px_-2px_rgba(139,92,246,0.18),0_8px_28px_-4px_rgba(236,72,153,0.1)] hover:bg-white/95 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
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
  aurora: {
    name: 'Aurora',
    bg: 'bg-gradient-to-br from-violet-950 via-emerald-950 to-sky-950',
    btn: 'bg-white/[0.06] backdrop-blur-2xl text-white/90 border border-emerald-400/15 shadow-[0_2px_16px_-4px_rgba(52,211,153,0.15),0_0_1px_0_rgba(167,139,250,0.2)_inset] hover:bg-white/[0.1] hover:border-emerald-400/30 hover:shadow-[0_4px_24px_-2px_rgba(52,211,153,0.25),0_0_20px_-4px_rgba(167,139,250,0.15),0_0_1px_0_rgba(167,139,250,0.3)_inset] hover:-translate-y-0.5 active:translate-y-0',
    text: 'text-white',
    subtleText: 'text-emerald-300/50',
    accent: 'text-emerald-400',
    preview: 'bg-gradient-to-br from-violet-600 via-emerald-500 to-sky-500',
    cardBg: 'bg-white/[0.04] backdrop-blur-2xl border border-emerald-500/10 shadow-2xl shadow-emerald-500/5',
    avatarRing: 'ring-4 ring-emerald-400/20 shadow-xl shadow-emerald-500/15',
    tier: 'pro',
  },
  cyber: {
    name: 'Cyber',
    bg: 'bg-gray-950',
    btn: 'bg-cyan-500/[0.06] backdrop-blur-2xl text-cyan-100 border border-cyan-400/20 shadow-[0_2px_16px_-2px_rgba(34,211,238,0.15),0_0_1px_0_rgba(34,211,238,0.3)_inset] hover:bg-cyan-400/[0.12] hover:border-cyan-400/40 hover:shadow-[0_4px_24px_-2px_rgba(34,211,238,0.3),0_0_30px_-4px_rgba(34,211,238,0.15),0_0_1px_0_rgba(34,211,238,0.5)_inset] hover:-translate-y-0.5 active:translate-y-0',
    text: 'text-white',
    subtleText: 'text-cyan-400/50',
    accent: 'text-cyan-400',
    preview: 'bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900',
    cardBg: 'bg-cyan-500/[0.04] backdrop-blur-2xl border border-cyan-500/15 shadow-2xl shadow-cyan-500/5',
    avatarRing: 'ring-4 ring-cyan-400/25 shadow-xl shadow-cyan-500/20',
    tier: 'pro',
  },
  marble: {
    name: 'Marble',
    bg: 'bg-gradient-to-br from-stone-100 via-white to-stone-200',
    btn: 'bg-white/90 backdrop-blur-xl text-stone-800 border border-stone-200/60 shadow-[0_2px_12px_-4px_rgba(120,113,108,0.1),0_4px_20px_-6px_rgba(120,113,108,0.06)] hover:shadow-[0_4px_20px_-4px_rgba(120,113,108,0.16),0_8px_32px_-6px_rgba(120,113,108,0.1)] hover:bg-white hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
    text: 'text-stone-900',
    subtleText: 'text-stone-400',
    accent: 'text-amber-700',
    preview: 'bg-gradient-to-br from-stone-200 via-white to-stone-300',
    cardBg: 'bg-white/60 backdrop-blur-md border border-stone-200/50 shadow-xl shadow-stone-200/20',
    avatarRing: 'ring-4 ring-stone-200/60 shadow-xl shadow-stone-300/20',
    tier: 'pro',
  },
};

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 };

export const canAccessTheme = (themeTier: ThemeTier, userPlan: string): boolean => {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[themeTier] ?? 0);
};

export const getTheme = (key: string) => THEMES[key] || THEMES.default;
