import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link2, Palette, BarChart3, GripVertical, Globe, Smartphone, Check, Heart, Loader2 } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/lib/plans';
import { toast } from '@/hooks/use-toast';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleUpgrade = async (planKey: 'starter' | 'pro') => {
    if (!user) {
      navigate('/auth?tab=signup');
      return;
    }
    const plan = PLANS[planKey];
    if (!plan.price_id) return;
    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.price_id },
      });
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
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-6xl mx-auto">
        <Link to="/" className="font-display text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MyTaptap
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          {user ? (
            <Button asChild className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              <Link to="/dashboard">{t('nav.dashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
              <Button asChild className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-sm sm:text-base">
                <Link to="/auth?tab=signup">{t('nav.signup')}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <PricingSection checkoutLoading={checkoutLoading} onUpgrade={handleUpgrade} />

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 text-muted-foreground text-sm">
          {t('footer.madeWith')} <Heart className="w-4 h-4 text-secondary fill-secondary" /> {t('footer.by')}
        </div>
      </footer>
    </div>
  );
};

export default Index;