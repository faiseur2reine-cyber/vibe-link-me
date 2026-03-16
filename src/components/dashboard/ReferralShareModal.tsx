import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TapCopy as Copy, TapCheck as Check, TapShare as Share, TapSparkles as Sparkles } from '@/components/icons/TapIcons';
import { toast } from 'sonner';

interface ReferralShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReferralShareModal = ({ open, onOpenChange }: ReferralShareModalProps) => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && user) {
      supabase
        .from('profiles')
        .select('referral_code, username')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setReferralCode(data?.referral_code || data?.username || '');
        });
    }
  }, [open, user]);

  const referralUrl = `https://mytaptap.com/?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins MyTaptap',
          text: 'Crée ton lien en bio et gagne plus 🚀 Utilise mon lien pour t\'inscrire !',
          url: referralUrl,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            Félicitations pour ton upgrade ! 🎉
          </DialogTitle>
          <DialogDescription>
            Partage ton lien d'affiliation et gagne <strong className="text-foreground">20% de commission récurrente</strong> sur chaque abonnement de tes filleuls.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm font-mono text-foreground break-all">
            {referralUrl}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="flex-1 rounded-xl">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copié !' : 'Copier le lien'}
            </Button>
            <Button onClick={handleShare} className="flex-1 rounded-xl bg-gradient-to-r from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] text-primary-foreground hover:opacity-90">
              <Share className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Tu gagnes 20% sur chaque paiement de tes filleuls, tant qu'ils restent abonnés.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralShareModal;
