import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

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
          <h1 className="text-xl font-bold text-white">Age Verification Required</h1>
          <p className="text-white/50 text-sm mt-2">
            The content on <span className="text-white/70 font-medium">@{profile.username}</span>'s page may contain age-restricted material.
          </p>
        </div>

        {/* Info */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-white/60 text-xs leading-relaxed">
            By continuing, you confirm that you are at least 18 years old and agree to view potentially mature content. This verification helps protect minors and ensures compliance with platform policies.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onVerified}
            className="w-full py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            I am 18 or older — Continue
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3.5 rounded-2xl bg-white/5 text-white/60 font-medium text-sm border border-white/10 hover:bg-white/10 transition-colors"
          >
            Go back
          </button>
        </div>

        {/* Shield badge */}
        <div className="flex items-center justify-center gap-1.5 text-white/20 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Protected by MyTaptap Shield</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AgeGate;
