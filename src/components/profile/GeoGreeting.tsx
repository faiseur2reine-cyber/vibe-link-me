// src/components/profile/GeoGreeting.tsx
// ═══ GEO IP GREETING ═══
// Fetches visitor's city via ipapi.co and displays "Hey Paris 👋"
// above the profile name. Falls back silently if blocked/slow.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeoGreetingProps {
  enabled: boolean;
  template?: string; // e.g. "Hey {city} 👋"
  className?: string;
}

const GeoGreeting = ({ enabled, template = 'Hey {city} 👋', className }: GeoGreetingProps) => {
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data?.city) setCity(data.city);
      })
      .catch(() => {}); // Fail silently
    return () => controller.abort();
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
