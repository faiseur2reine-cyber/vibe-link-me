import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '@/components/LanguageSelector';
import HeroSection from '@/components/landing/HeroSection';

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MyTaptap — Le lien en bio pour créateurs</title>
        <meta name="description" content="Créez votre page de liens en 30 secondes. Deeplinks, analytics, safe page. Gratuit." />
        <meta property="og:title" content="MyTaptap — Le lien en bio pour créateurs" />
        <meta property="og:description" content="Créez votre page de liens en 30 secondes. Deeplinks, analytics, safe page." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mytaptap.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MyTaptap — Le lien en bio pour créateurs" />
        <link rel="canonical" href="https://mytaptap.com" />
      </Helmet>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/50 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-400 flex items-center justify-center shadow-md shadow-primary/25">
              <span className="text-[11px] font-bold text-primary-foreground tracking-tight">M</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground tracking-tight">MyTaptap</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {user ? (
              <Button size="sm" variant="ghost" asChild className="text-sm font-medium">
                <Link to="/dashboard">{t('nav.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-sm font-medium">
                  <Link to="/auth">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild className="text-sm h-9 px-4 font-semibold">
                  <Link to="/auth?tab=signup">{t('nav.signup')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <HeroSection />

      {/* Footer */}
      <footer className="border-t border-border/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary-foreground">M</span>
            </div>
            <span className="text-sm font-semibold text-foreground">MyTaptap</span>
            <span className="text-[11px] text-muted-foreground/40">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
            <Link to="/legal" className="hover:text-foreground transition-colors">{t('legal.legalNotice')}</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">{t('nav.login')}</Link>
            <Link to="/auth?tab=signup" className="hover:text-foreground transition-colors font-medium text-foreground">{t('nav.signup')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
