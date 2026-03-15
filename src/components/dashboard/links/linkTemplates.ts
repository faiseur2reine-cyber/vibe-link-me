// ── Link template presets — practical combos for creators ──

export interface TemplateLink {
  title: string;
  url: string;
  icon: string;
  style: string;
  section_title: string | null;
  description: string | null;
  bg_color: string | null;
  text_color: string | null;
}

export interface LinkTemplate {
  id: string;
  name: string;
  desc: string;
  gradient: string;
  links: TemplateLink[];
}

export interface CustomTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  links: TemplateLink[];
  created_at: string;
}

const link = (title: string, url: string, bg: string, opts?: { featured?: boolean; desc?: string; text?: string }): TemplateLink => ({
  title, url, icon: 'link',
  style: opts?.featured ? 'featured' : 'default',
  section_title: null,
  description: opts?.desc || null,
  bg_color: bg,
  text_color: opts?.text || '#FFFFFF',
});

export const useLinkTemplates = (_t: (key: string) => string): LinkTemplate[] => [
  {
    id: 'of-mym',
    name: '🔥 OnlyFans + MYM',
    desc: 'Le duo classique',
    gradient: 'from-sky-400 to-blue-500',
    links: [
      link('OnlyFans', 'https://onlyfans.com/', '#1BAFE8', { featured: true, desc: 'Contenu exclusif' }),
      link('MYM', 'https://mym.fans/', '#FF2D55', { desc: 'Photos & vidéos' }),
      link('Instagram', 'https://instagram.com/', '#E4405F'),
      link('Twitter / X', 'https://x.com/', '#0F1419'),
    ],
  },
  {
    id: 'of-telegram',
    name: '💎 OnlyFans + Telegram',
    desc: 'OF + channel gratuit pour teaser',
    gradient: 'from-sky-400 to-cyan-500',
    links: [
      link('OnlyFans', 'https://onlyfans.com/', '#1BAFE8', { featured: true, desc: 'Contenu exclusif' }),
      link('Telegram', 'https://t.me/', '#229ED9', { desc: 'Previews gratuites' }),
      link('Instagram', 'https://instagram.com/', '#E4405F'),
    ],
  },
  {
    id: 'of-mym-tg',
    name: '🚀 OF + MYM + Telegram',
    desc: 'Le trio complet',
    gradient: 'from-violet-500 to-purple-600',
    links: [
      link('OnlyFans', 'https://onlyfans.com/', '#1BAFE8', { featured: true }),
      link('MYM', 'https://mym.fans/', '#FF2D55'),
      link('Telegram VIP', 'https://t.me/', '#229ED9', { desc: 'Channel privé' }),
      link('Instagram', 'https://instagram.com/', '#E4405F'),
      link('Twitter / X', 'https://x.com/', '#0F1419'),
      link('Snapchat', 'https://snapchat.com/', '#FFFC00', { text: '#000000' }),
    ],
  },
  {
    id: 'of-fansly',
    name: '⚡ OnlyFans + Fansly',
    desc: 'Double plateforme',
    gradient: 'from-blue-400 to-indigo-500',
    links: [
      link('OnlyFans', 'https://onlyfans.com/', '#1BAFE8', { featured: true }),
      link('Fansly', 'https://fansly.com/', '#1A9DF7', { desc: 'Backup & exclusivités' }),
      link('Instagram', 'https://instagram.com/', '#E4405F'),
      link('Twitter / X', 'https://x.com/', '#0F1419'),
    ],
  },
  {
    id: 'agency-multi',
    name: '🏢 Agence — 2 créatrices',
    desc: 'Multi-profils avec sections',
    gradient: 'from-amber-400 to-orange-500',
    links: [
      { title: 'OnlyFans — Créatrice 1', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Créatrice 1', description: null, bg_color: '#1BAFE8', text_color: '#FFFFFF' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Créatrice 1', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'OnlyFans — Créatrice 2', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Créatrice 2', description: null, bg_color: '#111827', text_color: '#FFFFFF' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Créatrice 2', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'content-creator',
    name: '🎬 Créateur de contenu',
    desc: 'YouTube, TikTok, Twitch, Discord',
    gradient: 'from-red-500 to-pink-500',
    links: [
      link('YouTube', 'https://youtube.com/', '#FF1E1E', { featured: true, desc: 'Ma chaîne' }),
      link('TikTok', 'https://tiktok.com/', '#000000'),
      link('Twitch', 'https://twitch.tv/', '#9146FF'),
      link('Discord', 'https://discord.gg/', '#5865F2', { desc: 'Rejoins le serveur' }),
    ],
  },
  {
    id: 'minimal',
    name: '✨ Minimal',
    desc: 'Juste tes réseaux',
    gradient: 'from-gray-400 to-gray-600',
    links: [
      link('Instagram', 'https://instagram.com/', '#E4405F'),
      link('TikTok', 'https://tiktok.com/', '#000000'),
      link('Twitter / X', 'https://x.com/', '#0F1419'),
    ],
  },
];
