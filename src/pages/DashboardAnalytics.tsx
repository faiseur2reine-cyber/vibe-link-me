import { useTranslation } from 'react-i18next';
import ProFeatureGate from '@/components/dashboard/ProFeatureGate';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics, AnalyticsPeriod, GlobalStats, HeatmapCell } from '@/hooks/useGlobalAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, Sector, LineChart, Line, AreaChart, Area } from 'recharts';
import { useState, useMemo } from 'react';
import { TapClick as MousePointerClick, TapTrending as TrendingUp, TapGlobe as Globe, TapMapPin as MapPin, TapLink as Link2, TapLoader as Loader2, TapEye as Eye } from '@/components/icons/TapIcons';
import { Download, ArrowUpRight, ArrowDownRight, Minus, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PeriodSelector, Period } from '@/components/dashboard/PeriodSelector';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--pop-coral, 12 90% 62%))',
  'hsl(var(--pop-cyan, 185 85% 50%))',
  'hsl(var(--pop-lime, 100 75% 50%))',
  'hsl(var(--pop-yellow, 45 100% 60%))',
  'hsl(var(--pop-violet, 280 80% 55%))',
];

/* ── Delta badge ── */
const DeltaBadge = ({ current, previous }: { current: number; previous: number }) => {
  if (previous === 0 && current === 0) return null;
  const delta = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
  if (delta === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground">
      <Minus className="w-2.5 h-2.5" /> 0%
    </span>
  );
  const positive = delta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {positive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
      {positive ? '+' : ''}{delta}%
    </span>
  );
};

/* ── Active pie shape ── */
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, value, payload } = props;
  const total = payload?._total || value;
  const percent = Math.round((value / total) * 100);
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 3} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))', transition: 'all 0.2s ease-out' }} />
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 20, fontWeight: 700 }}>{percent}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 10 }}>{payload?.name}</text>
    </g>
  );
};

