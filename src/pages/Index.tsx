import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/lib/plans';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Instagram, Youtube, Music, Twitch, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
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
      {/* Nav — ultra clean */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-5xl mx-auto">
          <Link to="/" className="text-base font-bold text-foreground tracking-tight">
            MyTaptap
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            {user ? (
              <Button size="sm" variant="ghost" asChild className="text-sm">
                <Link to="/dashboard">{t('nav.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-sm">
                  <Link to="/auth">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild className="text-sm h-8">
                  <Link to="/auth?tab=signup">{t('nav.signup')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <HeroSection />

      {/* Social proof — minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-y border-border/50 py-5 px-4"
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <span className="font-medium">{t('landing.socialProof')}</span>
          {[
            { name: 'YouTube', icon: Youtube },
            { name: 'TikTok', icon: Music },
            { name: 'Instagram', icon: Instagram },
            { name: 'Twitch', icon: Twitch },
            { name: 'X', icon: Twitter },
          ].map(({ name, icon: Icon }) => (
            <span key={name} className="flex items-center gap-1.5 text-foreground/40 text-[11px] uppercase tracking-wider font-semibold">
              <Icon className="w-3.5 h-3.5" />
              {name}
            </span>
          ))}
        </div>
      </motion.div>

      <FeaturesSection />
      <PricingSection checkoutLoading={checkoutLoading} onUpgrade={handleUpgrade} />

      {/* CTA — with subtle background */}
      <section className="px-4 sm:px-6 py-24 sm:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-md mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('landing.ctaTitle')}</h2>
          <p className="mt-3 text-muted-foreground text-sm">{t('landing.ctaSubtitle')}</p>
          <Button size="lg" asChild className="mt-7 h-12 px-6 text-sm font-semibold group">
            <Link to="/auth?tab=signup">
              {t('landing.ctaButton')}
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer — minimal */}
      <footer className="border-t border-border/50 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} MyTaptap</span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground transition-colors">{t('nav.login')}</Link>
            <Link to="/auth?tab=signup" className="hover:text-foreground transition-colors">{t('nav.signup')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
