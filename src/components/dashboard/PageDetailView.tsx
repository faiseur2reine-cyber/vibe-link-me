import { useState, lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { usePageLinks } from '@/hooks/useCreatorPages';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  TapArrowLeft as ArrowLeft, TapExternalLink as ExternalLink, TapEye as Eye,
  TapLink as Link2, TapUser as User, TapPalette as Palette, TapChart as BarChart3,
  TapTrash as Trash2, TapLoader as Loader2, TapX as X, TapSettings as Settings,
  TapChevronDown as ChevronDown,
} from '@/components/icons/TapIcons';
import { Flame, Activity, ShieldCheck, QrCode, Briefcase } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Eagerly loaded
import LinksManager from '@/components/dashboard/LinksManager';
import { InlinePreview } from '@/components/dashboard/InlinePreview';

// Lazy loaded
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
  { value: 'links', icon: Link2, label: 'Liens' },
  { value: 'profile', icon: User, label: 'Profil' },
  { value: 'apparence', icon: Palette, label: 'Design' },
  { value: 'analytics', icon: BarChart3, label: 'Stats' },
  { value: 'settings', icon: Settings, label: 'Réglages' },
];

// ── Collapsible section for Settings tab ──
const SettingsSection = ({ icon: Icon, title, children, defaultOpen = false }: {
  icon: any; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-[13px] font-medium flex-1">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PageDetailView = ({ page, onBack, onUpdatePage, onDeletePage, onRefetchPages }: PageDetailViewProps) => {
  const { t } = useTranslation();
  const { subscription } = useAuth();
  const userPlan = subscription.plan || 'free';
  const { links, loading: linksLoading, addLink, updateLink, deleteLink, reorderLinks, refetch: refetchLinks } = usePageLinks(page.id);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('links');
  const [showShare, setShowShare] = useState(false);
  const [previewOverrides, setPreviewOverrides] = useState<Partial<CreatorPage>>({});
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Escape → back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showShare && !showMobilePreview && !document.querySelector('[data-state="open"]')) {
        onBack();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onBack, showShare, showMobilePreview]);

  const handleUpdate = async (updates: Partial<CreatorPage>) => {
    setPreviewOverrides(prev => ({ ...prev, ...updates }));
    const result = await onUpdatePage(page.id, updates);
    if (!result.error) await onRefetchPages();
    return result;
  };

  const handleDelete = async () => {
    const result = await onDeletePage(page.id);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success('Page supprimée');
      onBack();
    }
  };

  const status = page.status || 'draft';
  const statusConfig = {
    active: { dot: 'bg-emerald-500', label: 'Active' },
    draft: { dot: 'bg-amber-500', label: 'Draft' },
    paused: { dot: 'bg-red-500', label: 'Paused' },
  }[status] || { dot: 'bg-gray-500', label: status };

  const mergedPage = { ...page, ...previewOverrides } as CreatorPage;

  return (
    <div className="pb-20 md:pb-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="h-8 w-8 rounded-xl inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all duration-200">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted ring-2 ring-border/20 shrink-0">
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

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground leading-none truncate">{page.display_name || page.username}</h2>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                <span className="text-[9px] font-semibold text-muted-foreground">{statusConfig.label}</span>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${page.username}`);
                toast.success(t('pages.linkCopied'));
              }}
              className="text-[11px] text-muted-foreground/50 hover:text-primary mt-0.5 transition-colors cursor-pointer truncate block"
            >
              mytaptap.com/{page.username}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl" asChild>
            <a href={`/${page.username}`} target="_blank" rel="noopener noreferrer" title="Voir la page">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl" onClick={() => setShowShare(true)} title="Partager / QR">
            <QrCode className="w-3.5 h-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground/40 hover:text-destructive rounded-xl hover:bg-destructive/10 transition-all duration-200">
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

      {/* ── Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main editor area */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Desktop tab bar */}
            {!isMobile && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-0.5 border-b border-border/20">
                  {TABS.map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setActiveTab(value)}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-all duration-200 ${
                        activeTab === value
                          ? 'text-foreground'
                          : 'text-muted-foreground/50 hover:text-muted-foreground'
                      }`}
                    >
                      <Icon className={`w-3 h-3 transition-colors duration-200 ${activeTab === value ? 'text-primary' : ''}`} />
                      {label}
                      {activeTab === value && (
                        <motion.span
                          layoutId="editor-tab"
                          className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab: Links ── */}
            <TabsContent value="links" className="mt-0">
              <LinksManager
                links={links} plan={userPlan} onAdd={addLink} onUpdate={updateLink}
                onDelete={deleteLink} onReorder={reorderLinks} onRefetch={refetchLinks} pageId={page.id}
              />
            </TabsContent>

            {/* ── Tab: Profile ── */}
            <TabsContent value="profile" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-1 mb-4">
                  <h3 className="text-[13px] font-medium">{t('editors.profileTitle')}</h3>
                  <p className="text-[11px] text-muted-foreground">{t('editors.profileDesc')}</p>
                </div>
                <PageProfileEditor page={page} onUpdate={handleUpdate} onRefetch={onRefetchPages} onPreviewChange={setPreviewOverrides} />
              </Suspense>
            </TabsContent>

            {/* ── Tab: Appearance ── */}
            <TabsContent value="apparence" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <AppearanceEditor page={page} links={links} plan={userPlan} onUpdate={handleUpdate} onPreviewChange={setPreviewOverrides} />
              </Suspense>
            </TabsContent>

            {/* ── Tab: Analytics ── */}
            <TabsContent value="analytics" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <PageAnalyticsPanel pageId={page.id} links={links} />
              </Suspense>
            </TabsContent>

            {/* ── Tab: Settings (accordion) ── */}
            <TabsContent value="settings" className="mt-0">
              <Suspense fallback={<TabLoader />}>
                <div className="space-y-3">
                  <SettingsSection icon={Flame} title={t('editors.urgencyTitle')} defaultOpen>
                    <UrgencyEditor page={page} onUpdate={handleUpdate} />
                  </SettingsSection>

                  <SettingsSection icon={Activity} title={t('editors.trackingTitle')}>
                    <TrackingEditor page={page} onUpdate={handleUpdate} />
                  </SettingsSection>

                  <SettingsSection icon={ShieldCheck} title={t('editors.safePageTitle')}>
                    <SafePageEditor page={page} onUpdate={handleUpdate} />
                  </SettingsSection>

                  <SettingsSection icon={Briefcase} title={t('editors.agencyTitle')}>
                    <AgencyEditor page={page} onUpdate={handleUpdate} />
                  </SettingsSection>
                </div>
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Desktop preview ── */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-6rem)] rounded-2xl glass overflow-hidden shadow-xl shadow-black/5">
            <InlinePreview page={mergedPage} links={links} />
          </div>
        </div>
      </div>

      {/* ── Mobile: preview FAB ── */}
      {isMobile && !showMobilePreview && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setShowMobilePreview(true)}
          className="fixed bottom-[68px] right-4 z-40 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center active:scale-90 transition-transform glow-primary"
        >
          <Eye className="w-4 h-4" />
        </motion.button>
      )}

      {/* ── Mobile: preview sheet (half screen, slide-up) ── */}
      <AnimatePresence>
        {isMobile && showMobilePreview && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[60] h-[75vh] bg-background rounded-t-2xl shadow-2xl shadow-black/20 flex flex-col"
          >
            {/* Drag handle + header */}
            <div className="flex flex-col items-center pt-2 pb-1 border-b border-border/20">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/15 mb-2" />
              <div className="flex items-center justify-between w-full px-4 pb-2">
                <span className="text-[13px] font-medium">Aperçu</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`/${page.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary font-medium"
                  >
                    Ouvrir ↗
                  </a>
                  <button
                    onClick={() => setShowMobilePreview(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Preview content */}
            <div className="flex-1 overflow-hidden">
              <InlinePreview page={mergedPage} links={links} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile preview */}
      <AnimatePresence>
        {isMobile && showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobilePreview(false)}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom tab bar ── */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-border/15 safe-area-bottom">
          <div className="flex items-center justify-around h-13">
            {TABS.map(({ value, icon: Icon, label }) => {
              const isActive = activeTab === value;
              return (
                <button
                  key={value}
                  onClick={() => { setActiveTab(value); setShowMobilePreview(false); }}
                  className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[9px] font-medium leading-tight">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tab-dot"
                      className="absolute top-0.5 w-4 h-[2px] bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ── Share dialog ── */}
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
