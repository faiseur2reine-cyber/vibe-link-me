import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TapCopy as Copy, TapCheck as Check, TapShare as Share, TapSparkles as Sparkles } from '@/components/icons/TapIcons';
import { motion } from 'framer-motion';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReferralShareModal = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && user) {
      supabase.from('profiles').select('referral_code').eq('user_id', user.id).single()
        .then(({ data }) => { if (data?.referral_code) setReferralCode(data.referral_code); });
    }
  }, [open, user]);

  const referralUrl = `https://mytaptap.com/?ref=${referralCode}`;

  const handleCopy = async () => {
    const { copyToClipboard } = await import('@/lib/clipboard');
    const ok = await copyToClipboard(referralUrl);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Lien copié !'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MyTaptap',
        text: 'Crée ta page de liens gratuitement sur MyTaptap ! Tu gagnes 20% de commission sur chaque abonnement.',
        url: referralUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Merci pour ton upgrade ! 🎉
          </DialogTitle>
          <DialogDescription>
            Partage ton lien et gagne <span className="font-semibold text-foreground">20% de commission à vie</span> sur chaque abonnement de tes filleuls.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 pt-2"
        >
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm font-mono text-center text-muted-foreground break-all">
            {referralUrl}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-1.5" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-[hsl(var(--pop-lime))]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier le lien'}
            </Button>
            <Button className="flex-1 gap-1.5 bg-gradient-to-r from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] text-primary-foreground border-0" onClick={handleShare}>
              <Share className="w-4 h-4" />
              Partager
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralShareModal;
