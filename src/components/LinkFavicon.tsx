import { useState } from 'react';
import { Globe, Instagram, Youtube, Github, Linkedin, Facebook, Twitter, Music, Mail, ShoppingBag, Video, MessageCircle, Twitch, Phone } from 'lucide-react';

const DOMAIN_ICON_MAP: Record<string, React.ElementType> = {
  'instagram.com': Instagram,
  'youtube.com': Youtube,
  'youtu.be': Youtube,
  'github.com': Github,
  'linkedin.com': Linkedin,
  'facebook.com': Facebook,
  'twitter.com': Twitter,
  'x.com': Twitter,
  'tiktok.com': Music,
  'spotify.com': Music,
  'soundcloud.com': Music,
  'apple.com': Music,
  'deezer.com': Music,
  'twitch.tv': Twitch,
  'discord.gg': MessageCircle,
  'discord.com': MessageCircle,
  'whatsapp.com': Phone,
  'wa.me': Phone,
  'telegram.org': MessageCircle,
  't.me': MessageCircle,
  'snapchat.com': MessageCircle,
  'vimeo.com': Video,
  'dailymotion.com': Video,
  'amazon.com': ShoppingBag,
  'etsy.com': ShoppingBag,
  'shopify.com': ShoppingBag,
};

function getIconForUrl(url: string): React.ElementType {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    for (const [domain, icon] of Object.entries(DOMAIN_ICON_MAP)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) return icon;
    }
    if (url.includes('mailto:')) return Mail;
  } catch {}
  return Globe;
}

interface LinkFaviconProps {
  url: string;
  size?: 'sm' | 'md';
  className?: string;
}

const LinkFavicon = ({ url, size = 'md', className = '' }: LinkFaviconProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const FallbackIcon = getIconForUrl(url);

  let hostname = '';
  try { hostname = new URL(url).hostname; } catch {}

  if (imgFailed || !hostname) {
    return <FallbackIcon className={`${iconSize} shrink-0 opacity-70 ${className}`} />;
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
      alt=""
      className={`${iconSize} rounded shrink-0 ${className}`}
      onError={() => setImgFailed(true)}
    />
  );
};

export default LinkFavicon;
