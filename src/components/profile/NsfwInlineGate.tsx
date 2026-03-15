// src/components/profile/NsfwInlineGate.tsx
// ═══ INLINE 18+ GATE (GetMySocial style) ═══
// Invisible interceptor sits on top of the button.
// First click → show "18+" overlay. Second click → confirm + navigate.
// Auto-reverts after 4s. Multi-language.

import { useState, useRef, useCallback } from 'react';

interface NsfwInlineGateProps {
  children: React.ReactNode;
  url: string;
  onConfirm: () => void;
  variant?: 'dark' | 'light';
  className?: string;
}

function getGateText() {
  const lang = (navigator.language || '').slice(0, 2);
  const texts: Record<string, { badge: string; hint: string }> = {
    fr: { badge: '18+', hint: 'Appuie encore pour continuer' },
    en: { badge: '18+', hint: 'Tap again to continue' },
    es: { badge: '18+', hint: 'Toca de nuevo para continuar' },
    de: { badge: '18+', hint: 'Nochmal tippen zum Fortfahren' },
    it: { badge: '18+', hint: 'Tocca di nuovo per continuare' },
    pt: { badge: '18+', hint: 'Toque novamente para continuar' },
  };
  return texts[lang] || texts.en;
}

const NsfwInlineGate = ({ children, url, onConfirm, variant = 'dark', className }: NsfwInlineGateProps) => {
  const [armed, setArmed] = useState(false);
  const revertTimer = useRef<ReturnType<typeof setTimeout>>();
  const text = getGateText();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!armed) {
      setArmed(true);
      if (revertTimer.current) clearTimeout(revertTimer.current);
      revertTimer.current = setTimeout(() => setArmed(false), 4000);
    } else {
      if (revertTimer.current) clearTimeout(revertTimer.current);
      setArmed(false);
      onConfirm();
    }
  }, [armed, onConfirm]);

  return (
    <div className={`relative ${className || ''}`}>
      {/* Original button — always rendered, preserves shape */}
      <div style={{ pointerEvents: 'none' }}>
        {children}
      </div>

      {/* Click interceptor — always on top, catches all taps */}
      <div
        onClick={handleClick}
        className="absolute inset-0 z-20 cursor-pointer"
        style={{
          borderRadius: 'inherit',
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      {/* 18+ overlay — appears on first click */}
      {armed && (
        <div
          onClick={handleClick}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-sm cursor-pointer"
          style={{
            background: 'rgba(0, 0, 0, 0.65)',
            borderRadius: 'inherit',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full bg-red-600 text-white font-bold shadow-sm"
            style={{ padding: '4px 14px', fontSize: 14, letterSpacing: '0.02em' }}
          >
            {text.badge}
          </span>
          <span
            className="text-white font-medium mt-1.5"
            style={{ fontSize: 12, opacity: 0.8 }}
          >
            {text.hint}
          </span>
        </div>
      )}
    </div>
  );
};

export default NsfwInlineGate;
