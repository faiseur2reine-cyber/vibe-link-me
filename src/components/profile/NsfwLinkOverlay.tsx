import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NsfwLinkOverlayProps {
  children: React.ReactNode;
  url: string;
  onRevealClick: () => void;
}

const NsfwLinkOverlay = ({ children, url, onRevealClick }: NsfwLinkOverlayProps) => {
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className="relative">
      {/* Original link — intercept click to show warning */}
      <div
        onClick={(e) => {
          if (!showWarning) {
            e.preventDefault();
            e.stopPropagation();
            setShowWarning(true);
          }
        }}
        onClickCapture={(e) => {
          if (!showWarning) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>

      {/* NSFW warning overlay — appears on first click */}
      <AnimatePresence>
        {showWarning && (
          <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              onRevealClick();
            }}
            className="absolute inset-0 w-full rounded-2xl bg-black border border-white/10 flex items-center gap-4 px-5 py-3.5 text-left cursor-pointer hover:border-white/20 transition-colors z-10"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <EyeOff className="w-5 h-5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">18+ Sensitive Content</p>
              <p className="text-white/50 text-xs mt-0.5">This link may contain adult content.</p>
              <p className="text-white text-xs font-medium underline underline-offset-2 mt-1">Click to continue</p>
            </div>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NsfwLinkOverlay;
