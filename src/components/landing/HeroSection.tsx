import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } },
};

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative px-4 sm:px-6 pt-20 sm:pt-32 pb-20 sm:pb-36 max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t('landing.heroRating')}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={item}
            className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-foreground max-w-3xl"
          >
            {t('hero.title')}{' '}
            <span className="text-primary">{t('hero.titleHighlight')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="mt-5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="h-12 px-6 text-sm font-semibold group">
              <Link to="/auth?tab=signup">
                {t('hero.cta')}
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-6 text-sm">
              <Link to="/demo">{t('hero.ctaSecondary')}</Link>
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={item} className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              {t('landing.freeToStart')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              {t('landing.noCardRequired')}
            </span>
          </motion.div>

          {/* Phone mockup — centered below */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-16 relative"
          >
            <div className="relative w-[240px] sm:w-[260px] mx-auto">
              {/* Glow behind phone */}
              <div className="absolute -inset-8 bg-primary/5 rounded-[3rem] blur-2xl" />
              
              {/* Phone frame */}
              <div className="relative rounded-[2rem] border border-border bg-card shadow-2xl shadow-foreground/5 overflow-hidden">
                {/* Notch */}
                <div className="h-6 bg-secondary/50 flex items-center justify-center">
                  <div className="w-14 h-1 rounded-full bg-foreground/10" />
                </div>
                {/* Content */}
                <div className="px-5 pt-5 pb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2.5 flex items-center justify-center">
                    <span className="text-base font-bold text-primary">A</span>
                  </div>
                  <div className="text-center mb-1">
                    <p className="text-sm font-bold text-foreground">Alex Martin</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">@alexmartin</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mb-4">{t('landing.mockupBio')}</p>

                  <div className="space-y-1.5">
                    {(t('landing.mockupLinks', { returnObjects: true, defaultValue: ['Mon portfolio', 'YouTube', 'Newsletter', 'Coaching 1:1'] }) as string[]).map((label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.08 }}
                        className="h-9 rounded-lg border border-border bg-secondary/30 flex items-center justify-center text-[11px] font-medium text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        {label}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2.5 mt-3.5">
                    {['X', 'IG', 'YT', 'TT'].map((s, i) => (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.05 }}
                        className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold text-muted-foreground"
                      >
                        {s}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stat — left */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="absolute -left-12 top-20 bg-card border border-border rounded-lg px-3 py-2 shadow-lg shadow-foreground/5"
              >
                <p className="text-[10px] font-semibold text-foreground">{t('landing.mockupClicks')}</p>
                <p className="text-[8px] text-muted-foreground">{t('landing.mockupClicksSub')}</p>
              </motion.div>

              {/* Floating badge — right */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.15, duration: 0.4 }}
                className="absolute -right-10 bottom-28 bg-card border border-border rounded-lg px-3 py-2 shadow-lg shadow-foreground/5"
              >
                <p className="text-[10px] font-semibold text-primary">{t('landing.mockupDesign')}</p>
                <p className="text-[8px] text-muted-foreground">{t('landing.mockupDesignSub')}</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
