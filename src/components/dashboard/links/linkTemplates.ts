// ── Built-in link template presets ──

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

export const useLinkTemplates = (t: (key: string) => string): LinkTemplate[] => [
  {
    id: 'onlyfans-creator',
    name: '🔥 OnlyFans Creator',
    desc: t('linksManager.tplOnlyfansDesc'),
    gradient: 'from-sky-400 to-blue-500',
    links: [
      { title: 'OnlyFans', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplOnlyfansSub'), bg_color: '#1BAFE8', text_color: '#FFFFFF' },
      { title: 'OnlyFans VIP', url: 'https://onlyfans.com/', icon: 'link', style: 'default', section_title: null, description: t('linksManager.tplOnlyfansSub'), bg_color: '#FFFFFF', text_color: '#B05A90' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'Twitter / X', url: 'https://x.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#0F1419', text_color: '#FFFFFF' },
      { title: 'Telegram', url: 'https://t.me/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#229ED9', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'content-creator',
    name: '🎬 Content Creator',
    desc: t('linksManager.tplCreatorDesc'),
    gradient: 'from-red-500 to-pink-500',
    links: [
      { title: 'YouTube', url: 'https://youtube.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplYoutubeSub'), bg_color: '#FF1E1E', text_color: '#FFFFFF' },
      { title: 'Join Membership', url: 'https://youtube.com/', icon: 'link', style: 'default', section_title: null, description: t('linksManager.tplYoutubeSub'), bg_color: '#FFFFFF', text_color: '#CC334E' },
      { title: 'Twitch', url: 'https://twitch.tv/', icon: 'link', style: 'default', section_title: t('linksManager.sectionLive'), description: null, bg_color: '#9146FF', text_color: '#FFFFFF' },
      { title: 'TikTok', url: 'https://tiktok.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#000000', text_color: '#FFFFFF' },
      { title: 'Discord', url: 'https://discord.gg/', icon: 'link', style: 'default', section_title: t('linksManager.sectionCommunity'), description: t('linksManager.tplDiscordSub'), bg_color: '#5865F2', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'agency-multi',
    name: '🏢 ' + t('linksManager.tplAgencyName'),
    desc: t('linksManager.tplAgencyDesc'),
    gradient: 'from-violet-500 to-purple-600',
    links: [
      { title: 'OnlyFans — Creator 1', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Creator 1', description: '@creator1 · Top Creator 🌟', bg_color: '#1BAFE8', text_color: '#FFFFFF' },
      { title: 'Instagram — Creator 1', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Creator 1', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'OnlyFans — Creator 2', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Creator 2', description: '@creator2 · Exclusive Content 💎', bg_color: '#111827', text_color: '#FFFFFF' },
      { title: 'Instagram — Creator 2', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Creator 2', description: null, bg_color: '#FFFFFF', text_color: '#B05A90' },
    ],
  },
  {
    id: 'music-artist',
    name: '🎵 ' + t('linksManager.tplMusicName'),
    desc: t('linksManager.tplMusicDesc'),
    gradient: 'from-emerald-400 to-teal-500',
    links: [
      { title: 'Spotify', url: 'https://open.spotify.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplSpotifySub'), bg_color: '#1DB954', text_color: '#FFFFFF' },
      { title: 'Pre-save New Track', url: 'https://example.com/', icon: 'link', style: 'default', section_title: null, description: t('linksManager.tplSpotifySub'), bg_color: '#FFFFFF', text_color: '#1E7A52' },
      { title: 'Apple Music', url: 'https://music.apple.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionMusic'), description: null, bg_color: '#FA243C', text_color: '#FFFFFF' },
      { title: 'SoundCloud', url: 'https://soundcloud.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionMusic'), description: null, bg_color: '#FF5500', text_color: '#FFFFFF' },
      { title: t('linksManager.tplBooking'), url: 'mailto:booking@example.com', icon: 'link', style: 'default', section_title: 'Business', description: t('linksManager.tplBookingSub'), bg_color: '#111827', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'ecommerce',
    name: '🛍️ E-commerce',
    desc: t('linksManager.tplEcommerceDesc'),
    gradient: 'from-amber-400 to-orange-500',
    links: [
      { title: t('linksManager.myShop'), url: 'https://shopify.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.discoverCollection'), bg_color: '#111827', text_color: '#FFFFFF' },
      { title: t('linksManager.newDrop'), url: 'https://example.com/drop', icon: 'link', style: 'default', section_title: t('linksManager.sectionProducts'), description: t('linksManager.limitedCollection'), bg_color: '#FFFFFF', text_color: '#8C5A22' },
      { title: t('linksManager.promo20'), url: 'https://example.com/promo', icon: 'link', style: 'default', section_title: t('linksManager.sectionProducts'), description: 'Code: MYTAPTAP20', bg_color: '#EF4444', text_color: '#FFFFFF' },
      { title: 'Instagram Shop', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'fitness-coach',
    name: '💪 ' + t('linksManager.tplFitnessName'),
    desc: t('linksManager.tplFitnessDesc'),
    gradient: 'from-lime-400 to-green-500',
    links: [
      { title: t('linksManager.tplCoaching'), url: 'https://cal.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplCoachingSub'), bg_color: '#10B981', text_color: '#FFFFFF' },
      { title: t('linksManager.tplPrograms'), url: 'https://example.com/programs', icon: 'link', style: 'default', section_title: t('linksManager.sectionPrograms'), description: null, bg_color: '#FFFFFF', text_color: '#158A64' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'YouTube', url: 'https://youtube.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: t('linksManager.tplWorkoutSub'), bg_color: '#FF1E1E', text_color: '#FFFFFF' },
    ],
  },
];
