import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TapLoader as Loader2, TapCrown as Crown, TapCreditCard as CreditCard, TapAlert as AlertTriangle, TapLogOut as LogOut, TapRefresh as RefreshCw, TapCalendar as Calendar, TapSparkles as Sparkles, TapGlobe as Globe, TapCheck as Check, TapCopy as Copy, TapExternalLink as ExternalLink, TapAtSign as AtSign, TapX as X, TapTrash as Trash2 } from '@/components/icons/TapIcons';
import { PLANS, type PlanKey } from '@/lib/plans';
import { checkUsernameAvailability } from '@/lib/username';
import { Mail } from 'lucide-react';
import { format, type Locale } from 'date-fns';
import { fr, enUS, es, de, it, ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const localeMap: Record<string, Locale> = {
  fr, en: enUS, es, de, it, pt: ptBR
};

/* ── Plan Comparison Card ── */
interface PlanCardProps {
  name: string;
  price: string;
  interval: string;
  features: string[];
  missingFeatures: string[];
  isCurrent: boolean;
  variant: 'muted' | 'accent' | 'primary';
  badge?: string;
  onUpgrade?: () => void;
  loading?: boolean;
}

const PlanCard = ({ name, price, interval, features, missingFeatures, isCurrent, variant, badge, onUpgrade, loading }: PlanCardProps) => {
  const variantStyles = {
    muted: 'border-border/50 bg-muted/30',
    accent: 'border-border/60 bg-accent/20',
    primary: 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border p-4 flex flex-col ${variantStyles[variant]} ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}
    >
      {badge && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] text-primary-foreground border-0 text-[10px] px-2.5 shadow-md">
            {badge}
          </Badge>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-2.5 right-3">
          <Badge variant="secondary" className="text-[10px] px-2">Plan actuel</Badge>
        </div>
      )}

      <div className="text-center mb-3 pt-1">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {price}
          {interval && <span className="text-xs font-normal text-muted-foreground">{interval}</span>}
        </p>
      </div>

      <div className="flex-1 space-y-1.5 mb-4">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-1.5 text-xs text-foreground">
            <Check className="w-3.5 h-3.5 text-[hsl(var(--pop-lime))] shrink-0 mt-0.5" />
            <span>{f}</span>
          </div>
        ))}
        {missingFeatures.map((f) => (
          <div key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground/60">
            <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-through">{f}</span>
          </div>
        ))}
      </div>

      {onUpgrade && (
        <Button
          size="sm"
          onClick={onUpgrade}
          disabled={loading}
          className={`w-full rounded-xl text-xs h-8 ${variant === 'primary' ? 'bg-gradient-to-r from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] text-primary-foreground hover:opacity-90 border-0 shadow-md' : ''}`}
          variant={variant === 'primary' ? 'default' : 'outline'}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
            <>
              {variant === 'primary' && <Sparkles className="w-3 h-3" />}
              Choisir {name}
            </>
          )}
        </Button>
      )}

      {isCurrent && !onUpgrade && (
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">✓ Actif</span>
        </div>
      )}
    </motion.div>
  );
};

