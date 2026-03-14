import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TapCheck as Check, TapLoader as Loader2, TapArrowRight as ArrowRight, TapStar as Star } from '@/components/icons/TapIcons';

interface PricingSectionProps {
  checkoutLoading: string | null;
  onUpgrade: (planKey: 'starter' | 'pro') => void;
}

const PricingSection = ({ checkoutLoading, onUpgrade }: PricingSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.04),transparent_70%)]" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg mx-auto mb-14"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">
            {t('landing.pricingLabel')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em]">
            {t('pricing.title')}
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-card p-7 hover:shadow-lg transition-shadow duration-300"
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('pricing.free')}
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">0€</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 h-4" />
            <div className="h-px bg-border/60 my-6" />
            <ul className="space-y-3">
              {(t('pricing.freeFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-8 h-11 text-sm font-semibold border-border/60" asChild>
              <Link to="/auth?tab=signup">{t('landing.startFree')}</Link>
            </Button>
          </motion.div>

          {/* Pro — highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="rounded-2xl border-2 border-primary bg-card p-7 relative md:-mt-4 shadow-xl shadow-primary/10"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-primary text-primary-foreground px-3.5 py-1.5 rounded-full shadow-lg shadow-primary/20">
                <Star className="w-3 h-3" />
                {t('pricing.popular')}
              </span>
            </div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              {t('pricing.pro')}
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">115€</span>
              <span className="text-sm text-muted-foreground font-medium">{t('pricing.year')}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('pricing.proMonthly')}</p>
            <div className="h-px bg-primary/15 my-6" />
            <ul className="space-y-3">
              {(t('pricing.proFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-8 h-11 text-sm font-semibold group shadow-lg shadow-primary/20"
              onClick={() => onUpgrade('pro')}
              disabled={checkoutLoading === 'pro'}
            >
              {checkoutLoading === 'pro' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('pricing.upgrade')}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>

          {/* Starter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-card p-7 relative hover:shadow-lg transition-shadow duration-300"
          >
            <div className="absolute -top-3 right-5">
              <span className="text-[10px] font-bold bg-secondary text-foreground px-3 py-1 rounded-full border border-border/60">
                {t('pricing.launchBadge')}
              </span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('pricing.starter')}
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">19,99€</span>
              <span className="text-sm text-muted-foreground font-medium">{t('pricing.month')}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 h-4" />
            <div className="h-px bg-border/60 my-6" />
            <ul className="space-y-3">
              {(t('pricing.starterFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full mt-8 h-11 text-sm font-semibold border-border/60"
              onClick={() => onUpgrade('starter')}
              disabled={checkoutLoading === 'starter'}
            >
              {checkoutLoading === 'starter' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('pricing.upgradeStarter')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
