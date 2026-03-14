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
    bg: 'bg-[#fafafa]',
    btn: 'bg-white text-gray-900 rounded-2xl border border-gray-200/50 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-gray-300/60 hover:-translate-y-[2px]',
    text: 'text-gray-900',
    subtleText: 'text-gray-400',
    accent: 'text-gray-900',
    preview: 'bg-gradient-to-b from-gray-100 to-white',
    cardBg: 'bg-white border border-gray-100',
    avatarRing: 'ring-[3px] ring-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
    tier: 'free',
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100',
    btn: 'bg-white/80 backdrop-blur-md text-orange-900 rounded-2xl border border-orange-200/40 shadow-[0_2px_12px_rgba(251,146,60,0.08)] hover:shadow-[0_8px_30px_rgba(251,146,60,0.15)] hover:bg-white/90 hover:-translate-y-[2px]',
    text: 'text-orange-950',
    subtleText: 'text-orange-400/60',
    accent: 'text-orange-500',
    preview: 'bg-gradient-to-b from-orange-200 to-rose-200',
    cardBg: 'bg-white/60 backdrop-blur-sm border border-orange-100/40',
    avatarRing: 'ring-[3px] ring-white/80 shadow-[0_4px_24px_rgba(251,146,60,0.15)]',
    tier: 'free',
  },
  ocean: {
    name: 'Ocean',
    bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100',
    btn: 'bg-white/80 backdrop-blur-md text-blue-900 rounded-2xl border border-blue-200/40 shadow-[0_2px_12px_rgba(59,130,246,0.06)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] hover:bg-white/90 hover:-translate-y-[2px]',
    text: 'text-blue-950',
    subtleText: 'text-blue-400/60',
    accent: 'text-blue-500',
    preview: 'bg-gradient-to-b from-sky-300 to-blue-400',
    cardBg: 'bg-white/60 backdrop-blur-sm border border-blue-100/40',
    avatarRing: 'ring-[3px] ring-white/80 shadow-[0_4px_24px_rgba(59,130,246,0.12)]',
    tier: 'free',
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-[#07070c]',
    btn: 'bg-white/[0.06] backdrop-blur-xl text-white/90 rounded-2xl border border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:bg-white/[0.1] hover:border-white/[0.14] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-[2px]',
    text: 'text-white',
    subtleText: 'text-white/30',
    accent: 'text-blue-400',
    preview: 'bg-gradient-to-b from-slate-800 to-slate-950',
    cardBg: 'bg-white/[0.04] backdrop-blur-md border border-white/[0.06]',
    avatarRing: 'ring-[3px] ring-white/10 shadow-[0_4px_30px_rgba(99,102,241,0.1)]',
    tier: 'starter',
  },
  neon: {
    name: 'Neon',
    bg: 'bg-[#06060a]',
    btn: 'bg-fuchsia-500/[0.08] backdrop-blur-xl text-fuchsia-100 rounded-2xl border border-fuchsia-500/15 shadow-[0_2px_16px_rgba(217,70,239,0.08)] hover:bg-fuchsia-500/[0.14] hover:border-fuchsia-400/30 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)] hover:-translate-y-[2px]',
    text: 'text-white',
    subtleText: 'text-fuchsia-300/40',
    accent: 'text-fuchsia-400',
    preview: 'bg-gradient-to-b from-fuchsia-600 to-purple-900',
    cardBg: 'bg-fuchsia-500/[0.04] backdrop-blur-md border border-fuchsia-500/10',
    avatarRing: 'ring-[3px] ring-fuchsia-500/20 shadow-[0_4px_30px_rgba(217,70,239,0.12)]',
    tier: 'starter',
  },
  pastel: {
    name: 'Pastel Dream',
    bg: 'bg-gradient-to-br from-pink-50 via-violet-50 to-sky-50',
    btn: 'bg-white/70 backdrop-blur-md text-violet-900 rounded-2xl border border-violet-200/30 shadow-[0_2px_12px_rgba(139,92,246,0.05)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)] hover:bg-white/85 hover:-translate-y-[2px]',
    text: 'text-violet-950',
    subtleText: 'text-violet-400/50',
    accent: 'text-violet-500',
    preview: 'bg-gradient-to-b from-pink-200 to-violet-200',
    cardBg: 'bg-white/50 backdrop-blur-sm border border-violet-100/30',
    avatarRing: 'ring-[3px] ring-violet-100/50 shadow-[0_4px_24px_rgba(139,92,246,0.1)]',
    tier: 'pro',
  },
  brutalist: {
    name: 'Brutalist',
    bg: 'bg-[#f5f0e8]',
    btn: 'bg-white text-black rounded-none border-[2.5px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
    text: 'text-black',
    subtleText: 'text-black/40',
    accent: 'text-black',
    preview: 'bg-[#f5f0e8] border-2 border-black',
    cardBg: 'bg-white border-2 border-black',
    avatarRing: 'ring-[3px] ring-black',
    tier: 'pro',
  },
  cyber: {
    name: 'Cyber',
    bg: 'bg-[#03030a]',
    btn: 'bg-cyan-500/[0.06] backdrop-blur-xl text-cyan-50 rounded-2xl border border-cyan-400/12 shadow-[0_2px_16px_rgba(34,211,238,0.04)] hover:bg-cyan-400/[0.1] hover:border-cyan-400/25 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:-translate-y-[2px]',
    text: 'text-white',
    subtleText: 'text-cyan-300/25',
    accent: 'text-cyan-400',
    preview: 'bg-gradient-to-b from-cyan-900 to-gray-950',
    cardBg: 'bg-cyan-500/[0.03] backdrop-blur-md border border-cyan-400/8',
    avatarRing: 'ring-[3px] ring-cyan-400/15 shadow-[0_4px_30px_rgba(34,211,238,0.08)]',
    tier: 'pro',
  },
  minimal: {
    name: 'Minimal',
    bg: 'bg-white',
    btn: 'bg-transparent text-[#1a1a1a] rounded-2xl border border-[#e5e5e5] hover:border-[#1a1a1a] hover:bg-[#fafafa] hover:-translate-y-[1px]',
    text: 'text-[#1a1a1a]',
    subtleText: 'text-[#a3a3a3]',
    accent: 'text-[#1a1a1a]',
    preview: 'bg-white border border-[#e5e5e5]',
    cardBg: 'bg-white border border-[#e5e5e5]',
    avatarRing: 'ring-[2px] ring-[#e5e5e5]',
    tier: 'free',
  },
  immersive: {
    name: 'Immersive',
    bg: 'bg-black',
    btn: 'bg-white text-black rounded-full hover:-translate-y-[2px] shadow-[0_2px_12px_rgba(0,0,0,0.1)]',
    text: 'text-white',
    subtleText: 'text-white/40',
    accent: 'text-white',
    preview: 'bg-gradient-to-br from-indigo-900 via-gray-800 to-black',
    cardBg: 'bg-white/[0.04] border border-white/[0.06]',
    avatarRing: 'ring-[3px] ring-white/10',
    tier: 'free',
  },
};

export function canAccessTheme(tier: ThemeTier, userPlan?: string): boolean {
  if (tier === 'free') return true;
  if (tier === 'starter') return userPlan === 'starter' || userPlan === 'pro';
  return userPlan === 'pro';
}

export const getTheme = (key: string) => THEMES[key] || THEMES.default;
