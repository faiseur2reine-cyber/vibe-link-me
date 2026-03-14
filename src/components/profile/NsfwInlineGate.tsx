// src/components/profile/NsfwInlineGate.tsx
// ═══ INLINE 18+ GATE ═══
// Replaces NsfwLinkOverlay. Instead of an overlay appearing on top,
// the button itself transforms to show the 18+ warning on first click.
// Second click confirms and navigates. Auto-reverts after 4 seconds.

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface NsfwInlineGateProps {
  children: React.ReactNode;
  url: string;
  onConfirm: () => void; // Called when user confirms (second click)
  className?: string;
}

const NsfwInlineGate = ({ children, url, onConfirm, className }: NsfwInlineGateProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const revertTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleFirstClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWarning(true);
    // Auto-revert after 4s if no second click
    revertTimer.current = setTimeout(() => setShowWarning(false), 4000);
  }, []);

  const handleSecondClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (revertTimer.current) clearTimeout(revertTimer.current);
    setShowWarning(false);
    onConfirm();
  }, [onConfirm]);

  return (
    <div className={`relative ${className || ''}`}>
      {/* Normal state — show the link button */}
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
            {/* Invisible interceptor for first click */}
            <div
              onClick={handleFirstClick}
              className="absolute inset-0 z-10 cursor-pointer"
            />
          </motion.div>
        ) : (
          /* Warning state — the button IS the warning */
          <motion.button
            key="warning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleSecondClick}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-black border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-[13px]">18+ Contenu sensible</p>
              <p className="text-white/40 text-[11px] mt-0.5">Appuie pour continuer</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NsfwInlineGate;
