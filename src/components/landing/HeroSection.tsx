import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 pt-12 sm:pt-24 pb-16 sm:pb-28 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left — Copy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
            <span className="text-xs text-muted-foreground ml-2">{t('landing.heroRating')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight text-foreground">
            {t('hero.title')}{' '}
            <span className="text-primary">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md">
            {t('hero.subtitle')}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild className="h-11 px-5 text-sm font-semibold">
              <Link to="/auth?tab=signup">
                {t('hero.cta')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 px-5 text-sm">
              <Link to="/demo">{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t('landing.freeToStart')}</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t('landing.noCardRequired')}</span>
          </div>
        </motion.div>

        {/* Right — Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-[260px] sm:w-[280px]">
            {/* Phone frame */}
            <div className="rounded-[2.5rem] border-[6px] border-foreground/10 bg-card shadow-2xl overflow-hidden">
              {/* Status bar */}
              <div className="h-6 bg-foreground/[0.03] flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-foreground/10" />
              </div>
              {/* Content */}
              <div className="px-5 pt-5 pb-6">
                <div className="w-14 h-14 rounded-full bg-primary/15 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">A</span>
                </div>
                <div className="text-center mb-1">
                  <p className="text-sm font-bold text-foreground">Alex Martin</p>
                  <p className="text-[11px] text-muted-foreground">@alexmartin</p>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mb-4">{t('landing.mockupBio')}</p>
                
                <div className="space-y-2">
                  {(t('landing.mockupLinks', { returnObjects: true }) as string[]).map((label, i) => (
                    <div
                      key={label}
                      className="h-10 rounded-lg border border-border bg-secondary/50 flex items-center justify-center text-xs font-medium text-foreground"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                  {['X', 'IG', 'YT', 'TT'].map(s => (
                    <div key={s} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground">{s}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-8 top-16 bg-card border border-border rounded-xl px-3 py-2 shadow-lg"
            >
              <p className="text-[10px] font-semibold text-foreground">{t('landing.mockupClicks')}</p>
              <p className="text-[9px] text-muted-foreground">{t('landing.mockupClicksSub')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="absolute -right-6 bottom-24 bg-card border border-border rounded-xl px-3 py-2 shadow-lg"
            >
              <p className="text-[10px] font-semibold text-primary">{t('landing.mockupDesign')}</p>
              <p className="text-[9px] text-muted-foreground">{t('landing.mockupDesignSub')}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
