import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useLinks } from '@/hooks/useDashboard';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileEditor from '@/components/dashboard/ProfileEditor';
import LinksManager from '@/components/dashboard/LinksManager';
import LinkPreview from '@/components/dashboard/LinkPreview';
import ThemeSelector from '@/components/dashboard/ThemeSelector';
import AnalyticsPanel from '@/components/dashboard/AnalyticsPanel';
import LanguageSelector from '@/components/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/lib/plans';
import { toast } from '@/hooks/use-toast';
import { LogOut, User, Link2, Eye, ExternalLink, Palette, BarChart3, CreditCard, Loader2, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut, checkSubscription } = useAuth();
  const { profile, loading: profileLoading, updateProfile, refetch: refetchProfile } = useProfile();
  const { links, loading: linksLoading, addLink, updateLink, deleteLink, reorderLinks, refetch: refetchLinks } = useLinks();
  const [activeTab, setActiveTab] = useState('links');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const tabs = [
    { value: 'links', icon: Link2, label: t('dashboard.links') },
    { value: 'profile', icon: User, label: t('dashboard.profile') },
    { value: 'theme', icon: Palette, label: t('dashboard.theme') },
    { value: 'analytics', icon: BarChart3, label: t('dashboard.analytics') },
    { value: 'plan', icon: CreditCard, label: t('dashboard.plan') },
  ];

  // After checkout success, refresh subscription
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription().then(() => refetchProfile());
      toast({ title: t('common.success'), description: '🎉' });
    }
  }, [searchParams]);

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return <Navigate to="/set-username" replace />;
  if (!profile.username || profile.username.startsWith('null')) return <Navigate to="/set-username" replace />;

  const handleCheckout = async (planKey: 'starter' | 'pro') => {
    const plan = PLANS[planKey];
    if (!plan.price_id) return;
    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e: any) {
      toast({ title: t('common.error'), description: e.message, variant: 'destructive' });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e: any) {
      toast({ title: t('common.error'), description: e.message, variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlan = profile.plan || 'free';

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto border-b border-border">
        <Link to="/" className="font-display text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MyTaptap
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs sm:text-sm" asChild>
            <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" /> <span className="hidden sm:inline">{t('dashboard.preview')}</span>
            </a>
          </Button>
          <LanguageSelector />
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">{t('nav.logout')}</span>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              {/* Desktop tabs */}
              {!isMobile && (
                <div className="mb-6">
                  <TabsList className="bg-muted rounded-full p-1 gap-1 inline-flex">
                    {tabs.map(({ value, icon: Icon, label }) => (
                      <TabsTrigger key={value} value={value} className="rounded-full gap-1.5 data-[state=active]:bg-background text-sm px-3 py-2">
                        <Icon className="w-4 h-4 shrink-0" /> {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              )}

              <TabsContent value="links">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <LinksManager
                      links={links}
                      plan={profile.plan}
                      onAdd={addLink}
                      onUpdate={updateLink}
                      onDelete={deleteLink}
                      onReorder={reorderLinks}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">{t('dashboard.profile')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileEditor profile={profile} onUpdate={updateProfile} onRefetch={refetchProfile} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="theme">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <ThemeSelector profile={profile} onUpdate={updateProfile} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <AnalyticsPanel links={links} plan={profile.plan} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plan">
                <div className="space-y-4">
                  {/* Current plan */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{t('pricing.currentPlan')}</p>
                          <p className="text-2xl font-display font-bold text-foreground capitalize">{currentPlan}</p>
                        </div>
                        {currentPlan !== 'free' && (
                          <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={handlePortal} disabled={portalLoading}>
                            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                            {t('pricing.manageSubscription')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upgrade cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Starter */}
                    <Card className={`${currentPlan === 'starter' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-bold text-lg">Starter</h3>
                          <span className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-2 py-1 rounded-full">🚀 {t('pricing.launchBadge')}</span>
                        </div>
                        <p className="text-3xl font-bold">19,99€<span className="text-sm font-normal text-muted-foreground">{t('pricing.month')}</span></p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {(t('pricing.starterFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                            <li key={i}>✓ {f}</li>
                          ))}
                        </ul>
                        {currentPlan === 'starter' ? (
                          <Button disabled className="w-full rounded-full">{t('pricing.currentPlan')}</Button>
                        ) : currentPlan === 'pro' ? (
                          <Button disabled variant="outline" className="w-full rounded-full">{t('pricing.includedInPro')}</Button>
                        ) : (
                          <Button
                            className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                            onClick={() => handleCheckout('starter')}
                            disabled={!!checkoutLoading}
                          >
                            {checkoutLoading === 'starter' ? <Loader2 className="w-4 h-4 animate-spin" /> : t('pricing.upgradeStarter')}
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    {/* Pro */}
                    <Card className={`${currentPlan === 'pro' ? 'border-primary ring-2 ring-primary/20' : 'border-primary/50'}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-bold text-lg">Pro</h3>
                          <span className="text-xs bg-gradient-to-r from-primary to-secondary text-primary-foreground px-2 py-1 rounded-full">{t('pricing.popular')}</span>
                        </div>
                        <p className="text-3xl font-bold">115€<span className="text-sm font-normal text-muted-foreground">{t('pricing.year')}</span></p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {(t('pricing.proFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                            <li key={i}>✓ {f}</li>
                          ))}
                        </ul>
                        {currentPlan === 'pro' ? (
                          <Button disabled className="w-full rounded-full">{t('pricing.currentPlan')}</Button>
                        ) : (
                          <Button
                            className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                            onClick={() => handleCheckout('pro')}
                            disabled={!!checkoutLoading}
                          >
                            {checkoutLoading === 'pro' ? <Loader2 className="w-4 h-4 animate-spin" /> : t('pricing.upgrade')}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{t('dashboard.preview')}</span>
              </div>
              <LinkPreview profile={profile} links={links} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around h-16">
            {tabs.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => handleTabChange(value)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === value ? 'text-primary' : ''}`} />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Dashboard;