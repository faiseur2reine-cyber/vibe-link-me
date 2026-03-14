// src/components/profile/NsfwInlineGate.tsx
// ═══ INLINE 18+ GATE ═══
// The button itself transforms to show the 18+ warning on first click.
// Second click confirms and navigates. Auto-reverts after 4 seconds.
// Adapts to dark/light themes. Multi-language.

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TapShield as ShieldAlert } from '@/components/icons/TapIcons';

interface NsfwInlineGateProps {
  children: React.ReactNode;
  url: string;
  onConfirm: () => void;
  variant?: 'dark' | 'light';
  className?: string;
}

function getGateText() {
  const lang = (navigator.language || '').slice(0, 2);
  const texts: Record<string, { title: string; hint: string }> = {
    fr: { title: '18+ Contenu sensible', hint: 'Appuie pour continuer' },
    en: { title: '18+ Sensitive Content', hint: 'Tap to continue' },
    es: { title: '18+ Contenido sensible', hint: 'Toca para continuar' },
    de: { title: '18+ Sensible Inhalte', hint: 'Tippen zum Fortfahren' },
    it: { title: '18+ Contenuto sensibile', hint: 'Tocca per continuare' },
    pt: { title: '18+ Conteúdo sensível', hint: 'Toque para continuar' },
  };
  return texts[lang] || texts.en;
}

const NsfwInlineGate = ({ children, url, onConfirm, variant = 'dark', className }: NsfwInlineGateProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const revertTimer = useRef<ReturnType<typeof setTimeout>>();
  const text = getGateText();

  const handleFirstClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWarning(true);
    revertTimer.current = setTimeout(() => setShowWarning(false), 4000);
  }, []);

  const handleSecondClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (revertTimer.current) clearTimeout(revertTimer.current);
    setShowWarning(false);
    onConfirm();
  }, [onConfirm]);

  const isDark = variant === 'dark';

  return (
    <div className={`relative ${className || ''}`}>
      <AnimatePresence mode="wait">
        {!showWarning ? (
          <motion.div
            key="normal"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {children}
            <div
              onClick={handleFirstClick}
              className="absolute inset-0 z-10 cursor-pointer rounded-xl"
            />
          </motion.div>
        ) : (
          <motion.button
            key="warning"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={handleSecondClick}
            className={`w-full flex items-center justify-center gap-3 px-5 py-4 cursor-pointer transition-colors ${
              isDark
                ? 'rounded-full bg-black border border-white/10 hover:border-white/20'
                : 'rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500'
            }`}
            style={{ minHeight: 68 }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDark ? 'bg-white/10' : 'bg-white/15'
            }`}>
              <ShieldAlert className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-[14px]">{text.title}</p>
              <p className="text-white/40 text-[11px] mt-0.5">{text.hint}</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NsfwInlineGate;
