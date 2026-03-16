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
    const { copyToClipboard } = await import('@/lib/clipboard');
    const ok = await copyToClipboard(pageUrl);
    if (ok) { setCopied(true); toast.success('Lien copié'); setTimeout(() => setCopied(false), 2000); }
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
              className="mt-4 space-y-3"
            >
              {/* Social share row */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://x.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent('Check out my page')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border/40 text-[12px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  X
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Check out my page ' + pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border/40 text-[12px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent('Check out my page')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border/40 text-[12px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#229ED9"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  Telegram
                </a>
              </div>

              {/* Native share (mobile) */}
              {typeof navigator.share === 'function' && (
                <Button onClick={handleShare} className="w-full h-11 rounded-xl gap-2 font-semibold">
                  <Share2 className="w-4 h-4" />
                  Plus d'options
                </Button>
              )}

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
