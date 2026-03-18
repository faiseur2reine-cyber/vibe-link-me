import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TapClick as MousePointerClick, TapLink as Link2, TapGrid as LayoutGrid,
  TapArrowRight as ArrowRight, TapPlus as Plus, TapDollar as DollarSign,
  TapTrending as TrendingUp, TapExternalLink as ExternalLink,
  TapZap as Zap, TapEye as Eye, TapSparkles as Sparkles,
  TapShare as Share,
} from '@/components/icons/TapIcons';
import { AlertTriangle, ImageOff, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ease = [0.16, 1, 0.3, 1] as const;

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'à l\'instant';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}j`;
  return `${Math.floor(d / 7)}sem`;
}

// ── Sparkline SVG (last 7 days) ──
const Sparkline = ({ data, color = 'currentColor' }: { data: number[]; color?: string }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 28, pad = 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
    </svg>
  );
};

// ── Simple counter (no animation overhead) ──
const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => (
  <span>{value.toLocaleString()}{suffix}</span>
);

const DashboardOverview = () => {
  const { t } = useTranslation();
  const { user, subscription } = useAuth();
  const { pages, loading: pagesLoading } = useCreatorPages();
  const { state: onboardingState, loading: onboardingLoading } = useOnboarding(user?.id);
  const pagesMeta = useMemo(() => pages.map(p => ({ id: p.id, username: p.username, display_name: p.display_name })), [pages]);
  const stats = useGlobalAnalytics(pagesMeta.map(p => p.id), pagesMeta);
  const navigate = useNavigate();

  useEffect(() => {
    if (!onboardingLoading && !onboardingState.completed && pages.length === 0) {
      navigate('/onboarding');
    }
  }, [onboardingLoading, onboardingState.completed, pages.length, navigate]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || '';

  // ── Computed ──
  const activePages = pages.filter(p => p.status === 'active').length;
  const totalRevenue = pages.reduce((sum, p) => sum + (p.revenue_monthly || 0), 0);
  const totalNet = pages.reduce((sum, p) => {
    return sum + Math.round((p.revenue_monthly || 0) * (p.revenue_commission || 20) / 100);
  }, 0);

  // Last 7 days sparkline data
  const last7 = useMemo(() => {
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = stats.dailyClicks.find(dc => dc.date === key);
      days.push(found?.clicks ?? 0);
    }
    return days;
  }, [stats.dailyClicks]);

  const last7Total = last7.reduce((a, b) => a + b, 0);
  const prev7Total = useMemo(() => {
    let sum = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = stats.dailyClicks.find(dc => dc.date === key);
      sum += found?.clicks ?? 0;
    }
    return sum;
  }, [stats.dailyClicks]);

  const clickTrend = prev7Total > 0
    ? Math.round(((last7Total - prev7Total) / prev7Total) * 100)
    : last7Total > 0 ? 100 : 0;

  // ── Alerts ──
  const alerts = useMemo(() => {
    const list: { icon: any; text: string; action?: () => void; severity: 'warn' | 'info' }[] = [];

    // Pages without avatar
    const noAvatar = pages.filter(p => !p.avatar_url);
    if (noAvatar.length > 0) {
      list.push({
        icon: ImageOff,
        text: `${noAvatar.length} page${noAvatar.length > 1 ? 's' : ''} sans avatar`,
        action: () => navigate(`/dashboard/pages?page=${noAvatar[0].id}`),
        severity: 'warn',
      });
    }

    // Pages still in draft
    const drafts = pages.filter(p => !p.status || p.status === 'draft');
    if (drafts.length > 0 && pages.length > 1) {
      list.push({
        icon: Clock,
        text: `${drafts.length} page${drafts.length > 1 ? 's' : ''} en draft`,
        action: () => navigate('/dashboard/pages'),
        severity: 'info',
      });
    }

    // Pages with 0 clicks (if there are pages with clicks for comparison)
    const zeroClicks = pages.filter(p => {
      const pc = stats.topPages.find(tp => tp.pageId === p.id);
      return (!pc || pc.clicks === 0);
    });
    if (zeroClicks.length > 0 && pages.length > zeroClicks.length) {
      list.push({
        icon: MousePointerClick,
        text: `${zeroClicks.length} page${zeroClicks.length > 1 ? 's' : ''} sans clic`,
        action: () => navigate(`/dashboard/pages?page=${zeroClicks[0].id}`),
        severity: 'info',
      });
    }

    return list;
  }, [pages, stats.topPages, navigate]);

  // ── Recently edited ──
  const recentlyEdited = useMemo(() => {
    return [...pages]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 4);
  }, [pages]);

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10 space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              {firstName ? `Bonjour, ${firstName}` : 'Bonjour'}
            </h1>
            <p className="text-[12px] text-muted-foreground/50 mt-0.5">
              {pages.length} page{pages.length !== 1 ? 's' : ''} · {stats.totalLinks} lien{stats.totalLinks !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/pages')}
            className="h-8 px-3 text-[11px] gap-1.5 rounded-xl"
          >
            <Plus className="w-3 h-3" /> Nouvelle page
          </Button>
        </motion.div>

        {/* ── KPI row ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 0.3, ease }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {/* Clics 7j */}
          <div className="p-3.5 rounded-xl glass">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Clics 7j</span>
              <Sparkline data={last7} color="hsl(var(--pop-cyan))" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{stats.loading ? '—' : <Counter value={last7Total} />}</span>
              {!stats.loading && clickTrend !== 0 && (
                <span className={`text-[10px] font-semibold tabular-nums ${clickTrend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {clickTrend > 0 ? '+' : ''}{clickTrend}%
                </span>
              )}
            </div>
          </div>

          {/* Total clics */}
          <div className="p-3.5 rounded-xl glass">
            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Total clics</span>
            <p className="text-2xl font-bold tabular-nums mt-2">{stats.loading ? '—' : <Counter value={stats.totalClicks} />}</p>
          </div>

          {/* Pages actives */}
          <div className="p-3.5 rounded-xl glass">
            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Pages actives</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold tabular-nums">{activePages}</span>
              <span className="text-[12px] text-muted-foreground/60">/ {pages.length}</span>
            </div>
          </div>

          {/* Revenue net (or liens count if no revenue) */}
          {totalRevenue > 0 ? (
            <div className="p-3.5 rounded-xl glass border border-emerald-500/10 bg-emerald-500/[0.03]">
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Net agence</span>
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-2">{totalNet.toLocaleString()}€</p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl glass">
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Liens actifs</span>
              <p className="text-2xl font-bold tabular-nums mt-2">{stats.loading ? '—' : <Counter value={stats.totalLinks} />}</p>
            </div>
          )}
        </motion.div>

        {/* ── Revenue breakdown (only if revenue > 0) ── */}
        {totalRevenue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3, ease }}
            className="flex items-center gap-6 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02]"
          >
            <div className="flex items-center gap-3 flex-1">
              <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Brut</p>
                  <p className="text-[15px] font-bold tabular-nums">{totalRevenue.toLocaleString()}€</p>
                </div>
                <div className="w-px h-6 bg-border/30" />
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Net agence</p>
                  <p className="text-[15px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{totalNet.toLocaleString()}€</p>
                </div>
                <div className="w-px h-6 bg-border/30" />
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Liens</p>
                  <p className="text-[15px] font-bold tabular-nums">{stats.totalLinks}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Alerts ── */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease }}
            className="space-y-1.5"
          >
            {alerts.map((alert, i) => {
              const Icon = alert.icon;
              return (
                <button
                  key={i}
                  onClick={alert.action}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    alert.severity === 'warn'
                      ? 'bg-amber-500/[0.06] hover:bg-amber-500/[0.1] text-amber-700 dark:text-amber-400'
                      : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="text-[12px] font-medium flex-1">{alert.text}</span>
                  <ArrowRight className="w-3 h-3 opacity-30" />
                </button>
              );
            })}
          </motion.div>
        )}

        {/* ── Stats-based upgrade nudge ── */}
        {!stats.loading && subscription.plan === 'free' && last7Total >= 20 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.3, ease }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/[0.04] border border-primary/10"
          >
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[12px] text-foreground/70 flex-1">
              <span className="font-semibold text-foreground">{last7Total} clics cette semaine.</span>
              {' '}Avec le Pro, tu pourrais tracker les referrers, ajouter des pixels et des urgency widgets.
            </p>
            <Button size="sm" variant="outline" className="h-9 rounded-lg text-[12px] font-semibold gap-1.5 shrink-0 border-primary/20 text-primary hover:bg-primary/10" asChild>
              <a href="/dashboard/settings">
                <Sparkles className="w-3 h-3" /> Upgrade
              </a>
            </Button>
          </motion.div>
        )}

        {/* ── Two columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Leaderboard — 3 col */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.3, ease }}
            className="lg:col-span-3 p-4 rounded-xl glass"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                Top pages
              </h3>
              {pages.length > 5 && (
                <button onClick={() => navigate('/dashboard/pages')} className="text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors">
                  Tout voir
                </button>
              )}
            </div>

            {pages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[12px] text-muted-foreground/60 mb-3">Aucune page créée</p>
                <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-lg" onClick={() => navigate('/dashboard/pages')}>
                  <Plus className="w-3 h-3 mr-1" /> Créer
                </Button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {stats.topPages.slice(0, 6).map((p, i) => {
                  const pageData = pages.find(pg => pg.id === p.pageId);
                  if (!pageData) return null;
                  const commission = Math.round((pageData.revenue_monthly || 0) * (pageData.revenue_commission || 20) / 100);
                  const status = pageData.status || 'draft';
                  const statusDot = status === 'active' ? 'bg-emerald-500' : status === 'paused' ? 'bg-red-500' : 'bg-amber-500';

                  return (
                    <button
                      key={p.pageId}
                      onClick={() => navigate(`/dashboard/pages?page=${p.pageId}`)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/40 transition-colors text-left group"
                    >
                      {/* Rank */}
                      <span className="text-[11px] font-bold text-muted-foreground/50 w-4 text-center tabular-nums shrink-0">{i + 1}</span>

                      {/* Avatar */}
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted/60 shrink-0">
                        {pageData.avatar_url ? (
                          <img src={pageData.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[11px] font-semibold text-muted-foreground/60">
                              {(p.displayName || p.username).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${statusDot} ring-2 ring-background`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-medium truncate block">{p.displayName || p.username}</span>
                        <span className="text-[10px] text-muted-foreground/50">@{p.username}</span>
                      </div>

                      {/* Revenue */}
                      {commission > 0 && (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 tabular-nums hidden sm:block">
                          {commission}€
                        </span>
                      )}

                      {/* Clicks */}
                      <div className="text-right shrink-0">
                        <span className="text-[12px] font-semibold tabular-nums">{p.clicks.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground/50 ml-0.5">clics</span>
                      </div>

                      <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right column — 2 col */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3, ease }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Recent activity */}
            <div className="p-4 rounded-xl glass">
              <h3 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Activité récente
              </h3>
              {recentlyEdited.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/60 py-4 text-center">Aucune activité</p>
              ) : (
                <div className="space-y-1">
                  {recentlyEdited.map(page => (
                    <button
                      key={page.id}
                      onClick={() => navigate(`/dashboard/pages?page=${page.id}`)}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-muted/50 shrink-0">
                        {page.avatar_url ? (
                          <img src={page.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[9px] font-semibold text-muted-foreground/60">
                              {(page.display_name || page.username)?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium truncate flex-1">{page.display_name || page.username}</span>
                      <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
                        {timeAgo(new Date(page.updated_at))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="p-4 rounded-xl glass">
              <h3 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-3">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                Raccourcis
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Mes pages', icon: LayoutGrid, path: '/dashboard/pages' },
                  { label: 'Analytics', icon: TrendingUp, path: '/dashboard/analytics' },
                  { label: 'Mon profil', icon: Users, path: '/dashboard/profile' },
                  { label: 'Paramètres', icon: Sparkles, path: '/dashboard/settings' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all"
                  >
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Affiliate widget ── */}
        {!stats.loading && stats.totalClicks >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease }}
            className="p-4 rounded-xl glass flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground">Gagne 20% à vie</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">Parraine un créateur et touche 20% de commission récurrente.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg text-[11px] gap-1.5 shrink-0"
              onClick={() => navigate('/dashboard/settings')}
            >
              <Share className="w-3 h-3" /> Parrainer
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default DashboardOverview;
