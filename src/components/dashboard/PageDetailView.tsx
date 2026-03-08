import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { usePageLinks, usePageAnalytics } from '@/hooks/useCreatorPages';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LinksManager from '@/components/dashboard/LinksManager';
import LinkPreview from '@/components/dashboard/LinkPreview';
import ThemeSelector from '@/components/dashboard/ThemeSelector';
import PageProfileEditor from '@/components/dashboard/PageProfileEditor';
import PageAnalyticsPanel from '@/components/dashboard/PageAnalyticsPanel';
import { ArrowLeft, ExternalLink, Eye, Link2, User, Palette, BarChart3, Trash2 } from 'lucide-react';
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

const PageDetailView = ({ page, onBack, onUpdatePage, onDeletePage, onRefetchPages }: PageDetailViewProps) => {
  const { t } = useTranslation();
  const { links, loading: linksLoading, addLink, updateLink, deleteLink, reorderLinks, refetch: refetchLinks } = usePageLinks(page.id);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('links');

  const tabs = [
    { value: 'links', icon: Link2, label: 'Liens' },
    { value: 'profile', icon: User, label: 'Profil' },
    { value: 'theme', icon: Palette, label: 'Thème' },
    { value: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

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

  // Build a profile-like object for components that expect it
  const profileLike = {
    id: page.id,
    user_id: page.user_id,
    username: page.username,
    display_name: page.display_name,
    bio: page.bio,
    avatar_url: page.avatar_url,
    cover_url: page.cover_url,
    theme: page.theme,
    plan: 'pro' as string, // Creator pages don't have plan limits individually
    is_nsfw: page.is_nsfw,
    social_links: page.social_links,
  };

  return (
    <div className="pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-border">
              {page.avatar_url ? (
                <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {(page.display_name || page.username)?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground">{page.display_name || page.username}</h2>
              <p className="text-xs text-muted-foreground">@{page.username}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-1 text-xs" asChild>
            <a href={`/${page.username}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" /> Voir
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive rounded-full">
                <Trash2 className="w-4 h-4" />
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
            {!isMobile && (
              <div className="mb-6">
                <TabsList className="bg-muted rounded-full p-1 gap-1 inline-flex">
                  {tabs.map(({ value, icon: Icon, label }) => (
                    <TabsTrigger key={value} value={value} className="rounded-full gap-1.5 data-[state=active]:bg-background text-sm px-3 py-2">
                      <Icon className="w-4 h-4 shrink-0" /> {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}

            <TabsContent value="links">
              <Card>
                <CardContent className="p-4 md:p-6">
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Profil de la page</CardTitle>
                </CardHeader>
                <CardContent>
                  <PageProfileEditor page={page} onUpdate={handleUpdate} onRefetch={onRefetchPages} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <ThemeSelector profile={profileLike} onUpdate={handleUpdate as any} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <PageAnalyticsPanel pageId={page.id} links={links} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{t('dashboard.preview')}</span>
            </div>
            <LinkPreview profile={profileLike} links={links} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around h-16">
            {tabs.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === value ? 'text-primary' : ''}`} />
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
