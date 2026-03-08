import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface PricingSectionProps {
  checkoutLoading: string | null;
  onUpgrade: (planKey: 'starter' | 'pro') => void;
}

const PricingSection = ({ checkoutLoading, onUpgrade }: PricingSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">{t('pricing.title')}</h2>
        <p className="mt-3 text-muted-foreground text-base sm:text-lg">{t('pricing.subtitle')}</p>
        <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-left"
          >
            <h3 className="font-display font-bold text-xl">{t('pricing.free')}</h3>
            <p className="mt-2 text-3xl sm:text-4xl font-bold">0€</p>
            <p className="text-sm text-muted-foreground mt-1">&nbsp;</p>
            <ul className="mt-6 space-y-3">
              {(t('pricing.freeFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-8 rounded-full" asChild>
              <Link to="/auth?tab=signup">{t('hero.cta')}</Link>
            </Button>
          </motion.div>

          {/* Starter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary/80 to-secondary/80 text-primary-foreground text-xs font-bold px-4 py-1.5 text-center">
              {t('pricing.launchBadge')}
            </div>
            <h3 className="font-display font-bold text-xl mt-4">{t('pricing.starter')}</h3>
            <p className="mt-2 text-3xl sm:text-4xl font-bold">19,99€<span className="text-base sm:text-lg font-normal text-muted-foreground">{t('pricing.month')}</span></p>
            <p className="text-sm text-muted-foreground mt-1">&nbsp;</p>
            <ul className="mt-6 space-y-3">
              {(t('pricing.starterFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-8 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              onClick={() => onUpgrade('starter')}
              disabled={checkoutLoading === 'starter'}
            >
              {checkoutLoading === 'starter' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('pricing.upgradeStarter')}
            </Button>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/5 p-6 sm:p-8 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold px-4 py-1.5 text-center">
              {t('pricing.launchBadge')} · {t('pricing.popular')}
            </div>
            <h3 className="font-display font-bold text-xl mt-4">{t('pricing.pro')}</h3>
            <p className="mt-2 text-3xl sm:text-4xl font-bold">115€<span className="text-base sm:text-lg font-normal text-muted-foreground">{t('pricing.year')}</span></p>
            <p className="text-sm text-muted-foreground mt-1">{t('pricing.proMonthly')}</p>
            <ul className="mt-6 space-y-3">
              {(t('pricing.proFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-8 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg"
              onClick={() => onUpgrade('pro')}
              disabled={checkoutLoading === 'pro'}
            >
              {checkoutLoading === 'pro' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('pricing.upgrade')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;