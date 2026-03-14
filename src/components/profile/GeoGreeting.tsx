// src/components/profile/GeoGreeting.tsx
// ═══ GEO IP GREETING ═══
// Fetches visitor's city and displays "Hey Paris 👋"
// Cached in sessionStorage. Multiple API fallbacks.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeoGreetingProps {
  enabled: boolean;
  template?: string;
  className?: string;
}

const CACHE_KEY = 'geo_city';

const GeoGreeting = ({ enabled, template = 'Hey {city} 👋', className }: GeoGreetingProps) => {
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Check cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) { setCity(cached); return; }
    } catch {}

    const controller = new AbortController();
    const opts = { signal: controller.signal };

    const saveCity = (c: string) => {
      setCity(c);
      try { sessionStorage.setItem(CACHE_KEY, c); } catch {}
    };

    // Chain of GeoIP providers — first success wins
    const tryGeo = async () => {
      // 1. ipapi.co (1000/day free, HTTPS)
      try {
        const r = await fetch('https://ipapi.co/json/', opts);
        if (r.ok) {
          const data = await r.json();
          if (data?.city) { saveCity(data.city); return; }
        }
      } catch {}

      // 2. ipwho.is (free, HTTPS)
      try {
        const r = await fetch('https://ipwho.is/', opts);
        const data = await r.json();
        if (data?.city) { saveCity(data.city); return; }
      } catch {}

      // 3. ipinfo.io (50K/month free, HTTPS)
      try {
        const r = await fetch('https://ipinfo.io/json', opts);
        const data = await r.json();
        if (data?.city) { saveCity(data.city); return; }
      } catch {}
    };

    tryGeo();

    const timeout = setTimeout(() => controller.abort(), 3000);
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [enabled]);

  if (!enabled || !city) return null;

  const text = template.replace('{city}', city);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={`text-sm text-white/60 ${className || ''}`}
      >
        {text.split(city).map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && <span className="font-semibold text-white/90">{city}</span>}
          </span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default GeoGreeting;
