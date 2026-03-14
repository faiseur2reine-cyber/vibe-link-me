import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Navigate, useSearchParams, useNavigate, Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import LanguageSelector from '@/components/LanguageSelector';
import { toast } from 'sonner';
import { LogOut, Plus, Loader2, Sun, Moon, Link2, Palette, Share2 } from 'lucide-react';
import PagesListView from '@/components/dashboard/PagesListView';
import PageDetailView from '@/components/dashboard/PageDetailView';
import CreatePageDialog from '@/components/dashboard/CreatePageDialog';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { DashboardTour } from '@/components/dashboard/DashboardTour';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardAnalytics from './DashboardAnalytics';
import DashboardThemes from './DashboardThemes';
import DashboardProfile from './DashboardProfile';
import DashboardSettings from './DashboardSettings';

const DashboardHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut, checkSubscription } = useAuth();
  const { pages, loading: pagesLoading, createPage, updatePage, deletePage, duplicatePage, bulkUpdatePages, refetch: refetchPages } = useCreatorPages();
  const { state: onboardingState, loading: onboardingLoading } = useOnboarding(user?.id);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription().then(() => refetchPages());
      toast.success(t('common.success'));
    }
    // Auto-select page from URL param (from overview click)
    const pageParam = searchParams.get('page');
    if (pageParam && pages.some(p => p.id === pageParam)) {
      setSelectedPageId(pageParam);
    }
  }, [searchParams, pages]);

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

  if (pagesLoading || onboardingLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div className="space-y-6">
            {/* Skeleton header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded-lg animate-pulse" />
                <div className="h-3 w-48 bg-muted/60 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-28 bg-muted rounded-lg animate-pulse" />
            </div>
            {/* Skeleton page cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-border/60 p-3.5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-24 bg-muted rounded" />
                      <div className="h-2.5 w-16 bg-muted/60 rounded" />
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-muted/40 rounded" />
                  <div className="h-2.5 w-2/3 bg-muted/30 rounded" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const selectedPage = pages.find(p => p.id === selectedPageId) || null;

  const checklistItems = [
    {
      id: 'create-page',
      label: t('checklist.createPage'),
      completed: pages.length > 0,
      icon: Link2,
    },
    {
      id: 'customize-theme',
      label: t('checklist.customizeTheme'),
      completed: pages.some(p => p.theme !== 'default'),
      icon: Palette,
    },
    {
      id: 'share-page',
      label: t('checklist.sharePage'),
      completed: false,
      icon: Share2,
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
        {selectedPage ? (
          <PageDetailView
            page={selectedPage}
            onBack={() => setSelectedPageId(null)}
            onUpdatePage={updatePage}
            onDeletePage={deletePage}
            onRefetchPages={refetchPages}
          />
        ) : (
          <div className="space-y-6">
            {checklistItems.some(item => !item.completed) && (
              <OnboardingChecklist items={checklistItems} />
            )}
            <div data-tour="pages-list">
              <PagesListView
                pages={pages}
                onSelectPage={(id) => setSelectedPageId(id)}
                onCreatePage={() => setCreateDialogOpen(true)}
                onDuplicatePage={duplicatePage}
                onDeletePage={deletePage}
                onBulkUpdate={bulkUpdatePages}
              />
            </div>
          </div>
        )}
      </main>

      <CreatePageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreatePage={createPage}
      />

      {showTour && (
        <DashboardTour
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem('dashboard_tour_completed', 'true');
          }}
        />
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    // Sync with system preference
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Apply dark class on mount and sync with system changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfileChecked(true);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (!data?.username || data.username.startsWith('user_')) {
        navigate('/set-username', { replace: true });
      } else {
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [user, navigate]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (authLoading || !profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
            <div className="flex items-center justify-between px-5 sm:px-8 h-[52px] max-w-6xl mx-auto w-full">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-2" />
                <h1 className="text-[15px] font-semibold text-foreground tracking-tight font-display">
                  MyTaptap
                </h1>
              </div>
              <div className="flex items-center gap-1">
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
          </header>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/pages" element={<DashboardHome />} />
            <Route path="/themes" element={<DashboardThemes />} />
            <Route path="/analytics" element={<DashboardAnalytics />} />
            <Route path="/profile" element={<DashboardProfile />} />
            <Route path="/settings" element={<DashboardSettings />} />
          </Routes>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
