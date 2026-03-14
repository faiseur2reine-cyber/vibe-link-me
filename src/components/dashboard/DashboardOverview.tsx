import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TapClick as MousePointerClick, TapLink as Link2, TapGrid as LayoutGrid, TapTrending as TrendingUp,
  TapArrowRight as ArrowRight, TapPlus as Plus, TapZap as Zap, TapEye as Eye, TapDollar as DollarSign,
} from '@/components/icons/TapIcons';
import { Button } from '@/components/ui/button';

const ease = [0.16, 1, 0.3, 1] as const;

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'à l\'instant';
  if (diffMin < 60) return `il y a ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  if (diffD < 30) return `il y a ${Math.floor(diffD / 7)}sem`;
  return `il y a ${Math.floor(diffD / 30)}m`;
}

const DashboardOverview = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pages, loading: pagesLoading } = useCreatorPages();
  const { state: onboardingState, loading: onboardingLoading } = useOnboarding(user?.id);
  const stats = useGlobalAnalytics(pages.map(p => p.id));
  const navigate = useNavigate();

  useEffect(() => {
    if (!onboardingLoading && !onboardingState.completed && pages.length === 0) {
      navigate('/onboarding');
    }
  }, [onboardingLoading, onboardingState.completed, pages.length, navigate]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'there';

  // Revenue calculations
  const totalRevenue = pages.reduce((sum, p) => sum + (p.revenue_monthly || 0), 0);
  const totalNet = pages.reduce((sum, p) => {
    const rev = p.revenue_monthly || 0;
    const com = p.revenue_commission || 20;
    return sum + Math.round(rev * com / 100);
  }, 0);
  const activePages = pages.filter(p => p.status === 'active').length;

  const kpis = [
    { label: 'Total clics', value: stats.totalClicks, icon: MousePointerClick, color: 'text-pop-cyan', bg: 'bg-pop-cyan/12' },
    { label: 'Pages actives', value: activePages, icon: LayoutGrid, color: 'text-pop-lime', bg: 'bg-pop-lime/12' },
    { label: 'Liens actifs', value: stats.totalLinks, icon: Link2, color: 'text-pop-yellow', bg: 'bg-pop-yellow/12' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mb-8"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Voici un aperçu de vos performances.
          </p>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease }}
              className="flex items-center gap-4 p-4 rounded-2xl glass transition-all duration-200 hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-2xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stats.loading ? '—' : kpi.value.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Revenue summary — only shown if any revenue entered */}
        {totalRevenue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease }}
            className="flex items-center gap-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 flex items-center gap-6">
              <div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-wider">Revenue brut</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{totalRevenue.toLocaleString()} €</p>
              </div>
              <div className="w-px h-8 bg-emerald-200 dark:bg-emerald-500/20" />
              <div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-wider">Net agence</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{totalNet.toLocaleString()} €</p>
              </div>
              <div className="w-px h-8 bg-emerald-200 dark:bg-emerald-500/20" />
              <div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-wider">Pages</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{activePages}/{pages.length}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick actions + Top pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease }}
            className="p-5 rounded-2xl glass transition-all duration-200 hover:shadow-lg hover:shadow-foreground/5"
          >
            <h3 className="text-[13px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-pop-yellow" />
              Actions rapides
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard/pages')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pop-lime/12 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-pop-lime" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Créer une nouvelle page</p>
                    <p className="text-[11px] text-muted-foreground">Ajouter un link-in-bio pour un créateur</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate('/dashboard/analytics')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pop-cyan/12 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-pop-cyan" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Voir les analytics</p>
                    <p className="text-[11px] text-muted-foreground">Clics, pays, sources de trafic</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate('/dashboard/themes')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Personnaliser les thèmes</p>
                    <p className="text-[11px] text-muted-foreground">Midnight, Neon, Immersive et plus</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </motion.div>

          {/* Top pages */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease }}
            className="p-5 rounded-xl glass transition-all duration-200 hover:shadow-lg hover:shadow-black/5"
          >
            <h3 className="text-[13px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-emerald-500" />
              Vos pages
            </h3>
            {pages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">Aucune page créée</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/pages')}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Créer une page
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.topPages.slice(0, 5).map((p, i) => {
                  const pageData = pages.find(pg => pg.id === p.pageId);
                  const lastEdited = pageData?.updated_at
                    ? new Date(pageData.updated_at)
                    : null;
                  const timeAgo = lastEdited ? getTimeAgo(lastEdited) : '';

                  return (
                    <button
                      key={p.pageId}
                      onClick={() => navigate(`/dashboard/pages?page=${p.pageId}`)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[12px] font-bold text-muted-foreground shrink-0">
                        {(p.displayName || p.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">
                          {p.displayName || p.username}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          @{p.username}{timeAgo ? ` · ${timeAgo}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-semibold text-foreground tabular-nums">{p.clicks}</p>
                        <p className="text-[10px] text-muted-foreground">clics</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardOverview;
