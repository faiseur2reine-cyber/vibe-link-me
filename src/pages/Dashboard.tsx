import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import { toast } from '@/hooks/use-toast';
import { LogOut, Plus, Loader2, Sun, Moon, Link2, Palette, Share2 } from 'lucide-react';
import PagesListView from '@/components/dashboard/PagesListView';
import PageDetailView from '@/components/dashboard/PageDetailView';
import CreatePageDialog from '@/components/dashboard/CreatePageDialog';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { DashboardTour } from '@/components/dashboard/DashboardTour';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, checkSubscription } = useAuth();
  const { pages, loading: pagesLoading, createPage, updatePage, deletePage, duplicatePage, refetch: refetchPages } = useCreatorPages();
  const { state: onboardingState, loading: onboardingLoading } = useOnboarding(user?.id);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);
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

  useEffect(() => {
    if (!onboardingLoading && !onboardingState.completed && pages.length === 0) {
      navigate('/onboarding');
    }
  }, [onboardingLoading, onboardingState.completed, pages.length, navigate]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('dashboard_tour_completed');
    if (!hasSeenTour && pages.length > 0 && !selectedPageId) {
      setShowTour(true);
    }
  }, [pages.length, selectedPageId]);

  if (authLoading || pagesLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const selectedPage = pages.find(p => p.id === selectedPageId) || null;

  const checklistItems = [
    {
      id: 'create-page',
      label: 'Créer votre première page',
      completed: pages.length > 0,
      icon: Link2,
    },
    {
      id: 'customize-theme',
      label: 'Personnaliser le thème',
      completed: pages.some(p => p.theme !== 'default'),
      icon: Palette,
    },
    {
      id: 'share-page',
      label: 'Partager votre page',
      completed: false, // À implémenter avec tracking
      icon: Share2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between px-5 sm:px-8 h-[52px] max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedPageId(null)}
            className="text-[15px] font-semibold text-foreground tracking-tight hover:opacity-70 transition-opacity font-display"
          >
            MyTaptap
          </button>
          <div className="flex items-center gap-1">
            {!selectedPageId && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                size="sm"
                className="h-[30px] rounded-lg gap-1.5 text-[11px] font-medium px-2.5 shadow-none"
              >
                <Plus className="w-3 h-3" /> Nouveau
              </Button>
            )}
            <LanguageSelector />
            <button
              onClick={toggleTheme}
              className="h-[30px] w-[30px] inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={signOut}
              className="h-[30px] w-[30px] inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
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
