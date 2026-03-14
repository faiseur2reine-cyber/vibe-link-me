import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TapX as X, TapClock as Clock, TapZap as Zap, TapArrowRight as ArrowRight } from '@/components/icons/TapIcons';

export interface UrgencyBannerConfig {
  enabled: boolean;
  text: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;       // hex or hsl
  textColor: string;
  ctaBgColor: string;
  ctaTextColor: string;
  position: 'top' | 'bottom';
  showCountdown: boolean;
  countdownMinutes: number;
  closable: boolean;
  emoji: string;
}

export const defaultBannerConfig: UrgencyBannerConfig = {
  enabled: true,
  text: '🔥 Limited time — Free access ending soon',
  ctaText: 'Get started',
  ctaLink: '/auth?tab=signup',
  bgColor: '#dc2626',
  textColor: '#ffffff',
  ctaBgColor: '#ffffff',
  ctaTextColor: '#dc2626',
  position: 'top',
  showCountdown: true,
  countdownMinutes: 14,
  closable: true,
  emoji: '⚡',
};

const useCountdown = (initialMinutes: number) => {
  const [seconds, setSeconds] = useState(() => {
    const stored = sessionStorage.getItem('mytaptap_banner_countdown');
    if (stored) {
      const remaining = Math.max(0, parseInt(stored) - Math.floor(Date.now() / 1000));
      return remaining > 0 ? remaining : initialMinutes * 60;
    }
    const total = initialMinutes * 60;
    sessionStorage.setItem('mytaptap_banner_countdown', String(Math.floor(Date.now() / 1000) + total));
    return total;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    mins: Math.floor(seconds / 60),
    secs: seconds % 60,
  };
};

interface Props {
  config?: Partial<UrgencyBannerConfig>;
}

const UrgencyBanner = ({ config: configOverride }: Props) => {
  const config = { ...defaultBannerConfig, ...configOverride };
  const [dismissed, setDismissed] = useState(false);
  const { mins, secs } = useCountdown(config.countdownMinutes);

  if (!config.enabled || dismissed) return null;

  const positionClasses = config.position === 'top'
    ? 'top-0 left-0 right-0'
    : 'bottom-0 left-0 right-0';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: config.position === 'top' ? -40 : 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: config.position === 'top' ? -40 : 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`fixed ${positionClasses} z-[60]`}
        style={{ backgroundColor: config.bgColor, color: config.textColor }}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-4 px-4 py-2.5 text-xs sm:text-sm font-medium max-w-6xl mx-auto relative">
          {/* Emoji pulse */}
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="text-base sm:text-lg"
          >
            {config.emoji}
          </motion.span>

          {/* Main text */}
          <span className="truncate">{config.text}</span>

          {/* Countdown */}
          {config.showCountdown && (
            <span
              className="flex items-center gap-1 font-mono tabular-nums rounded-md px-2 py-0.5 text-[11px] sm:text-xs font-bold"
              style={{ backgroundColor: `${config.textColor}20`, color: config.textColor }}
            >
              <Clock className="w-3 h-3" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          )}

          {/* CTA button */}
          <Link
            to={config.ctaLink}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: config.ctaBgColor, color: config.ctaTextColor }}
          >
            {config.ctaText}
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Close button */}
          {config.closable && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-2 sm:right-4 p-1 rounded-full transition-opacity opacity-70 hover:opacity-100"
              style={{ color: config.textColor }}
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UrgencyBanner;
