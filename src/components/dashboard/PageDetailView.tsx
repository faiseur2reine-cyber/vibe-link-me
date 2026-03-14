import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { usePageLinks } from '@/hooks/useCreatorPages';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LinksManager from '@/components/dashboard/LinksManager';
import LinkPreview from '@/components/dashboard/LinkPreview';
import ThemeSelector from '@/components/dashboard/ThemeSelector';
import PageProfileEditor from '@/components/dashboard/PageProfileEditor';
import PageAnalyticsPanel from '@/components/dashboard/PageAnalyticsPanel';
import PageDesignEditor from '@/components/dashboard/PageDesignEditor';
import UrgencyEditor from '@/components/dashboard/UrgencyEditor';
import TrackingEditor from '@/components/dashboard/TrackingEditor';
import SafePageEditor from '@/components/dashboard/SafePageEditor';
import { LivePreview } from '@/components/dashboard/LivePreview';
import { ArrowLeft, ExternalLink, Eye, Link2, User, Palette, BarChart3, Trash2, Paintbrush, Flame, Activity, ShieldCheck } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  { value: 'design', icon: Paintbrush, label: 'Design' },
  { value: 'urgency', icon: Flame, label: 'Urgence' },
  { value: 'tracking', icon: Activity, label: 'Tracking' },
  { value: 'safepage', icon: ShieldCheck, label: 'Safe Page' },
  { value: 'theme', icon: Palette, label: 'Thème' },
  { value: 'analytics', icon: BarChart3, label: 'Stats' },
];

const PageDetailView = ({ page, onBack, onUpdatePage, onDeletePage, onRefetchPages }: PageDetailViewProps) => {
  const { t } = useTranslation();
  const { links, loading: linksLoading, addLink, updateLink, deleteLink, reorderLinks, refetch: refetchLinks } = usePageLinks(page.id);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('links');

  const handleUpdate = async (updates: Partial<CreatorPage>) => {
    const result = await onUpdatePage(page.id, updates);
    if (!result.error) await onRefetchPages();
    return result;
  };

  const handleDelete = async () => {
    const result = await onDeletePage(page.id);
    if (result.error) {
      toast({ title: result.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Page supprimée' });
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
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="h-7 w-7 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-muted">
              {page.avatar_url ? (
                <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {(page.display_name || page.username)?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground leading-none">{page.display_name || page.username}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">@{page.username}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 rounded-lg gap-1 text-[11px] border-border/60 shadow-none" asChild>
            <a href={`/${page.username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" /> Voir
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="h-7 w-7 inline-flex items-center justify-center text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette page ?</AlertDialogTitle>
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
                <div className="inline-flex items-center gap-0.5 border-b border-border/60">
                  {TABS.map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setActiveTab(value)}
                      className={`relative flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors ${
                        activeTab === value
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                      {activeTab === value && (
                        <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-foreground rounded-full" />
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
              <div className="space-y-1">
                <h3 className="text-[13px] font-medium">Profil de la page</h3>
                <p className="text-[11px] text-muted-foreground mb-4">Informations visibles sur votre page publique.</p>
              </div>
              <PageProfileEditor page={page} onUpdate={handleUpdate} onRefetch={onRefetchPages} />
            </TabsContent>

            <TabsContent value="design" className="mt-0">
              <div className="space-y-1">
                <h3 className="text-[13px] font-medium">Design personnalisé</h3>
                <p className="text-[11px] text-muted-foreground mb-4">Couleurs, polices et mise en page.</p>
              </div>
              <PageDesignEditor page={page} links={links} onUpdate={handleUpdate} />
            </TabsContent>

            <TabsContent value="urgency" className="mt-0">
              <div className="space-y-1">
                <h3 className="text-[13px] font-medium">Widgets d'urgence</h3>
                <p className="text-[11px] text-muted-foreground mb-4">Stimulez l'engagement avec des indicateurs de rareté.</p>
              </div>
              <UrgencyEditor page={page} onUpdate={handleUpdate} />
            </TabsContent>

            <TabsContent value="theme" className="mt-0">
              <ThemeSelector profile={profileLike} onUpdate={handleUpdate as any} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <PageAnalyticsPanel pageId={page.id} links={links} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-6rem)]">
            <LivePreview page={page} links={links} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 safe-area-bottom">
          <div className="flex items-center justify-around h-12">
            {TABS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value ? 'text-foreground' : 'text-muted-foreground/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === value ? '' : 'opacity-60'}`} />
                <span className="text-[9px] font-medium leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default PageDetailView;
