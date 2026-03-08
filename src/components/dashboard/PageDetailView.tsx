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
import { ArrowLeft, ExternalLink, Eye, Link2, User, Palette, BarChart3, Trash2, Paintbrush, Flame } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
    id: page.id,
    user_id: page.user_id,
    username: page.username,
    display_name: page.display_name,
    bio: page.bio,
    avatar_url: page.avatar_url,
    cover_url: page.cover_url,
    theme: page.theme,
    plan: 'pro' as string,
    is_nsfw: page.is_nsfw,
    social_links: page.social_links,
  };

  return (
    <div className="pb-24 md:pb-6">
      {/* Header — compact & clean */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border">
              {page.avatar_url ? (
                <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {(page.display_name || page.username)?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">{page.display_name || page.username}</h2>
              <p className="text-[11px] text-muted-foreground">@{page.username}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 rounded-full gap-1.5 text-xs" asChild>
            <a href={`/${page.username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" /> Voir
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Desktop tabs — clean segmented control */}
            {!isMobile && (
              <div className="mb-5">
                <TabsList className="bg-background border border-border rounded-lg p-0.5 gap-0 inline-flex h-9">
                  {TABS.map(({ value, icon: Icon, label }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="rounded-md gap-1.5 text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none font-medium transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" /> {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}

            <TabsContent value="links" className="mt-0">
              <div className="rounded-xl bg-background border border-border p-4 md:p-6">
                <LinksManager
                  links={links}
                  plan="pro"
                  onAdd={addLink}
                  onUpdate={updateLink}
                  onDelete={deleteLink}
                  onReorder={reorderLinks}
                  onRefetch={refetchLinks}
                  pageId={page.id}
                />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <div className="rounded-xl bg-background border border-border p-4 md:p-6">
                <h3 className="font-semibold text-sm mb-4">Profil de la page</h3>
                <PageProfileEditor page={page} onUpdate={handleUpdate} onRefetch={onRefetchPages} />
              </div>
            </TabsContent>

            <TabsContent value="design" className="mt-0">
              <div className="rounded-xl bg-background border border-border p-4 md:p-6">
                <h3 className="font-semibold text-sm mb-4">Design personnalisé</h3>
                <PageDesignEditor page={page} links={links} onUpdate={handleUpdate} />
              </div>
            </TabsContent>

            <TabsContent value="urgency" className="mt-0">
              <div className="rounded-xl bg-background border border-border p-4 md:p-6">
                <h3 className="font-semibold text-sm mb-4">Widgets d'urgence & rareté</h3>
                <UrgencyEditor page={page} onUpdate={handleUpdate} />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="mt-0">
              <div className="rounded-xl bg-background border border-border p-4 md:p-6">
                <ThemeSelector profile={profileLike} onUpdate={handleUpdate as any} />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="rounded-xl bg-background border border-border p-4 md:p-6">
                <PageAnalyticsPanel pageId={page.id} links={links} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{t('dashboard.preview')}</span>
            </div>
            <LinkPreview profile={profileLike} links={links} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation — cleaner */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {TABS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default PageDetailView;
