import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import { toast } from '@/hooks/use-toast';
import { LogOut, Plus, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import PagesListView from '@/components/dashboard/PagesListView';
import PageDetailView from '@/components/dashboard/PageDetailView';
import CreatePageDialog from '@/components/dashboard/CreatePageDialog';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut, checkSubscription } = useAuth();
  const { pages, loading: pagesLoading, createPage, updatePage, deletePage, duplicatePage, refetch: refetchPages } = useCreatorPages();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription().then(() => refetchPages());
      toast({ title: t('common.success'), description: '🎉' });
    }
  }, [searchParams]);

  if (authLoading || pagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const selectedPage = pages.find(p => p.id === selectedPageId) || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedPageId(null)}
            className="text-base font-bold text-foreground tracking-tight"
          >
            MyTaptap
          </button>
          <div className="flex items-center gap-1.5">
            {!selectedPageId && (
              <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="h-8 gap-1 text-sm">
                <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Nouvelle page</span>
              </Button>
            )}
            <LanguageSelector />
            <Button variant="ghost" size="sm" onClick={signOut} className="h-8 gap-1 text-sm">
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('nav.logout')}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {selectedPage ? (
          <PageDetailView
            page={selectedPage}
            onBack={() => setSelectedPageId(null)}
            onUpdatePage={updatePage}
            onDeletePage={deletePage}
            onRefetchPages={refetchPages}
          />
        ) : (
          <PagesListView
            pages={pages}
            onSelectPage={(id) => setSelectedPageId(id)}
            onCreatePage={() => setCreateDialogOpen(true)}
            onDuplicatePage={duplicatePage}
            onDeletePage={deletePage}
          />
        )}
      </main>

      <CreatePageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreatePage={createPage}
      />
    </div>
  );
};

export default Dashboard;
