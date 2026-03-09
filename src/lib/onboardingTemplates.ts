export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  suggestedLinks: Array<{
    title: string;
    url: string;
    icon: string;
  }>;
  suggestedSocials: Array<{
    platform: string;
    url: string;
  }>;
}

export const onboardingTemplates: OnboardingTemplate[] = [
  {
    id: 'influencer',
    name: 'Influenceur',
    description: 'Parfait pour partager vos réseaux sociaux et contenus',
    icon: 'sparkles',
    theme: 'aurora',
    suggestedLinks: [
      { title: 'Ma dernière vidéo', url: 'https://youtube.com/@votrecanal', icon: 'video' },
      { title: 'Mon podcast', url: 'https://spotify.com/votrepodcast', icon: 'mic' },
      { title: 'Newsletter', url: 'https://votrenewsletter.com', icon: 'mail' },
    ],
    suggestedSocials: [
      { platform: 'instagram', url: 'https://instagram.com/votrecompte' },
      { platform: 'tiktok', url: 'https://tiktok.com/@votrecompte' },
      { platform: 'youtube', url: 'https://youtube.com/@votrecompte' },
    ],
  },
  {
    id: 'artist',
    name: 'Artiste',
    description: 'Idéal pour musiciens, designers et créatifs',
    icon: 'palette',
    theme: 'midnight',
    suggestedLinks: [
      { title: 'Mon portfolio', url: 'https://votreportfolio.com', icon: 'image' },
      { title: 'Spotify', url: 'https://spotify.com/artist/vous', icon: 'music' },
      { title: 'Boutique', url: 'https://votreboutique.com', icon: 'shopping-bag' },
    ],
    suggestedSocials: [
      { platform: 'soundcloud', url: 'https://soundcloud.com/vous' },
      { platform: 'behance', url: 'https://behance.net/vous' },
      { platform: 'instagram', url: 'https://instagram.com/vous' },
    ],
  },
  {
    id: 'agency',
    name: 'Agence',
    description: 'Pour gérer plusieurs marques et clients',
    icon: 'briefcase',
    theme: 'corporate',
    suggestedLinks: [
      { title: 'Prendre rendez-vous', url: 'https://calendly.com/vous', icon: 'calendar' },
      { title: 'Nos services', url: 'https://votresite.com/services', icon: 'layout' },
      { title: 'Portfolio clients', url: 'https://votresite.com/portfolio', icon: 'folder' },
    ],
    suggestedSocials: [
      { platform: 'linkedin', url: 'https://linkedin.com/company/vous' },
      { platform: 'twitter', url: 'https://twitter.com/vous' },
      { platform: 'facebook', url: 'https://facebook.com/vous' },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Vendez vos produits en ligne',
    icon: 'shopping-cart',
    theme: 'sunset',
    suggestedLinks: [
      { title: 'Boutique en ligne', url: 'https://votreboutique.com', icon: 'shopping-bag' },
      { title: 'Nouveautés', url: 'https://votreboutique.com/nouveautes', icon: 'sparkles' },
      { title: 'Offres spéciales', url: 'https://votreboutique.com/promos', icon: 'tag' },
    ],
    suggestedSocials: [
      { platform: 'instagram', url: 'https://instagram.com/votreshop' },
      { platform: 'facebook', url: 'https://facebook.com/votreshop' },
      { platform: 'pinterest', url: 'https://pinterest.com/votreshop' },
    ],
  },
];
