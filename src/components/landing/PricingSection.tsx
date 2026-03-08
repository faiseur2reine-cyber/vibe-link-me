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

  const tiers = [
    {
      key: 'free',
      name: t('pricing.free'),
      price: '0€',
      sub: '',
      features: t('pricing.freeFeatures', { returnObjects: true }) as string[],
      action: (
        <Button variant="outline" className="w-full" asChild>
          <Link to="/auth?tab=signup">{t('hero.cta')}</Link>
        </Button>
      ),
      highlight: false,
    },
    {
      key: 'starter',
      name: t('pricing.starter'),
      price: '19,99€',
      sub: t('pricing.month'),
      badge: t('pricing.launchBadge'),
      features: t('pricing.starterFeatures', { returnObjects: true }) as string[],
      action: (
        <Button className="w-full" onClick={() => onUpgrade('starter')} disabled={checkoutLoading === 'starter'}>
          {checkoutLoading === 'starter' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {t('pricing.upgradeStarter')}
        </Button>
      ),
      highlight: false,
    },
    {
      key: 'pro',
      name: t('pricing.pro'),
      price: '115€',
      sub: t('pricing.year'),
      subNote: t('pricing.proMonthly'),
      badge: t('pricing.popular'),
      features: t('pricing.proFeatures', { returnObjects: true }) as string[],
      action: (
        <Button className="w-full" onClick={() => onUpgrade('pro')} disabled={checkoutLoading === 'pro'}>
          {checkoutLoading === 'pro' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {t('pricing.upgrade')}
        </Button>
      ),
      highlight: true,
    },
  ];

  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('pricing.title')}</h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">{t('pricing.subtitle')}</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl border p-6 text-left relative ${
                tier.highlight
                  ? 'border-primary bg-primary/[0.02] shadow-sm'
                  : 'border-border bg-card'
              }`}
            >
              {tier.badge && (
                <span className={`absolute -top-3 left-4 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  tier.highlight
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground border border-border'
                }`}>
                  {tier.badge}
                </span>
              )}
              <h3 className="font-semibold text-base mt-1">{tier.name}</h3>
              <p className="mt-3">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.sub && <span className="text-sm text-muted-foreground ml-1">{tier.sub}</span>}
              </p>
              {tier.subNote && <p className="text-xs text-muted-foreground mt-0.5">{tier.subNote}</p>}
              <ul className="mt-5 space-y-2.5">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">{tier.action}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
