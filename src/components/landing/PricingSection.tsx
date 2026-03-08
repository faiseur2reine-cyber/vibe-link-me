import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  checkoutLoading: string | null;
  onUpgrade: (planKey: 'starter' | 'pro') => void;
}

const PricingSection = ({ checkoutLoading, onUpgrade }: PricingSectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-20 sm:py-28 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-lg mx-auto mb-14">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Tarifs</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('pricing.title')}</h2>
          <p className="mt-3 text-muted-foreground text-sm">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('pricing.free')}</p>
            <p className="mt-4 text-3xl font-bold">0€</p>
            <p className="text-xs text-muted-foreground mt-1 h-4" />
            <ul className="mt-6 space-y-2.5">
              {(t('pricing.freeFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-6 h-10 text-sm" asChild>
              <Link to="/auth?tab=signup">Commencer</Link>
            </Button>
          </motion.div>

          {/* Pro — highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-xl border-2 border-primary bg-card p-6 relative md:-mt-2 md:mb-0 shadow-sm"
          >
            <div className="absolute -top-3 right-4">
              <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                {t('pricing.popular')}
              </span>
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">{t('pricing.pro')}</p>
            <p className="mt-4 text-3xl font-bold">115€<span className="text-sm font-normal text-muted-foreground ml-1">{t('pricing.year')}</span></p>
            <p className="text-xs text-muted-foreground mt-1">{t('pricing.proMonthly')}</p>
            <ul className="mt-6 space-y-2.5">
              {(t('pricing.proFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full mt-6 h-10 text-sm" onClick={() => onUpgrade('pro')} disabled={checkoutLoading === 'pro'}>
              {checkoutLoading === 'pro' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {t('pricing.upgrade')}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </motion.div>

          {/* Starter */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="rounded-xl border border-border bg-card p-6 relative"
          >
            <div className="absolute -top-3 right-4">
              <span className="text-[10px] font-semibold bg-secondary text-foreground px-2.5 py-1 rounded-full border border-border">
                {t('pricing.launchBadge')}
              </span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('pricing.starter')}</p>
            <p className="mt-4 text-3xl font-bold">19,99€<span className="text-sm font-normal text-muted-foreground ml-1">{t('pricing.month')}</span></p>
            <p className="text-xs text-muted-foreground mt-1 h-4" />
            <ul className="mt-6 space-y-2.5">
              {(t('pricing.starterFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-6 h-10 text-sm" onClick={() => onUpgrade('starter')} disabled={checkoutLoading === 'starter'}>
              {checkoutLoading === 'starter' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {t('pricing.upgradeStarter')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
