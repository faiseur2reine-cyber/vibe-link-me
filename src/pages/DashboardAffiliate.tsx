import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAffiliateData } from '@/hooks/useAffiliateData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  TapLoader as Loader2, TapDollar as DollarSign, TapLink as Link2,
  TapCheck as Check, TapCopy as Copy, TapExternalLink as ExternalLink,
} from '@/components/icons/TapIcons';
import { Users, TrendingUp, Wallet, AlertCircle } from 'lucide-react';

const formatEur = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')}€`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const DashboardAffiliate = () => {
  const { user } = useAuth();
  const {
    referrals, commissions, payouts, referralCode, balance,
    totalEarned, connectStatus, loading, refetch,
  } = useAffiliateData(user?.id);
  const [copied, setCopied] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/?ref=${referralCode}`;
  const activeReferrals = referrals.filter(r => r.status === 'converted');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');

  const handleCopyLink = async () => {
    const { copyToClipboard } = await import('@/lib/clipboard');
    const ok = await copyToClipboard(referralUrl);
    if (ok) { setCopied(true); toast.success('Lien copié'); setTimeout(() => setCopied(false), 2000); }
  };

  const handleConnectOnboard = async () => {
    setConnectLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('affiliate-payout', {
        body: { action: 'connect-onboard' },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    }
    setConnectLoading(false);
  };

  const handleRequestPayout = async () => {
    setPayoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('affiliate-payout', {
        body: { action: 'request-payout' },
      });
      if (error) throw error;
      toast.success(`Payout de ${formatEur(data.amount)} envoyé`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    }
    setPayoutLoading(false);
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Programme d'affiliation</h1>
          <p className="text-sm text-muted-foreground mt-1">Gagne 20% de commission sur chaque abonnement de tes filleuls</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Solde disponible</p>
                  <p className="text-xl font-bold text-foreground">{formatEur(balance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Total gagné</p>
                  <p className="text-xl font-bold text-foreground">{formatEur(totalEarned)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Filleuls actifs</p>
                  <p className="text-xl font-bold text-foreground">{activeReferrals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">En attente</p>
                  <p className="text-xl font-bold text-foreground">{pendingReferrals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Ton lien d'affiliation
            </CardTitle>
            <CardDescription>Partage ce lien — tu gagnes 20% sur chaque abonnement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground font-mono truncate">
                {referralUrl}
              </div>
              <Button onClick={handleCopyLink} size="sm" variant="outline" className="shrink-0 gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié' : 'Copier'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Connect + Payout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Paiements
            </CardTitle>
            <CardDescription>
              {connectStatus.connected && connectStatus.ready
                ? 'Ton compte Stripe est connecté — tu peux demander un payout'
                : 'Connecte ton compte Stripe pour recevoir tes commissions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!connectStatus.connected ? (
              <Button onClick={handleConnectOnboard} disabled={connectLoading} className="gap-2">
                {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Connecter Stripe
              </Button>
            ) : !connectStatus.ready ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Compte Stripe en attente</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Complète la vérification pour recevoir des paiements</p>
                </div>
                <Button onClick={handleConnectOnboard} size="sm" variant="outline" className="shrink-0 ml-auto" disabled={connectLoading}>
                  Continuer
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Solde disponible</p>
                  <p className="text-2xl font-bold text-foreground">{formatEur(balance)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Minimum 10€ pour un payout</p>
                </div>
                <Button
                  onClick={handleRequestPayout}
                  disabled={payoutLoading || balance < 1000}
                  className="gap-2"
                >
                  {payoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                  Demander un payout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filleuls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filleuls ({referrals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun filleul pour le moment</p>
            ) : (
              <div className="space-y-2">
                {referrals.map(ref => (
                  <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${ref.status === 'converted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{ref.referred_username || 'Utilisateur'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(ref.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={ref.status === 'converted' ? 'default' : 'secondary'} className="text-[10px]">
                        {ref.status === 'converted' ? 'Converti' : 'En attente'}
                      </Badge>
                      {ref.total_earned > 0 && (
                        <p className="text-xs font-medium text-emerald-600 mt-1">{formatEur(ref.total_earned)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique des commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune commission pour le moment</p>
            ) : (
              <div className="space-y-2">
                {commissions.map(com => (
                  <div key={com.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {com.event_type === 'subscription' ? 'Nouvel abonnement' : com.event_type === 'renewal' ? 'Renouvellement' : 'Upgrade'} — {com.plan}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {com.referred_username && `@${com.referred_username} · `}{formatDate(com.created_at)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+{formatEur(com.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout history */}
        {payouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payouts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatEur(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                    </div>
                    <Badge
                      variant={p.status === 'paid' ? 'default' : p.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {p.status === 'paid' ? 'Payé' : p.status === 'failed' ? 'Échoué' : p.status === 'processing' ? 'En cours' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardAffiliate;
