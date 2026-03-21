import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TapGrid as LayoutGrid,
  TapArrowRight as ArrowRight, TapPlus as Plus, TapDollar as DollarSign,
  TapTrending as TrendingUp,
  TapZap as Zap, TapSparkles as Sparkles,
  TapShare as Share,
} from '@/components/icons/TapIcons';
import { AlertTriangle, ImageOff, Clock, Users, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const DashboardOverview = () => {
  const { t } = useTranslation();
  const { user, subscription } = useAuth();
  const { pages, loading: pagesLoading } = useCreatorPages();
  const navigate = useNavigate();

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || '';

  const activePages = pages.filter(p => p.status === 'active').length;
  const totalRevenue = pages.reduce((sum, p) => sum + (p.revenue_monthly || 0), 0);
  const totalNet = pages.reduce((sum, p) => {
    return sum + Math.round((p.revenue_monthly || 0) * (p.revenue_commission || 20) / 100);
  }, 0);

  const alerts = useMemo(() => {
    const list: { icon: any; text: string; action?: () => void; severity: 'warn' | 'info' }[] = [];
    const noAvatar = pages.filter(p => !p.avatar_url);
    if (noAvatar.length > 0) {
      list.push({ icon: ImageOff, text: `${noAvatar.length} page${noAvatar.length > 1 ? 's' : ''} sans avatar`, action: () => navigate(`/dashboard/pages?page=${noAvatar[0].id}`), severity: 'warn' });
    }
    const drafts = pages.filter(p => !p.status || p.status === 'draft');
    if (drafts.length > 0 && pages.length > 1) {
      list.push({ icon: Clock, text: `${drafts.length} page${drafts.length > 1 ? 's' : ''} en draft`, action: () => navigate('/dashboard/pages'), severity: 'info' });
    }
    return list;
  }, [pages, navigate]);

  const recentlyEdited = useMemo(() => {
    return [...pages].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 4);
  }, [pages]);

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              {firstName ? `Bonjour, ${firstName}` : 'Bonjour'}
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {pages.length} page{pages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/dashboard/pages')} className="h-8 px-3 text-[11px] gap-1.5 rounded-xl">
            <Plus className="w-3 h-3" /> Nouvelle page
          </Button>
        </motion.div>

        {/* KPI row */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04, duration: 0.3, ease }} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pages</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold tabular-nums text-foreground">{activePages}</span>
              <span className="text-[12px] text-muted-foreground">/ {pages.length}</span>
            </div>
          </div>
          {totalRevenue > 0 ? (
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Net agence</span>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-2">{totalNet.toLocaleString()}€</p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Plan</span>
              <p className="text-2xl font-bold tabular-nums text-foreground mt-2 capitalize">{subscription.plan}</p>
            </div>
          )}
          <button onClick={() => navigate('/dashboard/analytics')} className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-left hover:bg-primary/10 transition-colors">
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Analytics
            </span>
            <p className="text-sm font-medium text-foreground mt-2">Voir les stats →</p>
          </button>
        </motion.div>

        {/* Revenue breakdown */}
        {totalRevenue > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.3, ease }}
            className="flex items-center gap-6 p-4 rounded-xl border border-border bg-card"
          >
            <DollarSign className="w-4 h-4 text-primary shrink-0" />
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Brut</p>
                <p className="text-[15px] font-bold tabular-nums text-foreground">{totalRevenue.toLocaleString()}€</p>
              </div>
              <div className="w-px h-6 bg-border" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net</p>
                <p className="text-[15px] font-bold tabular-nums text-foreground">{totalNet.toLocaleString()}€</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3, ease }} className="space-y-1.5">
            {alerts.map((alert, i) => {
              const Icon = alert.icon;
              return (
                <button key={i} onClick={alert.action} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  alert.severity === 'warn' ? 'bg-destructive/10 hover:bg-destructive/15 text-destructive' : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="text-[12px] font-medium flex-1">{alert.text}</span>
                  <ArrowRight className="w-3 h-3 opacity-30" />
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Upgrade nudge */}
        {subscription.plan === 'free' && pages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.3, ease }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10"
          >
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[12px] text-foreground flex-1">
              Passe en <span className="font-semibold">Pro</span> pour débloquer les analytics avancés, les pixels et plus.
            </p>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-[12px] font-semibold gap-1.5 shrink-0 border-primary/20 text-primary hover:bg-primary/10" asChild>
              <a href="/dashboard/settings"><Sparkles className="w-3 h-3" /> Upgrade</a>
            </Button>
          </motion.div>
        )}

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent activity */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.3, ease }} className="lg:col-span-3 p-4 rounded-xl border border-border bg-card">
            <h3 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Activité récente
            </h3>
            {recentlyEdited.length === 0 ? (
              <p className="text-[12px] text-muted-foreground py-4 text-center">Aucune activité</p>
            ) : (
              <div className="space-y-1">
                {recentlyEdited.map(page => (
                  <button key={page.id} onClick={() => navigate(`/dashboard/pages?page=${page.id}`)}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0">
                      {page.avatar_url ? (
                        <img src={page.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[9px] font-semibold text-muted-foreground">{(page.display_name || page.username)?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium truncate flex-1 text-foreground">{page.display_name || page.username}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{timeAgo(new Date(page.updated_at))}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick links */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.3, ease }} className="lg:col-span-2 p-4 rounded-xl border border-border bg-card">
            <h3 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-3">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" /> Raccourcis
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Mes pages', icon: LayoutGrid, path: '/dashboard/pages' },
                { label: 'Analytics', icon: TrendingUp, path: '/dashboard/analytics' },
                { label: 'Mon profil', icon: Users, path: '/dashboard/profile' },
                { label: 'Paramètres', icon: Sparkles, path: '/dashboard/settings' },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Affiliate */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3, ease }}
          className="p-4 rounded-xl border border-border bg-card flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--pop-violet))] to-[hsl(var(--pop-coral))] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">Gagne 20% à vie</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Parraine un créateur et touche 20% de commission récurrente.</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] gap-1.5 shrink-0" onClick={() => navigate('/dashboard/settings')}>
            <Share className="w-3 h-3" /> Parrainer
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardOverview;
