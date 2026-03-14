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

    // Try ipapi.co first (1000/day free, HTTPS)
    fetch('https://ipapi.co/json/', opts)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { if (data?.city) saveCity(data.city); else throw new Error(); })
      .catch(() => {
        // Fallback: ipwho.is (free, HTTPS, no key needed)
        fetch('https://ipwho.is/', opts)
          .then(r => r.json())
          .then(data => { if (data?.city) saveCity(data.city); })
          .catch(() => {}); // Both failed, silent
      });

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
