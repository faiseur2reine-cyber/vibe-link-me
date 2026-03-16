import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Navigate, useSearchParams, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import LanguageSelector from '@/components/LanguageSelector';
import { toast } from 'sonner';
import { TapLogOut as LogOut, TapPlus as Plus, TapLoader as Loader2, TapSun as Sun, TapMoon as Moon, TapLink as Link2, TapShare as Share2, TapHome as Home, TapGrid as LayoutGrid, TapChart as BarChart3, TapSettings as Settings, TapDollar as DollarSign } from '@/components/icons/TapIcons';
import RetentionModal from '@/components/dashboard/RetentionModal';
import ReferralShareModal from '@/components/dashboard/ReferralShareModal';

import { PLANS } from '@/lib/plans';
import type { PlanKey } from '@/lib/plans';

// Eagerly loaded (always visible on first dashboard load)
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import PagesListView from '@/components/dashboard/PagesListView';
import PageDetailView from '@/components/dashboard/PageDetailView';
import CreatePageDialog from '@/components/dashboard/CreatePageDialog';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { DashboardTour } from '@/components/dashboard/DashboardTour';

// Lazy loaded (heavy sub-pages, loaded on navigate)
const DashboardAnalytics = lazy(() => import('./DashboardAnalytics'));
const DashboardProfile = lazy(() => import('./DashboardProfile'));
const DashboardSettings = lazy(() => import('./DashboardSettings'));
const DashboardAffiliate = lazy(() => import('./DashboardAffiliate'));

// Preload map — trigger on hover/touch to eliminate Suspense flash
import { preloadRoute, preloadAllOnIdle } from '@/lib/preload';

// Navigation tabs — shared between bottom bar and swipe gestures
const NAV_TABS = [
  { icon: Home, label: 'Aperçu', path: '/dashboard', end: true },
  { icon: LayoutGrid, label: 'Pages', path: '/dashboard/pages' },
  { icon: BarChart3, label: 'Stats', path: '/dashboard/analytics' },
  { icon: Settings, label: 'Réglages', path: '/dashboard/settings' },
  { icon: DollarSign, label: 'Affilié', path: '/dashboard/affiliate' },
] as const;

const TAB_PATHS = NAV_TABS.map(t => t.path);

// Gradient shimmer loading — matches dashboard layout, no layout shift
const PageShimmer = () => (
  <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
    <div className="shimmer-block h-6 w-40 mb-6" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[...Array(4)].map((_, i) => <div key={i} className="shimmer-block h-20" />)}
    </div>
    <div className="shimmer-block h-48" />
  </div>
);

const DashboardHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut, checkSubscription, subscription } = useAuth();
  const { pages, loading: pagesLoading, createPage, updatePage, deletePage, duplicatePage, bulkUpdatePages, refetch: refetchPages } = useCreatorPages();
  const { state: onboardingState } = useOnboarding(user?.id);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const userPlan = (subscription?.plan || 'free') as PlanKey;
  const maxPages = PLANS[userPlan]?.maxPages ?? 1;

  const handleCreatePage = () => {
    if (maxPages !== Infinity && pages.length >= maxPages) {
      toast.error(
        maxPages === 1
          ? 'Ton plan Free est limité à 1 page. Passe en Starter ou Pro pour en créer plus.'
          : `Tu as atteint la limite de ${maxPages} pages. Passe en Pro pour des pages illimitées.`,
        { action: { label: 'Upgrade', onClick: () => navigate('/dashboard/settings') } }
      );
      return;
    }
    setCreateDialogOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription().then(() => refetchPages());
      toast.success(t('common.success'));
      setShowReferralModal(true);
      // Clean URL so refresh doesn't re-trigger
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    }
    // Auto-select page from URL param (from overview click)
    const pageParam = searchParams.get('page');
    if (pageParam && pages.some(p => p.id === pageParam)) {
      setSelectedPageId(pageParam);
    }
  }, [searchParams, pages]);

  useEffect(() => {
    // Fast path: if we already marked onboarding done, skip the DB check
    if (localStorage.getItem('onboarding_completed')) return;
    if (pagesLoading) return;
    // If user has pages, they've been through onboarding — mark done
    if (pages.length > 0) {
      localStorage.setItem('onboarding_completed', '1');
      return;
    }
    // If onboarding is completed/skipped in DB, cache it
    if (onboardingState.completed) {
      localStorage.setItem('onboarding_completed', '1');
      return;
    }
    // No pages + not completed → onboarding
    navigate('/onboarding');
  }, [pagesLoading, onboardingState.completed, pages.length, navigate]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('dashboard_tour_completed');
    if (!hasSeenTour && pages.length > 0 && !selectedPageId) {
      setShowTour(true);
    }
  }, [pages.length, selectedPageId]);

  if (pagesLoading) {
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
                onCreatePage={handleCreatePage}
                onDuplicatePage={duplicatePage}
                onDeletePage={deletePage}
                onBulkUpdate={bulkUpdatePages}
                maxPages={maxPages}
              />
            </div>
          </div>
        )}
      </main>

      <CreatePageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreatePage={createPage}
        onCreated={(pageId) => { refetchPages().then(() => setSelectedPageId(pageId)); }}
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
  const { user, loading: authLoading, signOut, checkSubscription } = useAuth();
  const rawNavigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const scrollMap = useRef(new Map<string, number>());
  const contentRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(location.pathname);
  const prevTabIdx = useRef(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [barsHidden, setBarsHidden] = useState(false);
  const lastScrollY = useRef(0);
  // Swipe gesture tracking
  const swipeRef = useRef({ x: 0, y: 0, t: 0 });
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Preload all lazy routes when browser is idle
  useEffect(() => { preloadAllOnIdle(); }, []);

  // Keyboard shortcuts: 1-6 for tabs, Home for scroll-to-top
  useEffect(() => {
    const ALL_PATHS = ['/dashboard', '/dashboard/pages', '/dashboard/analytics', '/dashboard/profile', '/dashboard/settings', '/dashboard/affiliate'];
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= ALL_PATHS.length) {
        e.preventDefault();
        navigate(ALL_PATHS[num - 1]);
      }
      if (e.key === 'Home') {
        e.preventDefault();
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  // Auto-hide header on scroll down, show on scroll up (mobile feel)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = el.scrollTop;
        const delta = y - lastScrollY.current;
        if (delta > 10 && y > 60) { setHeaderHidden(true); setBarsHidden(true); }
        else if (delta < -5 || y < 30) { setHeaderHidden(false); setBarsHidden(false); }
        lastScrollY.current = y;
        ticking = false;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Save scroll position before route change, restore after, trigger enter animation
  useEffect(() => {
    const prev = prevPathRef.current;
    if (prev !== location.pathname) {
      // Show header + tab bar on route change
      setHeaderHidden(false);
      setBarsHidden(false);
      lastScrollY.current = 0;
      // Save outgoing scroll
      if (contentRef.current) {
        scrollMap.current.set(prev, contentRef.current.scrollTop);
      }
      // Determine direction for slide animation
      const newIdx = NAV_TABS.findIndex(t => t.end ? location.pathname === t.path : location.pathname.startsWith(t.path));
      const dir = newIdx >= prevTabIdx.current ? 'right' : 'left';
      if (newIdx >= 0) prevTabIdx.current = newIdx;
      // Trigger directional enter animation
      if (routeRef.current) {
        routeRef.current.classList.remove('dash-slide-left', 'dash-slide-right', 'dash-page-enter');
        void routeRef.current.offsetWidth;
        routeRef.current.classList.add(newIdx >= 0 ? `dash-slide-${dir}` : 'dash-page-enter');
      }
      // Restore incoming scroll (after animation starts)
      requestAnimationFrame(() => {
        const saved = scrollMap.current.get(location.pathname);
        if (contentRef.current) {
          contentRef.current.scrollTop = saved || 0;
        }
      });
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  // Navigate with View Transitions API if supported + haptic feedback
  const navigate = useCallback((path: string) => {
    // Haptic feedback on mobile (Android)
    if (navigator.vibrate) try { navigator.vibrate(1); } catch {}
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => rawNavigate(path));
    } else {
      rawNavigate(path);
    }
  }, [rawNavigate]);

  // Swipe between tabs (mobile)
  const getActiveTabIdx = useCallback(() => {
    return NAV_TABS.findIndex(t => t.end ? location.pathname === t.path : location.pathname.startsWith(t.path));
  }, [location.pathname]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeRef.current.x;
    const dy = Math.abs(t.clientY - swipeRef.current.y);
    const dt = Date.now() - swipeRef.current.t;
    // Quick horizontal swipe: >60px, <100px vertical, <400ms
    if (Math.abs(dx) < 60 || dy > 100 || dt > 400) return;
    const idx = getActiveTabIdx();
    if (idx < 0) return;
    const nextIdx = dx < 0 ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < TAB_PATHS.length) {
      navigate(TAB_PATHS[nextIdx]);
    } else {
      // Edge bounce — haptic feedback when at first/last tab
      if (navigator.vibrate) try { navigator.vibrate([5, 30, 5]); } catch {}
      // Visual rubber-band
      if (routeRef.current) {
        routeRef.current.classList.add('dash-edge-bounce');
        setTimeout(() => routeRef.current?.classList.remove('dash-edge-bounce'), 300);
      }
    }
  }, [getActiveTabIdx, navigate]);

  // Handle checkout success at top level
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowReferralModal(true);
    }
  }, [searchParams]);

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

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (authLoading) {
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
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        <div ref={contentRef} className="flex-1 flex flex-col pb-16 md:pb-0 overflow-y-auto">
          {/* Header */}
          <header className={`sticky top-0 z-50 bg-background/50 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/10 transition-transform duration-300 ease-out ${headerHidden ? '-translate-y-full md:translate-y-0' : 'translate-y-0'}`}>
            <div className="flex items-center justify-between px-5 sm:px-8 h-[52px] max-w-6xl mx-auto w-full">
              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <SidebarTrigger className="-ml-2" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pop-violet via-pop-coral to-pop-yellow flex items-center justify-center shadow-md shadow-pop-violet/20 rotate-3">
                    <span className="text-[11px] font-bold text-primary-foreground tracking-tight -rotate-3">M</span>
                  </div>
                  <h1 className="text-[15px] font-bold text-foreground tracking-tight font-display">
                    MyTaptap
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <LanguageSelector />
                <button
                  onClick={toggleTheme}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={signOut}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Routes — View Transitions API handles cross-fade, no DOM destruction */}
          <div ref={routeRef} className="flex-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/pages" element={<DashboardHome />} />
              <Route path="/analytics" element={<Suspense fallback={<PageShimmer />}><DashboardAnalytics /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<PageShimmer />}><DashboardProfile /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<PageShimmer />}><DashboardSettings /></Suspense>} />
              <Route path="/affiliate" element={<Suspense fallback={<PageShimmer />}><DashboardAffiliate /></Suspense>} />
            </Routes>
          </div>

          <RetentionModal />
          <ReferralShareModal open={showReferralModal} onOpenChange={setShowReferralModal} />
        </div>

        {/* Mobile bottom tab bar */}
        <nav className={`md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-border/15 transition-transform duration-300 ease-out ${barsHidden ? 'translate-y-full' : 'translate-y-0'}`} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="relative flex items-center justify-around h-14">
            {(() => {
              const activeIdx = NAV_TABS.findIndex(t => t.end ? location.pathname === t.path : location.pathname.startsWith(t.path));
              return (
                <>
                  {/* Sliding indicator — GPU transform */}
                  {activeIdx >= 0 && (
                    <div
                      className="tab-indicator absolute top-0 h-[2.5px] bg-primary rounded-full"
                      style={{
                        width: `${100 / NAV_TABS.length * 0.4}%`,
                        left: `${(100 / NAV_TABS.length) * 0.3}%`,
                        transform: `translateX(${activeIdx * 250}%)`,
                      }}
                    />
                  )}
                  {NAV_TABS.map((tab, i) => {
                    const active = i === activeIdx;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.path}
                        onClick={() => {
                          if (active) {
                            // Tap active tab → smooth scroll to top (Instagram pattern)
                            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            setHeaderHidden(false);
                            setBarsHidden(false);
                            if (navigator.vibrate) navigator.vibrate(1);
                          } else {
                            if (navigator.vibrate) navigator.vibrate(1);
                            navigate(tab.path);
                          }
                        }}
                        onTouchStart={() => preloadRoute(tab.path)}
                        onMouseEnter={() => preloadRoute(tab.path)}
                        className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                          transition-all duration-150 active:scale-90 active:duration-75
                          ${active ? 'text-primary' : 'text-muted-foreground/50'}`}
                      >
                        {/* Active icon background pill */}
                        <div className={`absolute top-1.5 w-10 h-7 rounded-full transition-all duration-300 ${active ? 'bg-primary/10 scale-100' : 'bg-transparent scale-75 opacity-0'}`} />
                        <Icon className={`relative z-10 w-5 h-5 transition-all duration-200 ${active ? 'scale-110' : ''}`} />
                        <span className={`relative z-10 text-[9px] leading-none transition-all duration-200 ${active ? 'font-semibold' : 'font-medium'}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
