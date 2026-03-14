import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, Flame, Zap, X, ArrowRight } from 'lucide-react';
import type { UrgencyConfig } from '@/components/dashboard/UrgencyEditor';

// --- Hooks ---
const useCountdown = (initialMinutes: number, key: string) => {
  const [seconds, setSeconds] = useState(() => {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const remaining = Math.max(0, parseInt(stored) - Math.floor(Date.now() / 1000));
      return remaining > 0 ? remaining : initialMinutes * 60;
    }
    const total = initialMinutes * 60;
    sessionStorage.setItem(key, String(Math.floor(Date.now() / 1000) + total));
    return total;
  });

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  return { mins: Math.floor(seconds / 60), secs: seconds % 60 };
};

const useSpotsCounter = (initial: number, key: string) => {
  const [spots, setSpots] = useState(() => {
    const stored = sessionStorage.getItem(key);
    if (stored) return Math.max(1, parseInt(stored));
    return initial;
  });

  useEffect(() => {
    const decrease = () => {
      const delay = 15000 + Math.random() * 40000;
      setTimeout(() => {
        setSpots(s => {
          const next = Math.max(1, s - 1);
          sessionStorage.setItem(key, String(next));
          return next;
        });
        decrease();
      }, delay);
    };
    decrease();
  }, [key]);

  return spots;
};

const useLiveViewers = () => {
  const [count, setCount] = useState(Math.floor(8 + Math.random() * 12));
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => Math.max(3, c + Math.floor(Math.random() * 3) - 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  return count;
};

const cities = [
  { city: 'Paris', flag: '🇫🇷' }, { city: 'Lyon', flag: '🇫🇷' },
  { city: 'Montréal', flag: '🇨🇦' }, { city: 'Bruxelles', flag: '🇧🇪' },
  { city: 'London', flag: '🇬🇧' }, { city: 'Berlin', flag: '🇩🇪' },
  { city: 'Madrid', flag: '🇪🇸' }, { city: 'New York', flag: '🇺🇸' },
  { city: 'São Paulo', flag: '🇧🇷' }, { city: 'Tokyo', flag: '🇯🇵' },
];
const names = ['Lucas', 'Emma', 'Léa', 'Hugo', 'Chloé', 'Alex', 'Sarah', 'Thomas', 'Julie', 'Sofia', 'Noah', 'Jade'];

// --- Banner Component ---
export const ProfileUrgencyBanner = ({ config, pageId }: { config: UrgencyConfig['banner']; pageId: string }) => {
  const [dismissed, setDismissed] = useState(false);
  const { mins, secs } = useCountdown(config.countdownMinutes, `urgency_banner_${pageId}`);

  if (!config.enabled || dismissed) return null;

  const pos = config.position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <motion.div
      initial={{ opacity: 0, y: config.position === 'top' ? -40 : 40 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed ${pos} left-0 right-0 z-[60]`}
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-2 text-xs sm:text-sm font-medium relative max-w-xl mx-auto">
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-base">
          {config.emoji}
        </motion.span>
        <span className="truncate">{config.text}</span>
        {config.showCountdown && (
          <span className="font-mono tabular-nums rounded px-1.5 py-0.5 text-[11px]"
            style={{ backgroundColor: `${config.textColor}20` }}>
            <Clock className="w-3 h-3 inline mr-0.5" />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        )}
        {config.ctaText && (
          <a
            href={config.ctaLink || '#'}
            target={config.ctaLink ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap hover:scale-105 transition-transform"
            style={{ backgroundColor: config.ctaBgColor, color: config.ctaTextColor }}
          >
            {config.ctaText}
            <ArrowRight className="w-3 h-3" />
          </a>
        )}
        <button onClick={() => setDismissed(true)} className="absolute right-2 p-1 rounded-full opacity-60 hover:opacity-100" style={{ color: config.textColor }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// --- Scarcity Widgets Component ---
export const ProfileScarcityWidgets = ({ config, pageId }: { config: UrgencyConfig['scarcity']; pageId: string }) => {
  const spots = useSpotsCounter(config.spotsInitial || 7, `urgency_spots_${pageId}`);
  const viewers = useLiveViewers();

  if (!config.enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {config.spotsEnabled && (
        <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full px-3 py-1.5 text-[11px] font-semibold">
          <Flame className="w-3 h-3" />
          <span>{(config.spotsText || 'Plus que {{count}} places').replace('{{count}}', String(spots))}</span>
        </div>
      )}
      {config.liveViewersEnabled && (
        <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1.5 text-[11px] font-semibold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          <Users className="w-3 h-3" />
          <span>{(config.liveViewersText || '{{count}} en ligne').replace('{{count}}', String(viewers))}</span>
        </div>
      )}
    </motion.div>
  );
};

// --- Location Toast Component ---
export const ProfileLocationToast = ({ enabled, pageId }: { enabled: boolean; pageId: string }) => {
  const [toast, setToast] = useState<{ name: string; city: string; flag: string; ago: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled) return;

    const showToast = () => {
      const loc = cities[Math.floor(Math.random() * cities.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const ago = `${Math.floor(1 + Math.random() * 5)}min`;
      setToast({ name, city: loc.city, flag: loc.flag, ago });
      timeoutRef.current = setTimeout(() => setToast(null), 4000);
      setTimeout(showToast, 25000 + Math.random() * 35000);
    };

    const initial = setTimeout(showToast, 4000);
    return () => {
      clearTimeout(initial);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: -60, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-4 z-50 max-w-xs"
        >
          <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-xl px-3.5 py-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {toast.name} {toast.flag}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                a cliqué depuis {toast.city} · il y a {toast.ago}
              </p>
            </div>
            <Zap className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
