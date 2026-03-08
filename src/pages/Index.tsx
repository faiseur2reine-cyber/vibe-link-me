import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/lib/plans';
import { toast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from '@/components/LanguageSelector';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import UrgencyWidgets from '@/components/landing/UrgencyWidgets';

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
            { name: 'YouTube', logo: <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
            { name: 'TikTok', logo: <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#000000" className="dark:fill-white" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
            { name: 'Instagram', logo: <svg viewBox="0 0 24 24" className="w-4 h-4"><defs><radialGradient id="ig" r="150%" cx="30%" cy="107%"><stop offset="0" stopColor="#fdf497"/><stop offset=".05" stopColor="#fdf497"/><stop offset=".45" stopColor="#fd5949"/><stop offset=".6" stopColor="#d6249f"/><stop offset=".9" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
            { name: 'Twitch', logo: <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#9146FF" d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg> },
            { name: 'X', logo: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5"><path fill="#000000" className="dark:fill-white" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
          ].map(({ name, logo }) => (
            <span key={name} className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-foreground/60">
              {logo}
              {name}
            </span>
          ))}
        </div>
      </motion.div>

      <FeaturesSection />
      <PricingSection checkoutLoading={checkoutLoading} onUpgrade={handleUpgrade} />

      {/* CTA — with subtle background */}
      <section className="px-4 sm:px-6 pt-16 pb-24 sm:pt-20 sm:pb-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-md mx-auto"
        >
          <UrgencyWidgets />
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
