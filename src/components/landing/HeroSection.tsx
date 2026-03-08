import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 pt-16 sm:pt-28 pb-20 sm:pb-32 max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Nouveau : Design personnalisé par page
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground">
          {t('hero.title')}
          <br />
          <span className="text-primary">
            {t('hero.titleHighlight')}
          </span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild className="h-12 px-6 text-base">
            <Link to="/auth?tab=signup">
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
            <Link to="/demo">{t('hero.ctaSecondary')}</Link>
          </Button>
        </div>
      </motion.div>

      {/* Clean mock preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 mx-auto max-w-xs"
      >
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">M</span>
          </div>
          <div className="h-3 w-28 bg-secondary rounded mx-auto mb-1.5" />
          <div className="h-2.5 w-40 bg-secondary rounded mx-auto mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-secondary border border-border mb-2.5 last:mb-0" />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
