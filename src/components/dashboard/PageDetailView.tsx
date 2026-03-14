import { useState, lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { usePageLinks } from '@/hooks/useCreatorPages';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ExternalLink, Eye, Link2, User, Palette, BarChart3, Trash2, Flame, Activity, ShieldCheck, Briefcase, QrCode, Check, Loader2, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Eagerly loaded (always visible first)
import LinksManager from '@/components/dashboard/LinksManager';
import { InlinePreview } from '@/components/dashboard/InlinePreview';

// Lazy loaded (only when tab is opened)
const LinkPreview = lazy(() => import('@/components/dashboard/LinkPreview'));
const AppearanceEditor = lazy(() => import('@/components/dashboard/AppearanceEditor'));
const PageProfileEditor = lazy(() => import('@/components/dashboard/PageProfileEditor'));
const PageAnalyticsPanel = lazy(() => import('@/components/dashboard/PageAnalyticsPanel'));
const UrgencyEditor = lazy(() => import('@/components/dashboard/UrgencyEditor'));
const TrackingEditor = lazy(() => import('@/components/dashboard/TrackingEditor'));
const SafePageEditor = lazy(() => import('@/components/dashboard/SafePageEditor'));
const AgencyEditor = lazy(() => import('@/components/dashboard/AgencyEditor'));
const ShareDialog = lazy(() => import('@/components/dashboard/ShareDialog'));

const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
  </div>
);

interface PageDetailViewProps {
  page: CreatorPage;
  onBack: () => void;
  onUpdatePage: (id: string, updates: Partial<CreatorPage>) => Promise<{ error: any }>;
  onDeletePage: (id: string) => Promise<{ error: any }>;
  onRefetchPages: () => Promise<void>;
}

const TABS = [
  { value: 'links', icon: Link2, labelKey: 'tabs.links' },
  { value: 'profile', icon: User, labelKey: 'tabs.profile' },
  { value: 'apparence', icon: Palette, labelKey: 'tabs.apparence' },
  { value: 'urgency', icon: Flame, labelKey: 'tabs.urgency' },
  { value: 'tracking', icon: Activity, labelKey: 'tabs.tracking' },
  { value: 'safepage', icon: ShieldCheck, labelKey: 'tabs.safePage' },
  { value: 'agency', icon: Briefcase, labelKey: 'tabs.agency' },
  { value: 'analytics', icon: BarChart3, labelKey: 'tabs.analytics' },
];

