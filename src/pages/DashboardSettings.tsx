import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Crown, CreditCard, AlertTriangle, LogOut, RefreshCw, Calendar, Sparkles, Globe, Check, Copy, ExternalLink, AtSign, X } from 'lucide-react';
import { PLANS, type PlanKey } from '@/lib/plans';
import { format, type Locale } from 'date-fns';
import { fr, enUS, es, de, it, ptBR } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  fr, en: enUS, es, de, it, pt: ptBR
};

const DashboardSettings = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut, subscription, checkSubscription } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Username change state
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameTimer, setUsernameTimer] = useState<NodeJS.Timeout | null>(null);
  const [usernameSaving, setUsernameSaving] = useState(false);

  // Custom domain state
  const [customDomain, setCustomDomain] = useState('');
  const [domainVerified, setDomainVerified] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainSaving, setDomainSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const currentLocale = localeMap[i18n.language] || enUS;
  const isPro = subscription.plan === 'pro';

  useEffect(() => {
    if (user && isPro) {
      loadCustomDomain();
    }
  }, [user, isPro]);

  const loadCustomDomain = async () => {
    setDomainLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('custom_domain, domain_verified')
      .eq('user_id', user!.id)
      .single();
    
    if (data) {
      setCustomDomain(data.custom_domain || '');
      setDomainVerified(data.domain_verified || false);
    }
    setDomainLoading(false);
  };

  const handleSaveDomain = async () => {
    if (!customDomain.trim()) {
      // Clear domain
      setDomainSaving(true);
      await supabase
        .from('profiles')
        .update({ custom_domain: null, domain_verified: false })
        .eq('user_id', user!.id);
      setDomainVerified(false);
      setDomainSaving(false);
      toast({ title: t('settings.domainRemoved') });
      return;
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(customDomain)) {
      toast({ title: t('common.error'), description: t('settings.invalidDomain'), variant: 'destructive' });
      return;
    }

    setDomainSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ custom_domain: customDomain.toLowerCase(), domain_verified: false })
      .eq('user_id', user!.id);

    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      setDomainVerified(false);
      toast({ title: t('settings.domainSaved'), description: t('settings.domainSavedDesc') });
    }
    setDomainSaving(false);
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      } else if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e) {
      toast({ title: t('common.error'), description: t('common.error'), variant: 'destructive' });
    }
    setPortalLoading(false);
  };

  const handleUpgrade = async (planKey: 'starter' | 'pro') => {
    const plan = PLANS[planKey];
    if (!plan.price_id) return;

    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.price_id },
      });

      if (error) {
        toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      } else if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e) {
      toast({ title: t('common.error'), description: t('common.error'), variant: 'destructive' });
    }
    setCheckoutLoading(null);
  };

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast({ title: t('settings.refreshStatus'), description: t('settings.refreshDesc') });
  };

  const currentPlan = PLANS[subscription.plan as PlanKey] || PLANS.free;
  const isPremium = subscription.plan !== 'free';

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                {t('settings.subscription')}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshSubscription}
                disabled={refreshing || subscription.loading}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <CardDescription>{t('settings.manageSubscription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{currentPlan.name}</p>
                      <Badge variant={isPremium ? 'default' : 'secondary'}>
                        {isPremium ? t('settings.premium') : t('settings.free')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan.maxLinks === Infinity 
                        ? t('settings.unlimitedLinks')
                        : t('settings.upToLinks', { count: currentPlan.maxLinks })
                      }
                    </p>
                    {subscription.subscriptionEnd && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t('settings.nextRenewal', { 
                          date: format(new Date(subscription.subscriptionEnd), 'dd MMMM yyyy', { locale: currentLocale })
                        })}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {isPremium && (
                      <p className="text-2xl font-bold text-foreground">
                        {(currentPlan.price / 100).toFixed(2).replace('.', ',')} €
                        <span className="text-sm text-muted-foreground">
                          {currentPlan.interval === 'month' ? t('settings.perMonth') : t('settings.perYear')}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {isPremium ? (
                  <Button 
                    onClick={handleManageSubscription} 
                    variant="outline" 
                    className="w-full"
                    disabled={portalLoading}
                  >
                    {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    {t('settings.manageBtn')}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      {t('settings.upgradePrompt')}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpgrade('starter')}
                        disabled={checkoutLoading === 'starter'}
                        className="flex-col h-auto py-3"
                      >
                        {checkoutLoading === 'starter' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span className="font-semibold">Starter</span>
                            <span className="text-xs text-muted-foreground">19,99€{t('settings.perMonth')}</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => handleUpgrade('pro')}
                        disabled={checkoutLoading === 'pro'}
                        className="flex-col h-auto py-3"
                      >
                        {checkoutLoading === 'pro' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mb-0.5" />
                            <span className="font-semibold">Pro</span>
                            <span className="text-xs opacity-80">115€{t('settings.perYear')}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Custom Domain - Pro only */}
        {isPro && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {t('settings.customDomain')}
                <Badge variant="secondary" className="text-[10px]">Pro</Badge>
              </CardTitle>
              <CardDescription>{t('settings.customDomainDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {domainLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="links.monsite.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveDomain} 
                      disabled={domainSaving}
                    >
                      {domainSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.save')}
                    </Button>
                  </div>

                  {customDomain && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {domainVerified ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <Check className="w-3 h-3 mr-1" />
                            {t('settings.domainVerified')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            {t('settings.domainPending')}
                          </Badge>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                        <p className="text-sm font-medium text-foreground">{t('settings.dnsInstructions')}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2 bg-background rounded border">
                            <div>
                              <span className="text-muted-foreground">Type:</span> <span className="font-mono">CNAME</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Name:</span> <span className="font-mono">{customDomain.split('.')[0]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Value:</span> <span className="font-mono">cname.mytaptap.com</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard('cname.mytaptap.com', 'cname')}
                              >
                                {copied === 'cname' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('settings.dnsPropagation')}</p>
                      </div>

                      {domainVerified && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <ExternalLink className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">
                            {t('settings.domainActive')}: <a href={`https://${customDomain}`} target="_blank" rel="noopener noreferrer" className="font-medium underline">{customDomain}</a>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('settings.accountActions')}</CardTitle>
            <CardDescription>{t('settings.accountActionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('settings.email')}:</span> {user?.email}
              </p>
            </div>
            <Button 
              onClick={signOut} 
              variant="outline" 
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('settings.signOut')}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {t('settings.dangerZone')}
            </CardTitle>
            <CardDescription>
              {t('settings.dangerDesc')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSettings;
