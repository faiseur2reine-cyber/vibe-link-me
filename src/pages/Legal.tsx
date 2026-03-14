import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TapArrowLeft as ArrowLeft } from '@/components/icons/TapIcons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LanguageSelector from '@/components/LanguageSelector';

const Legal = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('legal.title')} — MyTaptap</title>
        <meta name="description" content={t('legal.metaDesc')} />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold text-lg text-foreground">MyTaptap</span>
            </Link>
            <LanguageSelector />
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">{t('legal.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('legal.lastUpdated')}</p>

          <Tabs defaultValue="legal" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="legal">{t('legal.legalNotice')}</TabsTrigger>
              <TabsTrigger value="terms">{t('legal.termsOfUse')}</TabsTrigger>
              <TabsTrigger value="privacy">{t('legal.privacyPolicy')}</TabsTrigger>
            </TabsList>

            <TabsContent value="legal" className="prose prose-sm dark:prose-invert max-w-none">
              <h2>{t('legal.legalNotice')}</h2>
              <p>{t('legal.legalEditor')}</p>
              <p>{t('legal.legalHost')}</p>
              <p>{t('legal.legalContact')}</p>
            </TabsContent>

            <TabsContent value="terms" className="prose prose-sm dark:prose-invert max-w-none">
              <h2>{t('legal.termsOfUse')}</h2>

              <h3>{t('legal.termsAcceptTitle')}</h3>
              <p>{t('legal.termsAcceptText')}</p>

              <h3>{t('legal.termsServiceTitle')}</h3>
              <p>{t('legal.termsServiceText')}</p>

              <h3>{t('legal.termsAccountTitle')}</h3>
              <p>{t('legal.termsAccountText')}</p>

              <h3>{t('legal.termsContentTitle')}</h3>
              <p>{t('legal.termsContentText')}</p>

              <h3>{t('legal.termsTerminationTitle')}</h3>
              <p>{t('legal.termsTerminationText')}</p>

              <h3>{t('legal.termsLiabilityTitle')}</h3>
              <p>{t('legal.termsLiabilityText')}</p>
            </TabsContent>

            <TabsContent value="privacy" className="prose prose-sm dark:prose-invert max-w-none">
              <h2>{t('legal.privacyPolicy')}</h2>

              <h3>{t('legal.privacyCollectTitle')}</h3>
              <p>{t('legal.privacyCollectText')}</p>

              <h3>{t('legal.privacyUseTitle')}</h3>
              <p>{t('legal.privacyUseText')}</p>

              <h3>{t('legal.privacySharingTitle')}</h3>
              <p>{t('legal.privacySharingText')}</p>

              <h3>{t('legal.privacyCookiesTitle')}</h3>
              <p>{t('legal.privacyCookiesText')}</p>

              <h3>{t('legal.privacyRightsTitle')}</h3>
              <p>{t('legal.privacyRightsText')}</p>

              <h3>{t('legal.privacyContactTitle')}</h3>
              <p>{t('legal.privacyContactText')}</p>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MyTaptap. {t('legal.allRightsReserved')}</p>
        </footer>
      </div>
    </>
  );
};

export default Legal;