const PageDetailView = ({ page, onBack, onUpdatePage, onDeletePage, onRefetchPages }: PageDetailViewProps) => {
  const { t } = useTranslation();
  const { links, loading: linksLoading, addLink, updateLink, deleteLink, reorderLinks, refetch: refetchLinks } = usePageLinks(page.id);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('links');
  const [showShare, setShowShare] = useState(false);
  const [showMoreNav, setShowMoreNav] = useState(false);

  // Escape → back to pages list (unless dialog/modal is open)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showShare && !document.querySelector('[data-state="open"]')) {
        onBack();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onBack, showShare]);

  const handleUpdate = async (updates: Partial<CreatorPage>) => {
    const result = await onUpdatePage(page.id, updates);
    if (!result.error) await onRefetchPages();
    return result;
  };

  const handleDelete = async () => {
    const result = await onDeletePage(page.id);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success('Page supprimée' );
      onBack();
    }
  };

  const profileLike = {
    id: page.id, user_id: page.user_id, username: page.username,
    display_name: page.display_name, bio: page.bio, avatar_url: page.avatar_url,
    cover_url: page.cover_url, theme: page.theme, plan: 'pro' as string,
    is_nsfw: page.is_nsfw, social_links: page.social_links,
  };

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="h-8 w-8 rounded-xl inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-muted ring-2 ring-border/30">
              {page.avatar_url ? (
                <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <span className="text-[11px] font-bold text-primary/70">
                    {(page.display_name || page.username)?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-none">{page.display_name || page.username}</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${page.username}`);
                  toast.success(t('pages.linkCopied'));
                }}
                className="text-[11px] text-muted-foreground/60 hover:text-primary mt-0.5 transition-colors cursor-pointer"
                title="Copier le lien"
              >
                {window.location.host}/{page.username} ↗
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1.5 text-[11px]" asChild>
            <a href={`/${page.username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" /> Voir
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-xl gap-1.5 text-[11px]"
            onClick={() => setShowShare(true)}
          >
            <QrCode className="w-3 h-3" /> Partager
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground/50 hover:text-destructive rounded-xl hover:bg-destructive/10 transition-all duration-200">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('editors.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Tous les liens et statistiques de @{page.username} seront supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Desktop tabs */}
            {!isMobile && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-0.5 border-b border-border/30">
                  {TABS.map(({ value, icon: Icon, labelKey }) => (
                    <button
                      key={value}
                      onClick={() => setActiveTab(value)}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-all duration-200 ${
                        activeTab === value
                          ? 'text-foreground'
                          : 'text-muted-foreground/60 hover:text-muted-foreground'
                      }`}
                    >
                      <Icon className={`w-3 h-3 transition-colors duration-200 ${activeTab === value ? 'text-primary' : ''}`} />
                      {t(labelKey)}
                      {activeTab === value && (
                        <motion.span
                          layoutId="active-tab"
                          className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <TabsContent value="links" className="mt-0">
              <LinksManager
                links={links} plan="pro" onAdd={addLink} onUpdate={updateLink}
                onDelete={deleteLink} onReorder={reorderLinks} onRefetch={refetchLinks} pageId={page.id}
              />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-1">
                  <h3 className="text-[13px] font-medium">{t('editors.profileTitle')}</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">{t('editors.profileDesc')}</p>
                </div>
                <PageProfileEditor page={page} onUpdate={handleUpdate} onRefetch={onRefetchPages} />
              </Suspense>
            </TabsContent>

            <TabsContent value="apparence" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <AppearanceEditor page={page} links={links} plan={profileLike.plan} onUpdate={handleUpdate} />
              </Suspense>
            </TabsContent>

            <TabsContent value="urgency" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-1">
                  <h3 className="text-[13px] font-medium">{t('editors.urgencyTitle')}</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">{t('editors.urgencyDesc')}</p>
                </div>
                <UrgencyEditor page={page} onUpdate={handleUpdate} />
              </Suspense>
            </TabsContent>

            <TabsContent value="tracking" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-1">
                  <h3 className="text-[13px] font-medium">{t('editors.trackingTitle')}</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">{t('editors.trackingDesc')}</p>
                </div>
                <TrackingEditor page={page} onUpdate={handleUpdate} />
              </Suspense>
            </TabsContent>

            <TabsContent value="safepage" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-1">
                  <h3 className="text-[13px] font-medium">{t('editors.safePageTitle')}</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">{t('editors.safePageDesc')}</p>
                </div>
                <SafePageEditor page={page} onUpdate={handleUpdate} />
              </Suspense>
            </TabsContent>

            <TabsContent value="agency" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-1">
                  <h3 className="text-[13px] font-medium">{t('editors.agencyTitle')}</h3>
                  <p className="text-[11px] text-muted-foreground mb-4">{t('editors.agencyDesc')}</p>
                </div>
                <AgencyEditor page={page} onUpdate={handleUpdate} />
              </Suspense>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <PageAnalyticsPanel pageId={page.id} links={links} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview — instant React render, no iframe */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-6rem)] rounded-xl border border-border/40 bg-card overflow-hidden">
            <InlinePreview page={page} links={links} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav — 5 primary tabs + More */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 safe-area-bottom">
          <div className="flex items-center justify-around h-12">
            {[
              { value: 'links', icon: Link2, labelKey: 'tabs.links' },
              { value: 'profile', icon: User, labelKey: 'tabs.profile' },
              { value: 'apparence', icon: Palette, labelKey: 'tabs.apparence' },
              { value: 'analytics', icon: BarChart3, labelKey: 'tabs.analytics' },
            ].map(({ value, icon: Icon, labelKey }) => (
              <button
                key={value}
                onClick={() => { setActiveTab(value); setShowMoreNav(false); }}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value && !showMoreNav ? 'text-foreground' : 'text-muted-foreground/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === value && !showMoreNav ? '' : 'opacity-60'}`} />
                <span className="text-[9px] font-medium leading-tight">{t(labelKey)}</span>
              </button>
            ))}
            {/* More button */}
            <button
              onClick={() => setShowMoreNav(!showMoreNav)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                showMoreNav || ['urgency','tracking','safepage','agency'].includes(activeTab)
                  ? 'text-foreground' : 'text-muted-foreground/60'
              }`}
            >
              <MoreHorizontal className={`w-4 h-4 ${showMoreNav ? '' : 'opacity-60'}`} />
              <span className="text-[9px] font-medium leading-tight">{t('tabs.more')}</span>
            </button>
          </div>

          {/* More drawer */}
          {showMoreNav && (
            <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-3 grid grid-cols-4 gap-1">
              {[
                { value: 'urgency', icon: Flame, labelKey: 'tabs.urgency' },
                { value: 'tracking', icon: Activity, labelKey: 'tabs.tracking' },
                { value: 'safepage', icon: ShieldCheck, labelKey: 'tabs.safePage' },
                { value: 'agency', icon: Briefcase, labelKey: 'tabs.agency' },
              ].map(({ value, icon: Icon, labelKey }) => (
                <button
                  key={value}
                  onClick={() => { setActiveTab(value); setShowMoreNav(false); }}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
                    activeTab === value ? 'text-foreground bg-accent' : 'text-muted-foreground/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{t(labelKey)}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
      )}

      {showShare && (
        <Suspense fallback={null}>
          <ShareDialog
            open={showShare}
            onOpenChange={setShowShare}
            username={page.username}
            displayName={page.display_name || page.username}
          />
        </Suspense>
      )}
    </div>
  );
};

export default PageDetailView;
