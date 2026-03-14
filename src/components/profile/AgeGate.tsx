import { useState } from 'react';
import { motion } from 'framer-motion';
import { TapShield as ShieldCheck, TapAlert as AlertTriangle } from '@/components/icons/TapIcons';

interface AgeGateProps {
  onVerified: () => void;
  profile: {
    display_name: string | null;
    username: string;
    avatar_url: string | null;
  };
}

const AgeGate = ({ onVerified, profile }: AgeGateProps) => {
  const displayName = profile.display_name || profile.username;
  
  // Auto-detect language
  const lang = (navigator.language || '').slice(0, 2);
  const t = {
    fr: { title: 'Vérification d\'âge', desc: 'peut contenir du contenu réservé aux adultes.', info: 'En continuant, vous confirmez avoir au moins 18 ans et acceptez de voir du contenu potentiellement mature.', enter: 'J\'ai 18 ans ou plus — Continuer', back: 'Retour', badge: 'Page protégée' },
    en: { title: 'Age Verification Required', desc: 'may contain age-restricted material.', info: 'By continuing, you confirm that you are at least 18 years old and agree to view potentially mature content.', enter: 'I am 18 or older — Continue', back: 'Go back', badge: 'Protected page' },
    es: { title: 'Verificación de edad', desc: 'puede contener material para adultos.', info: 'Al continuar, confirmas que tienes al menos 18 años.', enter: 'Tengo 18 años o más — Continuar', back: 'Volver', badge: 'Página protegida' },
    de: { title: 'Altersüberprüfung', desc: 'kann Inhalte für Erwachsene enthalten.', info: 'Durch Fortfahren bestätigen Sie, dass Sie mindestens 18 Jahre alt sind.', enter: 'Ich bin 18 oder älter — Weiter', back: 'Zurück', badge: 'Geschützte Seite' },
  }[lang] || { title: 'Age Verification Required', desc: 'may contain age-restricted material.', info: 'By continuing, you confirm that you are at least 18 years old and agree to view potentially mature content.', enter: 'I am 18 or older — Continue', back: 'Go back', badge: 'Protected page' };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-orange-400" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-white">{t.title}</h1>
          <p className="text-white/50 text-sm mt-2">
            <span className="text-white/70 font-medium">@{profile.username}</span> {t.desc}
          </p>
        </div>

        {/* Info */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-white/60 text-xs leading-relaxed">
            {t.info}
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onVerified}
            className="w-full py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            {t.enter}
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3.5 rounded-2xl bg-white/5 text-white/60 font-medium text-sm border border-white/10 hover:bg-white/10 transition-colors"
          >
            {t.back}
          </button>
        </div>

        {/* Shield badge */}
        <div className="flex items-center justify-center gap-1.5 text-white/20 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.badge}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AgeGate;
