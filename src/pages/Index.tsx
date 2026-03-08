import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/lib/plans';
import { toast } from '@/hooks/use-toast';
import { Heart, Loader2 } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleUpgrade = async (planKey: 'starter' | 'pro') => {
    if (!user) { navigate('/auth?tab=signup'); return; }
    const plan = PLANS[planKey];
    if (!plan.price_id) return;
    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: { priceId: plan.price_id } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast({ title: t('common.error'), description: e.message, variant: 'destructive' });
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-5xl mx-auto">
        <Link to="/" className="text-lg font-bold text-foreground tracking-tight">
          MyTaptap
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          {user ? (
            <Button size="sm" asChild>
              <Link to="/dashboard">{t('nav.dashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?tab=signup">{t('nav.signup')}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <PricingSection checkoutLoading={checkoutLoading} onUpgrade={handleUpgrade} />

      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-1 text-muted-foreground text-xs">
          {t('footer.madeWith')} <Heart className="w-3 h-3" /> {t('footer.by')}
        </div>
      </footer>
    </div>
  );
};

export default Index;
