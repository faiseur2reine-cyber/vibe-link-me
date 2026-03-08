import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight">
          {t('hero.title')}
          <br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {t('hero.titleHighlight')}
          </span>
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button size="lg" asChild className="rounded-full text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg">
            <Link to="/auth?tab=signup">{t('hero.cta')}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-full text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
            <Link to="/demo">{t('hero.ctaSecondary')}</Link>
          </Button>
        </div>
      </motion.div>

      {/* Mock preview */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-14 sm:mt-20 mx-auto max-w-sm"
      >
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border p-6 sm:p-8 shadow-2xl">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4" />
          <div className="h-4 w-32 bg-foreground/20 rounded-full mx-auto mb-2" />
          <div className="h-3 w-48 bg-muted-foreground/20 rounded-full mx-auto mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 mb-3 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;