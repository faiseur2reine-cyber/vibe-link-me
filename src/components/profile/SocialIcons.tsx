import { Instagram, Twitter, Youtube, Github, Linkedin, Facebook, Music, Globe, MessageCircle, Twitch, Phone } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface SocialLink {
  platform: string;
  url: string;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  tiktok: Music,
  spotify: Music,
  twitch: Twitch,
  discord: MessageCircle,
  whatsapp: Phone,
  telegram: MessageCircle,
  snapchat: MessageCircle,
  website: Globe,
};

interface SocialIconsProps {
  links: SocialLink[];
  theme: ThemeConfig;
  size?: 'sm' | 'md';
}

const SocialIcons = ({ links, theme, size = 'md' }: SocialIconsProps) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {links.map((link, i) => {
        const Icon = PLATFORM_ICONS[link.platform.toLowerCase()] || Globe;
        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnSize} rounded-full flex items-center justify-center transition-all hover:scale-110 ${theme.btn}`}
            title={link.platform}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
};

export default SocialIcons;
