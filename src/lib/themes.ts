export type ThemeTier = 'free' | 'starter' | 'pro';

export const THEMES: Record<string, { name: string; bg: string; btn: string; text: string; accent: string; preview: string; tier: ThemeTier }> = {
  default: {
    name: 'Default',
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50',
    btn: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
    text: 'text-gray-900',
    accent: 'text-purple-600',
    preview: 'bg-gradient-to-br from-purple-400 to-pink-400',
    tier: 'free',
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-gradient-to-br from-orange-100 via-red-50 to-yellow-50',
    btn: 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600',
    text: 'text-gray-900',
    accent: 'text-orange-600',
    preview: 'bg-gradient-to-br from-orange-400 to-red-400',
    tier: 'free',
  },
  ocean: {
    name: 'Ocean',
    bg: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100',
    btn: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700',
    text: 'text-gray-900',
    accent: 'text-cyan-600',
    preview: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    tier: 'free',
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900',
    btn: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500/30',
    text: 'text-white',
    accent: 'text-blue-400',
    preview: 'bg-gradient-to-br from-gray-800 to-blue-900',
    free: false,
  },
  forest: {
    name: 'Forest',
    bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    btn: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600',
    text: 'text-gray-900',
    accent: 'text-emerald-600',
    preview: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    free: false,
  },
  neon: {
    name: 'Neon',
    bg: 'bg-gray-950',
    btn: 'bg-transparent border-2 border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10 shadow-[0_0_15px_rgba(217,70,239,0.3)]',
    text: 'text-white',
    accent: 'text-fuchsia-400',
    preview: 'bg-gradient-to-br from-fuchsia-600 to-purple-900',
    free: false,
  },
};

export const getTheme = (key: string) => THEMES[key] || THEMES.default;
