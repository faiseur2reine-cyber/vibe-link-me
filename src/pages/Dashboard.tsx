import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
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

  // After checkout success, refresh subscription
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription().then(() => refetchPages());
      toast({ title: t('common.success'), description: '🎉' });
    }
  }, [searchParams]);

  if (authLoading || pagesLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const selectedPage = pages.find(p => p.id === selectedPageId) || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto border-b border-border">
        <button
          onClick={() => setSelectedPageId(null)}
          className="text-lg font-bold text-foreground tracking-tight"
        >
          MyTaptap
        </button>
        <div className="flex items-center gap-1 sm:gap-2">
          {!selectedPageId && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
              className="rounded-full gap-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouvelle page</span>
            </Button>
          )}
          <LanguageSelector />
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">{t('nav.logout')}</span>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
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
      </div>

      <CreatePageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreatePage={createPage}
      />
    </div>
  );
};

export default Dashboard;
