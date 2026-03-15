// src/components/profile/NsfwInlineGate.tsx
// ═══ INLINE 18+ GATE — exact GetMySocial copy ═══
// White frosted overlay on top of button.
// First click → show overlay + arm. Second click → navigate.
// Click outside → dismiss (like GetMySocial's body listener).

import { useState, useRef, useCallback, useEffect } from 'react';

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
    fr: { title: 'Tu as 18 ans ou plus ?', hint: 'Appuie encore pour continuer' },
    en: { title: 'Are you 18+?', hint: 'Click again to continue' },
    es: { title: '¿Tienes 18+?', hint: 'Toca de nuevo para continuar' },
    de: { title: 'Bist du 18+?', hint: 'Nochmal tippen zum Fortfahren' },
    it: { title: 'Hai 18+ anni?', hint: 'Tocca di nuovo per continuare' },
    pt: { title: 'Você tem 18+?', hint: 'Toque novamente para continuar' },
  };
  return texts[lang] || texts.en;
}

const NsfwInlineGate = ({ children, url, onConfirm, variant = 'dark', className }: NsfwInlineGateProps) => {
  const [armed, setArmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const text = getGateText();

  // Click outside → dismiss (GetMySocial uses body listener)
  useEffect(() => {
    if (!armed) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setArmed(false);
      }
    };
    // Delay to avoid catching the same click that armed it
    const t = setTimeout(() => document.addEventListener('click', handler, true), 0);
    return () => { clearTimeout(t); document.removeEventListener('click', handler, true); };
  }, [armed]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!armed) {
      // First click → arm
      setArmed(true);
    } else {
      // Second click → confirm
      setArmed(false);
      onConfirm();
    }
  }, [armed, onConfirm]);

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      {/* Original button — pointer-events disabled so clicks go to interceptor */}
      <div style={{ pointerEvents: 'none' }}>
        {children}
      </div>

      {/* Click interceptor — always on top */}
      <div
        onClick={handleClick}
        className="absolute inset-0 z-20 cursor-pointer"
        style={{ borderRadius: 'inherit', WebkitTapHighlightColor: 'transparent' }}
      />

      {/* White frosted overlay — GetMySocial style */}
      {armed && (
        <div
          onClick={handleClick}
          className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 'inherit',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="flex flex-col items-center justify-center px-4 text-center">
            <span
              className="inline-flex items-center justify-center rounded-full bg-red-600 text-white font-semibold tracking-wide shadow-sm"
              style={{ padding: '3px 12px', fontSize: 13 }}
            >
              18+
            </span>
            <span className="mt-2 text-neutral-900 text-[13px] font-semibold">
              {text.title}
            </span>
            <span className="mt-0.5 text-neutral-500 text-[11px]">
              {text.hint}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NsfwInlineGate;
