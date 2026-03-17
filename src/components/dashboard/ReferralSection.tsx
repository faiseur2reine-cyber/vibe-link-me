import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { TapCopy as Copy, TapCheck as Check, TapShare as Share } from '@/components/icons/TapIcons';
import { Users, DollarSign, UserPlus } from 'lucide-react';

interface ReferralStats {
  totalReferred: number;
  converted: number;
  totalEarned: number;
  referralCode: string;
}

const ReferralSection = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({ totalReferred: 0, converted: 0, totalEarned: 0, referralCode: '' });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    const [profileRes, referralsRes] = await Promise.all([
      supabase.from('profiles').select('referral_code').eq('user_id', user!.id).single(),
      supabase.from('referrals').select('status, total_earned').eq('referrer_id', user!.id),
    ]);

    const code = profileRes.data?.referral_code || '';
    const referrals = referralsRes.data || [];
    const converted = referrals.filter(r => r.status === 'converted').length;
    const totalEarned = referrals.reduce((sum, r) => sum + Number(r.total_earned || 0), 0);

    setStats({ totalReferred: referrals.length, converted, totalEarned, referralCode: code });
    setLoading(false);
  };

  const referralUrl = `https://mytaptap.com/?ref=${stats.referralCode}`;

  const handleCopy = async () => {
    const { copyToClipboard } = await import('@/lib/clipboard');
    const ok = await copyToClipboard(referralUrl);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Lien copié !'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MyTaptap – Gagne 20% à vie',
        text: 'Crée ta page de liens gratuitement sur MyTaptap ! Utilise mon lien pour t\'inscrire.',
        url: referralUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-24 animate-pulse bg-muted/50 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Programme d'affiliation
          <Badge className="bg-gradient-to-r from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] text-primary-foreground border-0 text-[10px]">
            20% à vie
          </Badge>
        </CardTitle>
        <CardDescription>
          Partage ton lien et gagne 20% de commission récurrente sur chaque abonnement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Filleuls', value: stats.totalReferred, icon: UserPlus, color: 'text-primary' },
            { label: 'Convertis', value: stats.converted, icon: Users, color: 'text-[hsl(var(--pop-lime))]' },
            { label: 'Gagné', value: `${stats.totalEarned.toFixed(2)}€`, icon: DollarSign, color: 'text-[hsl(var(--pop-coral))]' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center"
            >
              <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Referral link */}
        <div className="flex gap-2">
          <div className="flex-1 min-w-0 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 text-xs font-mono text-muted-foreground truncate">
            {referralUrl}
          </div>
          <Button size="sm" variant="outline" className="shrink-0 h-9 gap-1.5" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5 text-[hsl(var(--pop-lime))]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié' : 'Copier'}
          </Button>
          <Button size="sm" className="shrink-0 h-9 gap-1.5 bg-gradient-to-r from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] text-primary-foreground border-0" onClick={handleShare}>
            <Share className="w-3.5 h-3.5" />
            Partager
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