const DashboardSettings = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Username change state
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'reserved'>('idle');
  const [usernameTimer, setUsernameTimer] = useState<NodeJS.Timeout | null>(null);
  const [usernameSaving, setUsernameSaving] = useState(false);

  // Custom domain state
  const [customDomain, setCustomDomain] = useState('');
  const [domainVerified, setDomainVerified] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainSaving, setDomainSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Delete account state
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle');

  // Email preferences
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);

  const currentLocale = localeMap[i18n.language] || enUS;
  const isPro = subscription.plan === 'pro';

  useEffect(() => {
    if (user) {
      loadUsername();
      if (isPro) loadCustomDomain();
    }
  }, [user, isPro]);

  const loadUsername = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setCurrentUsername(data.username);
      setEmailWeekly((data as any).email_weekly ?? true);
    }
  };

  const checkNewUsername = (value: string) => {
    if (usernameTimer) clearTimeout(usernameTimer);
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setNewUsername(cleaned);
    if (cleaned.length < 3 || cleaned === currentUsername) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const result = await checkUsernameAvailability(cleaned);
      setUsernameStatus(result);
    }, 500);
    setUsernameTimer(timer);
  };

  const handleSaveUsername = async () => {
    if (usernameStatus !== 'available') return;
    setUsernameSaving(true);

    // Update profile username only — page usernames are managed per-page in the page editor
    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('user_id', user!.id);

    if (error) {
      toast.error(t('common.error'));
    } else {
      setCurrentUsername(newUsername);
      setNewUsername('');
      setUsernameStatus('idle');
      toast.success(t('settings.usernameSaved'));
    }
    setUsernameSaving(false);
  };

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
      toast.success(t('settings.domainRemoved') );
      return;
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(customDomain)) {
      toast.error(t('common.error'));
      return;
    }

    setDomainSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ custom_domain: customDomain.toLowerCase(), domain_verified: false })
      .eq('user_id', user!.id);

    if (error) {
      toast.error(t('common.error'));
    } else {
      setDomainVerified(false);
      toast.success(t('settings.domainSaved'));
    }
    setDomainSaving(false);
  };

  const copyToClipboard = async (text: string, key: string) => {
    const { copyToClipboard: safeCopy } = await import('@/lib/clipboard');
    const ok = await safeCopy(text);
    if (ok) { setCopied(key); setTimeout(() => setCopied(null), 2000); }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        toast.error(t('common.error'));
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      toast.error(t('common.error'));
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
        toast.error(t('common.error'));
      } else if (data?.url) {
        // Use location.href — window.open is blocked by popup blockers on mobile
        window.location.href = data.url;
      }
    } catch (e) {
      toast.error(t('common.error'));
    }
    setCheckoutLoading(null);
  };

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await checkSubscription();
    setRefreshing(false);
    toast.success(t('settings.refreshStatus'));
  };

  const currentPlan = PLANS[subscription.plan as PlanKey] || PLANS.free;
  const isPremium = subscription.plan !== 'free';

  const handleToggleWeeklyEmail = async (value: boolean) => {
    setEmailLoading(true);
    setEmailWeekly(value);
    const { error } = await supabase
      .from('profiles')
      .update({ email_weekly: value } as any)
      .eq('user_id', user!.id);
    if (error) {
      setEmailWeekly(!value);
      toast.error(t('common.error'));
    }
    setEmailLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== user?.email) {
      toast.error('L\'email ne correspond pas.');
      return;
    }
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) {
        toast.error(error.message || 'Erreur lors de la suppression.');
        setDeleting(false);
        return;
      }
      toast.success('Compte supprimé. À bientôt.');
      // Sign out and redirect to home
      await signOut();
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'Erreur inattendue.');
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Subscription & Plan Comparison */}
        <Card className="overflow-hidden">
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
          <CardContent className="space-y-6">
            {subscription.loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Current plan summary for premium users */}
                {isPremium && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{currentPlan.name}</p>
                        <Badge variant="default">{t('settings.premium')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan.maxPages === Infinity 
                          ? 'Pages illimitées'
                          : `${currentPlan.maxPages} page${currentPlan.maxPages > 1 ? 's' : ''} max`
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
                      <p className="text-2xl font-bold text-foreground">
                        {(currentPlan.price / 100).toFixed(2).replace('.', ',')} €
                        <span className="text-sm text-muted-foreground">
                          {currentPlan.interval === 'month' ? t('settings.perMonth') : t('settings.perYear')}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Visual plan comparison grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Free Plan */}
                  <PlanCard
                    name="Free"
                    price="0€"
                    interval=""
                    features={['1 page', '5 liens', '3 thèmes', '7 jours d\'analytics']}
                    missingFeatures={['Thèmes premium', 'Domaine personnalisé', 'Analytics avancés']}
                    isCurrent={subscription.plan === 'free'}
                    variant="muted"
                  />

                  {/* Starter Plan */}
                  <PlanCard
                    name="Starter"
                    price="19,99€"
                    interval={t('settings.perMonth')}
                    features={['10 pages', '20 liens', 'Tous les thèmes', '90 jours d\'analytics', 'Tracking pixels']}
                    missingFeatures={['Domaine personnalisé']}
                    isCurrent={subscription.plan === 'starter'}
                    variant="accent"
                    onUpgrade={subscription.plan === 'free' ? () => handleUpgrade('starter') : undefined}
                    loading={checkoutLoading === 'starter'}
                  />

                  {/* Pro Plan */}
                  <PlanCard
                    name="Pro"
                    price="115€"
                    interval={t('settings.perYear')}
                    badge="Populaire"
                    features={['Pages illimitées', 'Liens illimités', 'Tous les thèmes', 'Analytics illimités', 'Domaine personnalisé', 'Tracking pixels', 'Support prioritaire']}
                    missingFeatures={[]}
                    isCurrent={subscription.plan === 'pro'}
                    variant="primary"
                    onUpgrade={subscription.plan !== 'pro' ? () => handleUpgrade('pro') : undefined}
                    loading={checkoutLoading === 'pro'}
                  />
                </div>

                {isPremium && (
                  <Button 
                    onClick={handleManageSubscription} 
                    variant="outline" 
                    className="w-full"
                    disabled={portalLoading}
                  >
                    {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    {t('settings.manageBtn')}
                  </Button>
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

        {/* Username */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AtSign className="w-4 h-4 text-primary" />
              {t('auth.username') || 'Nom d\'utilisateur'}
            </CardTitle>
            <CardDescription>
              {t('settings.publicUrl')}: mytaptap.com/<span className="font-medium">{currentUsername}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={newUsername}
                  onChange={(e) => checkNewUsername(e.target.value)}
                  placeholder={currentUsername}
                  minLength={3}
                  maxLength={30}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {usernameStatus === 'available' && <Check className="w-4 h-4 text-primary" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'reserved') && <X className="w-4 h-4 text-destructive" />}
                </div>
              </div>
              <Button
                onClick={handleSaveUsername}
                disabled={usernameSaving || usernameStatus !== 'available'}
              >
                {usernameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.save')}
              </Button>
            </div>
            {usernameStatus === 'taken' && <p className="text-xs text-destructive">{t('auth.usernameTaken')}</p>}
            {usernameStatus === 'reserved' && <p className="text-xs text-destructive">Ce nom est réservé</p>}
            {usernameStatus === 'available' && <p className="text-xs text-primary">{t('auth.usernameAvailable')}</p>}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Choisis ce que tu reçois par email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-1">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Résumé hebdomadaire</p>
                <p className="text-[12px] text-muted-foreground">
                  Clics, vues et performances de la semaine, chaque lundi
                </p>
              </div>
              <Switch
                checked={emailWeekly}
                onCheckedChange={handleToggleWeeklyEmail}
                disabled={emailLoading}
              />
            </div>
          </CardContent>
        </Card>

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
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {t('settings.dangerZone')}
            </CardTitle>
            <CardDescription>
              {t('settings.dangerDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deleteStep === 'idle' ? (
              <Button
                variant="outline"
                className="w-full justify-start border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteStep('confirm')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer mon compte
              </Button>
            ) : (
              <div className="space-y-4 p-4 rounded-lg border border-destructive/20 bg-destructive/[0.03]">
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    Cette action est définitive et irréversible.
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Toutes vos pages, liens, statistiques, templates et fichiers seront supprimés.
                    {isPremium && ' Votre abonnement Stripe sera annulé automatiquement.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Tapez <span className="font-mono font-semibold text-foreground">{user?.email}</span> pour confirmer
                  </Label>
                  <Input
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder={user?.email || ''}
                    className="border-destructive/20 focus:border-destructive/50"
                    autoComplete="off"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setDeleteStep('idle'); setDeleteConfirmEmail(''); }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting || deleteConfirmEmail !== user?.email}
                    onClick={handleDeleteAccount}
                    className="flex-1"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Supprimer définitivement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSettings;
