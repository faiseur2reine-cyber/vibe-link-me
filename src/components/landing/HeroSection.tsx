import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const HeroSection = () => {
  const { t } = useTranslation();
  const phoneRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = phoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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
            style={{ perspective: 800 }}
          >
            <motion.div
              ref={phoneRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative w-[260px] sm:w-[280px] mx-auto"
            >
              {/* Glow behind phone */}
              <div className="absolute -inset-10 bg-primary/6 rounded-[3rem] blur-3xl" />
              
              {/* Phone frame */}
              <div className="relative rounded-[2.2rem] border border-border/80 bg-card shadow-2xl shadow-foreground/5 overflow-hidden">
                {/* Notch */}
                <div className="h-7 bg-secondary/30 flex items-center justify-center">
                  <div className="w-16 h-1.5 rounded-full bg-foreground/8" />
                </div>
                {/* Content */}
                <div className="px-5 pt-5 pb-7">
                  {/* Avatar with gradient ring */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-3 flex items-center justify-center ring-2 ring-primary/15 ring-offset-2 ring-offset-card">
                    <span className="text-lg font-bold text-primary">A</span>
                  </div>
                  <div className="text-center mb-1.5">
                    <p className="text-sm font-bold text-foreground tracking-tight">Alex Martin</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">@alexmartin</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mb-5 leading-relaxed">{t('landing.mockupBio')}</p>

                  {/* Links — pill cards style */}
                  <div className="space-y-2.5">
                    {[
                      { label: 'Mon portfolio', sub: 'Découvrir mes projets', iconBg: '#8B5CF6', icon: '🎨' },
                      { label: 'YouTube', sub: 'Vidéos & tutoriels', iconBg: '#FF0000', icon: <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#fff" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                      { label: 'Newsletter', sub: 'Rejoins la communauté', iconBg: '#3B82F6', icon: '📧' },
                      { label: '1:1 Coaching', sub: 'Réserve ta session', iconBg: '#10B981', icon: '🚀' },
                    ].map(({ label, sub, iconBg, icon }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.12, ease: 'easeOut' }}
                        className="group flex items-center gap-3 bg-white dark:bg-white/95 rounded-2xl px-3 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <div 
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
                          style={{ backgroundColor: iconBg }}
                        >
                          <span className="text-sm">{icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">{label}</p>
                          <p className="text-[9px] text-gray-500 leading-tight truncate">{sub}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Social icons — real SVGs */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {[
                      <svg key="x" viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                      <svg key="ig" viewBox="0 0 24 24" className="w-3 h-3"><defs><radialGradient id="ig2" r="150%" cx="30%" cy="107%"><stop offset="0" stopColor="#fdf497"/><stop offset=".05" stopColor="#fdf497"/><stop offset=".45" stopColor="#fd5949"/><stop offset=".6" stopColor="#d6249f"/><stop offset=".9" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig2)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
                      <svg key="yt" viewBox="0 0 24 24" className="w-3 h-3"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
                      <svg key="tt" viewBox="0 0 24 24" className="w-3 h-3"><path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
                    ].map((svg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.3 + i * 0.05 }}
                        className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        {svg}
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
                className="absolute -left-14 top-24 bg-card border border-border/80 rounded-xl px-3.5 py-2.5 shadow-lg shadow-foreground/5"
              >
                <p className="text-[10px] font-bold text-foreground">{t('landing.mockupClicks')}</p>
                <p className="text-[8px] text-muted-foreground">{t('landing.mockupClicksSub')}</p>
              </motion.div>

              {/* Floating badge — right */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.15, duration: 0.4 }}
                className="absolute -right-12 bottom-32 bg-card border border-border/80 rounded-xl px-3.5 py-2.5 shadow-lg shadow-foreground/5"
              >
                <p className="text-[10px] font-bold text-primary">{t('landing.mockupDesign')}</p>
                <p className="text-[8px] text-muted-foreground">{t('landing.mockupDesignSub')}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
