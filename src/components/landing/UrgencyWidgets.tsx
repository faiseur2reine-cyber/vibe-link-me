import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, Flame, Zap } from 'lucide-react';

// Fake countdown that resets every session
const useCountdown = (initialMinutes: number) => {
  const [seconds, setSeconds] = useState(() => {
    const stored = sessionStorage.getItem('mytaptap_countdown');
    if (stored) {
      const remaining = Math.max(0, parseInt(stored) - Math.floor(Date.now() / 1000));
      return remaining > 0 ? remaining : initialMinutes * 60;
    }
    const total = initialMinutes * 60;
    sessionStorage.setItem('mytaptap_countdown', String(Math.floor(Date.now() / 1000) + total));
    return total;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 0) return 0;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return { mins, secs, total: seconds };
};

// Fake spots counter that slowly decreases
const useSpotsCounter = (initial: number) => {
  const [spots, setSpots] = useState(() => {
    const stored = sessionStorage.getItem('mytaptap_spots');
    if (stored) return Math.max(2, parseInt(stored));
    return initial;
  });

  useEffect(() => {
    const decrease = () => {
      const delay = 8000 + Math.random() * 20000; // 8-28s
      setTimeout(() => {
        setSpots(s => {
          const next = Math.max(2, s - 1);
          sessionStorage.setItem('mytaptap_spots', String(next));
          return next;
        });
        decrease();
      }, delay);
    };
    decrease();
  }, []);

  return spots;
};

// Simulated live viewers
const useLiveViewers = () => {
  const [count, setCount] = useState(Math.floor(12 + Math.random() * 8));

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => Math.max(5, c + Math.floor(Math.random() * 5) - 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return count;
};

// Fake city names for social proof
const cities = [
  { city: 'Paris', flag: '🇫🇷' },
  { city: 'Lyon', flag: '🇫🇷' },
  { city: 'Marseille', flag: '🇫🇷' },
  { city: 'Montréal', flag: '🇨🇦' },
  { city: 'Bruxelles', flag: '🇧🇪' },
  { city: 'Genève', flag: '🇨🇭' },
  { city: 'London', flag: '🇬🇧' },
  { city: 'Berlin', flag: '🇩🇪' },
  { city: 'Madrid', flag: '🇪🇸' },
  { city: 'New York', flag: '🇺🇸' },
  { city: 'Tokyo', flag: '🇯🇵' },
  { city: 'São Paulo', flag: '🇧🇷' },
];

const names = ['Lucas', 'Emma', 'Léa', 'Hugo', 'Chloé', 'Alex', 'Sarah', 'Thomas', 'Julie', 'Maxime', 'Sofia', 'Noah', 'Jade', 'Raphaël'];

const UrgencyWidgets = () => {
  const { t } = useTranslation();
  const { mins, secs } = useCountdown(14);
  const spots = useSpotsCounter(7);
  const viewers = useLiveViewers();
  const [toast, setToast] = useState<{ name: string; city: string; flag: string; ago: string } | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Location toast popup
  useEffect(() => {
    const showToast = () => {
      const loc = cities[Math.floor(Math.random() * cities.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const ago = `${Math.floor(1 + Math.random() * 4)}min`;
      setToast({ name, city: loc.city, flag: loc.flag, ago });

      toastTimeout.current = setTimeout(() => setToast(null), 4000);
      setTimeout(showToast, 12000 + Math.random() * 18000);
    };

    const initial = setTimeout(showToast, 5000);
    return () => {
      clearTimeout(initial);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  return (
    <>
      {/* Floating urgency bar - above CTA */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-5"
        >
          {/* Countdown */}
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-3 py-1.5 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('urgency.offerEnds')}</span>
            <span className="font-mono tabular-nums bg-destructive text-destructive-foreground rounded px-1.5 py-0.5 text-[11px]">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>

          {/* Spots left */}
          <div className="flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-3 py-1.5 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>{t('urgency.spotsLeft', { count: spots })}</span>
          </div>

          {/* Live viewers */}
          <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <Users className="w-3.5 h-3.5" />
            <span>{t('urgency.liveNow', { count: viewers })}</span>
          </div>
        </motion.div>
      </div>

      {/* Location social proof toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: -80, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-4 sm:left-6 z-50 max-w-xs"
          >
            <div className="flex items-center gap-3 bg-card border border-border shadow-lg rounded-xl px-4 py-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {toast.name} {toast.flag}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('urgency.justSignedUp', { city: toast.city, ago: toast.ago })}
                </p>
              </div>
              <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UrgencyWidgets;
