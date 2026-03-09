import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const HeroSection = () => {
  const { t } = useTranslation();
  const phoneRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = phoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const mockLinks = [
    { label: 'Mon portfolio', emoji: '🎨', color: 'from-violet-500 to-purple-600' },
    { label: 'YouTube', emoji: '▶️', color: 'from-red-500 to-red-600' },
    { label: 'Newsletter', emoji: '📧', color: 'from-blue-500 to-blue-600' },
    { label: '1:1 Coaching', emoji: '🚀', color: 'from-emerald-500 to-green-600' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:6rem_6rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
      </div>

      <div className="relative px-4 sm:px-6 pt-24 sm:pt-36 pb-24 sm:pb-40 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Left — Text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex-1 text-center lg:text-left max-w-xl"
          >
            {/* Badge */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                {t('landing.heroRating')}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={item}
              className="mt-8 text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-[-0.035em] leading-[1.1] text-foreground"
            >
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="mt-6 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
              <Button size="lg" asChild className="h-13 px-7 text-sm font-semibold shadow-lg shadow-primary/20 group">
                <Link to="/auth?tab=signup">
                  {t('hero.cta')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-13 px-7 text-sm border-border/60">
                <Link to="/demo">{t('hero.ctaSecondary')}</Link>
              </Button>
            </motion.div>

            {/* Trust */}
            <motion.div variants={item} className="mt-7 flex items-center gap-6 justify-center lg:justify-start text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {t('landing.freeToStart')}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {t('landing.noCardRequired')}
              </span>
            </motion.div>
          </motion.div>

          {/* Right — Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex-shrink-0"
            style={{ perspective: 1000 }}
          >
            <motion.div
              ref={phoneRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative w-[280px] sm:w-[300px]"
            >
              {/* Ambient glow */}
              <div className="absolute -inset-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />

              {/* Phone frame */}
              <div className="relative rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-foreground/[0.06] overflow-hidden ring-1 ring-foreground/[0.03]">
                {/* Status bar */}
                <div className="h-8 bg-gradient-to-b from-secondary/40 to-secondary/20 flex items-center justify-center">
                  <div className="w-20 h-[5px] rounded-full bg-foreground/10" />
                </div>

                {/* Content */}
                <div className="px-5 pt-5 pb-8 bg-gradient-to-b from-card to-card/95">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 mx-auto mb-3 flex items-center justify-center ring-[3px] ring-primary/20 ring-offset-[3px] ring-offset-card">
                    <span className="text-xl font-bold text-primary">A</span>
                  </div>
                  <div className="text-center mb-1">
                    <p className="text-sm font-bold text-foreground tracking-tight">Alex Martin</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">@alexmartin</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mb-5 leading-relaxed">
                    {t('landing.mockupBio')}
                  </p>

                  {/* Links */}
                  <div className="space-y-2.5">
                    {mockLinks.map(({ label, emoji, color }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                        className="group flex items-center gap-3 bg-secondary/50 hover:bg-secondary/80 rounded-2xl px-3.5 py-3 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-sm"
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                          <span className="text-sm">{emoji}</span>
                        </div>
                        <p className="text-[12px] font-semibold text-foreground tracking-tight">{label}</p>
                        <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Social icons */}
                  <div className="flex items-center justify-center gap-2.5 mt-5">
                    {['X', 'IG', 'YT', 'TT'].map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.05 }}
                        className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center text-[9px] font-bold text-muted-foreground"
                      >
                        {name}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                className="absolute -left-16 top-20 bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl px-4 py-3 shadow-xl shadow-foreground/5"
              >
                <p className="text-xs font-bold text-foreground">{t('landing.mockupClicks')}</p>
                <p className="text-[9px] text-muted-foreground font-medium">{t('landing.mockupClicksSub')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.15, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                className="absolute -right-14 bottom-28 bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl px-4 py-3 shadow-xl shadow-foreground/5"
              >
                <p className="text-xs font-bold text-primary">{t('landing.mockupDesign')}</p>
                <p className="text-[9px] text-muted-foreground font-medium">{t('landing.mockupDesignSub')}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
