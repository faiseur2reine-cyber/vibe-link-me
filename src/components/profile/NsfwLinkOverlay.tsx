import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NsfwLinkOverlayProps {
  children: React.ReactNode;
  url: string;
  onRevealClick: () => void;
}

const NsfwLinkOverlay = ({ children, url, onRevealClick }: NsfwLinkOverlayProps) => {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred/hidden original link */}
      <div className="opacity-0 pointer-events-none" aria-hidden>
        {children}
      </div>
      {/* NSFW overlay */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setRevealed(true);
          onRevealClick();
        }}
        className="absolute inset-0 w-full rounded-2xl bg-black border border-white/10 flex items-center gap-4 px-5 py-3.5 text-left cursor-pointer hover:border-white/20 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <EyeOff className="w-5 h-5 text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">18+ Sensitive Content</p>
          <p className="text-white/50 text-xs mt-0.5">This link may contain adult content.</p>
          <p className="text-white text-xs font-medium underline underline-offset-2 mt-1">Click to continue</p>
        </div>
      </motion.button>
    </div>
  );
};

export default NsfwLinkOverlay;
