import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import { toast } from '@/hooks/use-toast';
import { LogOut, Plus, Loader2, Sun, Moon } from 'lucide-react';
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
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription().then(() => refetchPages());
      toast({ title: t('common.success'), description: '🎉' });
    }
  }, [searchParams]);

  if (authLoading || pagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const selectedPage = pages.find(p => p.id === selectedPageId) || null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Nav — minimal & clean */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedPageId(null)}
            className="text-base font-bold text-foreground tracking-tight hover:opacity-80 transition-opacity"
          >
            MyTaptap
          </button>
          <div className="flex items-center gap-2">
            {!selectedPageId && (
              <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="h-8 rounded-full gap-1.5 text-xs font-medium px-3">
                <Plus className="w-3.5 h-3.5" /> Nouvelle page
              </Button>
            )}
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
