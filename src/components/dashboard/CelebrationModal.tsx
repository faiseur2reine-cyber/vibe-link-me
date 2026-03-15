import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TapCheck as Check, TapCopy as Copy, TapShare as Share2, TapExternalLink as ExternalLink } from '@/components/icons/TapIcons';
import { toast } from 'sonner';

interface CelebrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

// ── Confetti particle ──
const Particle = ({ delay, x }: { delay: number; x: number }) => {
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 4 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -80 - Math.random() * 120, 200 + Math.random() * 100],
        x: [0, (x - 50) * 3 + (Math.random() - 0.5) * 80],
        rotate: [0, rotation, rotation * 2],
        scale: [0, 1.2, 0.5],
      }}
      transition={{ duration: 1.8 + Math.random() * 0.8, delay: delay * 0.02, ease: 'easeOut' }}
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size * (Math.random() > 0.5 ? 1 : 0.6),
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '1px',
        left: '50%',
        top: '40%',
      }}
    />
  );
};

const CelebrationModal = ({ open, onOpenChange, username }: CelebrationModalProps) => {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const pageUrl = `${window.location.origin}/${username}`;

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success('Lien copié');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `@${username}`, url: pageUrl });
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-0">
        <div className="relative">
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <Particle key={i} delay={i} x={Math.random() * 100} />
              ))}
            </div>
          )}

          <div className="relative z-20 px-6 pt-10 pb-6 text-center">
            {/* Animated check */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              >
                <Check className="w-8 h-8 text-emerald-500" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-foreground tracking-tight"
            >
              Ta page est live !
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-[13px] text-muted-foreground mt-2 leading-relaxed"
            >
              Ton premier lien est en place. Partage ta page avec ton audience.
            </motion.p>

            {/* URL preview */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-5 flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5"
            >
              <span className="text-[13px] font-medium text-foreground truncate flex-1 text-left">
                mytaptap.com/{username}
              </span>
              <button
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-4 space-y-2"
            >
              <Button onClick={handleShare} className="w-full h-11 rounded-xl gap-2 font-semibold">
                <Share2 className="w-4 h-4" />
                Partager ma page
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-xl gap-1.5 text-[12px]"
                  asChild
                >
                  <a href={`/${username}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Voir ma page
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 h-10 rounded-xl text-[12px] text-muted-foreground"
                  onClick={() => onOpenChange(false)}
                >
                  Continuer
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CelebrationModal;