/* ── Breakdown list ── */
const BreakdownList = ({ items, labelKey, valueKey, max = 8 }: { items: Record<string, any>[]; labelKey: string; valueKey: string; max?: number }) => {
  if (items.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">Pas encore de données</p>;
  const topVal = items[0]?.[valueKey] || 1;
  return (
    <div className="space-y-1.5">
      {items.slice(0, max).map((item, i) => (
        <div key={item[labelKey]} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <span className="text-sm text-foreground truncate flex-1 mr-2">{item[labelKey]}</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(item[valueKey] / topVal) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
            </div>
            <span className="text-xs font-semibold text-foreground w-8 text-right tabular-nums">{item[valueKey]}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Heatmap ── */
const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const ActivityHeatmap = ({ heatmap }: { heatmap: HeatmapCell[] }) => {
  const max = useMemo(() => Math.max(...heatmap.map(c => c.count), 1), [heatmap]);
  const total = useMemo(() => heatmap.reduce((s, c) => s + c.count, 0), [heatmap]);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  if (total === 0) return null;

  const getOpacity = (count: number) => count === 0 ? 0.06 : 0.15 + (count / max) * 0.85;

  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" /> Activité par heure
        </h4>
        {hoveredCell && hoveredCell.count > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {DAY_LABELS[hoveredCell.day]} {hoveredCell.hour}h — <span className="font-semibold text-foreground">{hoveredCell.count}</span> événement{hoveredCell.count > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex ml-10 mb-1">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground tabular-nums">{h % 3 === 0 ? `${h}h` : ''}</div>
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 0].map(day => (
            <div key={day} className="flex items-center gap-1 mb-0.5">
              <span className="w-9 text-[10px] text-muted-foreground text-right shrink-0 pr-1">{DAY_LABELS[day]}</span>
              <div className="flex flex-1 gap-0.5">
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = heatmap.find(c => c.day === day && c.hour === hour);
                  const count = cell?.count || 0;
                  return (
                    <div key={hour} className="flex-1 aspect-square rounded-sm cursor-default transition-transform hover:scale-125"
                      style={{ backgroundColor: `hsl(var(--primary))`, opacity: getOpacity(count) }}
                      onMouseEnter={() => setHoveredCell({ day, hour, count })} onMouseLeave={() => setHoveredCell(null)} />
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[9px] text-muted-foreground">Moins</span>
            {[0.06, 0.25, 0.5, 0.75, 1].map((op, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(var(--primary))`, opacity: op }} />
            ))}
            <span className="text-[9px] text-muted-foreground">Plus</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Comparison chart ── */
const PERIOD_LABELS: Record<string, string> = { '7d': '7 derniers jours', '30d': '30 derniers jours', '90d': '90 derniers jours' };

const PeriodComparisonChart = ({ stats, period }: { stats: GlobalStats; period: string }) => {
  const comparisonData = useMemo(() => {
    const current = stats.dailyClicks;
    const prev = stats.dailyClicksPrev;
    const currentViews = stats.dailyViews;
    const prevViews = stats.dailyViewsPrev;
    const len = Math.min(current.length, prev.length);
    return Array.from({ length: len }, (_, i) => ({
      day: i + 1,
      clicksCurrent: current[i]?.clicks || 0,
      clicksPrev: prev[i]?.clicks || 0,
      viewsCurrent: currentViews[i]?.views || 0,
      viewsPrev: prevViews[i]?.views || 0,
    }));
  }, [stats.dailyClicks, stats.dailyClicksPrev, stats.dailyViews, stats.dailyViewsPrev]);

  const label = PERIOD_LABELS[period] || period;

  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" /> Comparaison vs période précédente
        </h4>
      </div>
      <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-primary inline-block" /> {label}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-muted-foreground/30 inline-block" style={{ borderTop: '2px dashed' }} /> Précédente</span>
      </div>
      {comparisonData.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', color: 'hsl(var(--foreground))', fontSize: 12 }}
              labelFormatter={(v) => `Jour ${v}`}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = { clicksCurrent: 'Clics', clicksPrev: 'Clics (préc.)', viewsCurrent: 'Vues', viewsPrev: 'Vues (préc.)' };
                return [value, labels[name] || name];
              }} />
            <Line type="monotone" dataKey="clicksCurrent" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="clicksPrev" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeDasharray="5 5" strokeOpacity={0.3} dot={false} />
            <Line type="monotone" dataKey="viewsCurrent" stroke="hsl(var(--pop-cyan, 185 85% 50%))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="viewsPrev" stroke="hsl(var(--pop-cyan, 185 85% 50%))" strokeWidth={1.5} strokeDasharray="5 5" strokeOpacity={0.3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-muted-foreground py-12">Pas assez de données</p>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN ANALYTICS PAGE
   ══════════════════════════════════════════════════════════ */
const DashboardAnalytics = () => {
  const { t } = useTranslation();
  const { pages, loading: pagesLoading } = useCreatorPages();
  const pageIds = pages.map(p => p.id);
  const [period, setPeriod] = useState<Period>('30d');
  const stats = useGlobalAnalytics(pageIds, undefined, period as AnalyticsPeriod);
  const [activeIndices, setActiveIndices] = useState<Record<string, number | undefined>>({});

  if (pagesLoading || stats.loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const exportCSV = () => {
    const rows: string[][] = [['Section', 'Item', 'Value']];
    rows.push(['Summary', 'Total Views', String(stats.totalViews)]);
    rows.push(['Summary', 'Total Clicks', String(stats.totalClicks)]);
    rows.push(['Summary', 'Conversion', `${stats.conversionRate}%`]);
    stats.topPages.forEach(p => rows.push(['Page', p.displayName || p.username, `${p.views} views, ${p.clicks} clicks`]));
    stats.dailyClicks.forEach((d, i) => rows.push(['Daily', d.date, `${stats.dailyViews[i]?.views || 0} views, ${d.clicks} clicks`]));
    stats.countryStats.forEach(c => rows.push(['Country', c.country, String(c.count)]));
    stats.cityStats.forEach(c => rows.push(['City', c.city, String(c.count)]));
    stats.referrerStats.forEach(r => rows.push(['Referrer', r.referrer, String(r.count)]));
    stats.deviceStats.forEach(d => rows.push(['Device', d.device, String(d.count)]));
    stats.browserStats.forEach(b => rows.push(['Browser', b.browser, String(b.count)]));
    stats.osStats.forEach(o => rows.push(['OS', o.os, String(o.count)]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{t('dashboard.analytics')}</h1>
            <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de toutes vos pages</p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector value={period} onChange={setPeriod} />
            {stats.totalClicks > 0 && (
              <Button onClick={exportCSV} variant="outline" size="sm" className="h-8 text-[11px] gap-1.5">
                <Download className="w-3 h-3" /> CSV
              </Button>
            )}
          </div>
        </div>

        {/* ── KPI Cards with deltas ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Vues */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1"><Eye className="w-3 h-3" /> Vues</p>
              {period !== 'all' && <DeltaBadge current={stats.totalViews} previous={stats.previousPeriod.totalViews} />}
            </div>
            <p className="text-2xl font-display font-bold text-foreground tabular-nums">{stats.totalViews.toLocaleString()}</p>
          </div>
          {/* Clics */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-primary font-medium flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> Clics</p>
              {period !== 'all' && <DeltaBadge current={stats.totalClicks} previous={stats.previousPeriod.totalClicks} />}
            </div>
            <p className="text-2xl font-display font-bold text-foreground tabular-nums">{stats.totalClicks.toLocaleString()}</p>
          </div>
          {/* CVR */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-muted-foreground font-medium">Conversion</p>
            </div>
            <p className="text-2xl font-display font-bold text-foreground tabular-nums">{stats.conversionRate}%</p>
          </div>
          {/* Pages */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">Pages</p>
            <p className="text-2xl font-display font-bold text-foreground tabular-nums">{stats.totalPages}</p>
          </div>
          {/* Liens */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">Liens</p>
            <p className="text-2xl font-display font-bold text-foreground tabular-nums">{stats.totalLinks}</p>
          </div>
        </div>

        {/* ── Daily chart ── */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" /> Activité ({period === 'all' ? 'tout' : period.replace('d', 'j')})
          </h4>
          {stats.dailyClicks.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.dailyClicks.map((d, i) => ({ date: d.date, clicks: d.clicks, views: stats.dailyViews[i]?.views || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', color: 'hsl(var(--foreground))' }}
                  labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                <Bar dataKey="views" fill="hsl(var(--muted-foreground) / 0.15)" radius={[4, 4, 0, 0]} name="Vues" />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Clics" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">Pas encore de données</p>
          )}
        </div>

        {/* ── Comparison chart ── */}
        {period !== 'all' && stats.dailyClicksPrev.length > 0 && (
          <PeriodComparisonChart stats={stats} period={period} />
        )}

        {/* ── Heatmap ── */}
        <ActivityHeatmap heatmap={stats.heatmap} />

        {/* ── Top Pages ── */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-muted-foreground" /> Performance par page
          </h4>
          {stats.topPages.length > 0 ? (
            <div className="space-y-2">
              {stats.topPages.map((page, idx) => {
                const cvr = page.views > 0 ? ((page.clicks / page.views) * 100).toFixed(1) : '—';
                return (
                  <div key={page.pageId} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-sm font-bold text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{page.displayName || page.username}</p>
                        <p className="text-xs text-muted-foreground">@{page.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Vues</p>
                        <p className="text-sm font-semibold text-foreground tabular-nums">{page.views}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Clics</p>
                        <p className="text-sm font-semibold text-foreground tabular-nums">{page.clicks}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">CVR</p>
                        <p className="text-sm font-semibold text-foreground tabular-nums">{cvr}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune page</p>
          )}
        </div>

        {/* ── Geo ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-border bg-card">
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" /> Pays
            </h4>
            <BreakdownList items={stats.countryStats} labelKey="country" valueKey="count" />
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" /> Villes
            </h4>
            <BreakdownList items={stats.cityStats} labelKey="city" valueKey="count" />
          </div>
        </div>

        {/* ── Sources ── */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-muted-foreground" /> Sources de trafic
          </h4>
          <BreakdownList items={stats.referrerStats} labelKey="referrer" valueKey="count" max={10} />
        </div>

        {/* ── Device / Browser / OS Pie Charts ── */}
        <ProFeatureGate requiredPlan="starter" label="Statistiques d'appareils">
          {(stats.deviceStats.length > 0 || stats.browserStats.length > 0 || stats.osStats.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Appareils', icon: <Smartphone className="w-4 h-4 text-muted-foreground" />, data: stats.deviceStats.map(d => ({ name: d.device === 'mobile' ? '📱 Mobile' : d.device === 'tablet' ? '📱 Tablet' : '💻 Desktop', value: d.count })) },
                { title: 'Navigateurs', icon: <Globe className="w-4 h-4 text-muted-foreground" />, data: stats.browserStats.map(b => ({ name: b.browser, value: b.count })) },
                { title: 'Systèmes', icon: <Monitor className="w-4 h-4 text-muted-foreground" />, data: stats.osStats.map(o => ({ name: o.os, value: o.count })) },
              ].map(({ title, icon, data }) => (
                <div key={title} className="p-5 rounded-xl border border-border bg-card">
                  <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">{icon} {title}</h4>
                  {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        {activeIndices[title] === undefined && (
                          <>
                            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 20, fontWeight: 700 }}>{data.reduce((s, d) => s + d.value, 0)}</text>
                            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 10 }}>Total</text>
                          </>
                        )}
                        <Pie data={data.map(d => ({ ...d, _total: data.reduce((s, x) => s + x.value, 0) }))}
                          cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none"
                          animationBegin={0} animationDuration={1200} animationEasing="ease-out" startAngle={90} endAngle={-270}
                          activeIndex={activeIndices[title]} activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActiveIndices(prev => ({ ...prev, [title]: index }))}
                          onMouseLeave={() => setActiveIndices(prev => ({ ...prev, [title]: undefined }))}>
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ cursor: 'pointer' }} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', color: 'hsl(var(--foreground))', fontSize: 12 }}
                          formatter={(value: number) => { const total = data.reduce((s, d) => s + d.value, 0); return [`${value} (${Math.round((value / total) * 100)}%)`, '']; }} />
                        <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">Pas de données</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ProFeatureGate>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
