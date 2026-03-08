import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link2, Palette, BarChart3, GripVertical, Globe, Smartphone, Check, Heart, Rocket } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

const featureIcons = [Link2, Palette, BarChart3, GripVertical, Globe, Smartphone];
const featureKeys = ['links', 'themes', 'analytics', 'dragDrop', 'multilingual', 'mobile'] as const;

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link to="/" className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MyTaptap
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Button variant="ghost" asChild>
            <Link to="/auth">{t('nav.login')}</Link>
          </Button>
          <Button asChild className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
            <Link to="/auth?tab=signup">{t('nav.signup')}</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-32 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
            {t('hero.title')}
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="rounded-full text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg">
              <Link to="/auth?tab=signup">{t('hero.cta')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full text-lg px-8 py-6">
              <Link to="/demo">{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>
        </motion.div>

        {/* Mock preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 mx-auto max-w-sm"
        >
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border p-8 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4" />
            <div className="h-4 w-32 bg-foreground/20 rounded-full mx-auto mb-2" />
            <div className="h-3 w-48 bg-muted-foreground/20 rounded-full mx-auto mb-8" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 mb-3 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold">{t('features.title')}</h2>
          <p className="mt-3 text-muted-foreground text-lg">{t('features.subtitle')}</p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureKeys.map((key, i) => {
              const Icon = featureIcons[i];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{t(`features.${key}`)}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{t(`features.${key}Desc`)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold">{t('pricing.title')}</h2>
          <p className="mt-3 text-muted-foreground text-lg">{t('pricing.subtitle')}</p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="rounded-2xl border border-border bg-card p-8 text-left"
            >
              <h3 className="font-display font-bold text-xl">{t('pricing.free')}</h3>
              <p className="mt-2 text-4xl font-bold">0€</p>
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
              className="rounded-2xl border border-border bg-card p-8 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary/80 to-secondary/80 text-primary-foreground text-xs font-bold px-4 py-1.5 text-center">
                {t('pricing.launchBadge')}
              </div>
              <h3 className="font-display font-bold text-xl mt-4">{t('pricing.starter')}</h3>
              <p className="mt-2 text-4xl font-bold">19,99€<span className="text-lg font-normal text-muted-foreground">{t('pricing.month')}</span></p>
              <p className="text-sm text-muted-foreground mt-1">&nbsp;</p>
              <ul className="mt-6 space-y-3">
                {(t('pricing.starterFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-8 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                {t('pricing.upgradeStarter')}
              </Button>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/5 p-8 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold px-4 py-1.5 text-center">
                {t('pricing.launchBadge')} · {t('pricing.popular')}
              </div>
              <h3 className="font-display font-bold text-xl mt-4">{t('pricing.pro')}</h3>
              <p className="mt-2 text-4xl font-bold">115€<span className="text-lg font-normal text-muted-foreground">{t('pricing.year')}</span></p>
              <p className="text-sm text-muted-foreground mt-1">≈ 9,58€/mois</p>
              <ul className="mt-6 space-y-3">
                {(t('pricing.proFeatures', { returnObjects: true }) as string[]).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-8 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg">
                {t('pricing.upgrade')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 text-muted-foreground text-sm">
          {t('footer.madeWith')} <Heart className="w-4 h-4 text-secondary fill-secondary" /> {t('footer.by')}
        </div>
      </footer>
    </div>
  );
};

export default Index;