// src/lib/platforms.ts
// ═══ PLATFORM AUTO-DETECTION ═══
// Detects platform from URL and returns suggested name, color, style, NSFW flag.
// Used in LinksManager to auto-fill when user pastes a URL.

export interface PlatformInfo {
  name: string;
  bgColor: string;
  textColor: string;
  isNsfw: boolean;
  style: 'featured' | 'default';
}

const PLATFORMS: Record<string, PlatformInfo> = {
  'onlyfans.com':   { name: 'OnlyFans',   bgColor: '#00AFF0', textColor: '#FFFFFF', isNsfw: true,  style: 'featured' },
  'mym.fans':       { name: 'MYM',         bgColor: '#111111', textColor: '#FFFFFF', isNsfw: true,  style: 'featured' },
  'fansly.com':     { name: 'Fansly',      bgColor: '#1DA1F2', textColor: '#FFFFFF', isNsfw: true,  style: 'featured' },
  'fanvue.com':     { name: 'Fanvue',      bgColor: '#7C3AED', textColor: '#FFFFFF', isNsfw: true,  style: 'featured' },
  'instagram.com':  { name: 'Instagram',   bgColor: '#E1306C', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'tiktok.com':     { name: 'TikTok',      bgColor: '#000000', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'twitter.com':    { name: 'X / Twitter',  bgColor: '#0F1419', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'x.com':          { name: 'X / Twitter',  bgColor: '#0F1419', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  't.me':           { name: 'Telegram',    bgColor: '#229ED9', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'youtube.com':    { name: 'YouTube',     bgColor: '#FF0000', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'twitch.tv':      { name: 'Twitch',      bgColor: '#9146FF', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'snapchat.com':   { name: 'Snapchat',    bgColor: '#FFFC00', textColor: '#000000', isNsfw: false, style: 'default' },
  'discord.gg':     { name: 'Discord',     bgColor: '#5865F2', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'reddit.com':     { name: 'Reddit',      bgColor: '#FF4500', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'spotify.com':    { name: 'Spotify',     bgColor: '#1DB954', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
  'open.spotify.com': { name: 'Spotify',   bgColor: '#1DB954', textColor: '#FFFFFF', isNsfw: false, style: 'default' },
};

export function detectPlatform(url: string): PlatformInfo | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  for (const [domain, info] of Object.entries(PLATFORMS)) {
    if (lower.includes(domain)) return info;
  }
  return null;
}
