import { useTranslation } from 'react-i18next';
import ProFeatureGate from '@/components/dashboard/ProFeatureGate';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics, AnalyticsPeriod } from '@/hooks/useGlobalAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, Sector } from 'recharts';
import { useState, useCallback } from 'react';
import { TapClick as MousePointerClick, TapTrending as TrendingUp, TapGlobe as Globe, TapMapPin as MapPin, TapLink as Link2, TapLoader as Loader2 } from '@/components/icons/TapIcons';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PeriodSelector, Period } from '@/components/dashboard/PeriodSelector';

const COLORS = [
  'hsl(280, 80%, 55%)',  // pop-violet
  'hsl(12, 90%, 62%)',   // pop-coral
  'hsl(185, 85%, 50%)',  // pop-cyan
  'hsl(100, 75%, 50%)',  // pop-lime
  'hsl(45, 100%, 60%)',  // pop-yellow
  'hsl(330, 85%, 60%)',  // pop-pink
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, value, payload } = props;
  const total = props.payload && props.payload._total ? props.payload._total : value;
  const percent = Math.round((value / total) * 100);
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))', transition: 'all 0.2s ease-out' }}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 20, fontWeight: 700 }}>
        {percent}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 10 }}>
        {payload?.name}
      </text>
    </g>
  );
};

const BreakdownList = ({ items, labelKey, valueKey, max = 8 }: {
  items: Record<string, any>[];
  labelKey: string;
  valueKey: string;
  max?: number;
}) => {
  if (items.length === 0) return <p className="text-sm text-muted-foreground py-2">Pas encore de données</p>;
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
            <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{item[valueKey]}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const PercentList = ({ items, labelKey, valueKey, max = 6 }: {
  items: Record<string, any>[];
  labelKey: string;
  valueKey: string;
  max?: number;
}) => {
  if (items.length === 0) return <p className="text-sm text-muted-foreground py-2">Pas encore de données</p>;
  const total = items.reduce((s, d) => s + d[valueKey], 0);
  return (
    <div className="space-y-1.5">
      {items.slice(0, max).map((item, i) => {
        const pct = total > 0 ? Math.round((item[valueKey] / total) * 100) : 0;
        return (
          <div key={item[labelKey]} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-sm text-foreground">{item[labelKey]}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground w-10 text-right">{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DashboardAnalytics = () => {
  const { t } = useTranslation();
  const { pages, loading: pagesLoading } = useCreatorPages();
  const pageIds = pages.map(p => p.id);
  const [period, setPeriod] = useState<Period>('30d');
  const stats = useGlobalAnalytics(pageIds, undefined, period as AnalyticsPeriod);
  const [activeIndices, setActiveIndices] = useState<Record<string, number | undefined>>({});

  if (pagesLoading || stats.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const exportCSV = () => {
    const rows: string[][] = [['Section', 'Item', 'Value']];
    rows.push(['Summary', 'Total Views', String(stats.totalViews)]);
    rows.push(['Summary', 'Total Clicks', String(stats.totalClicks)]);
    rows.push(['Summary', 'Conversion', `${stats.conversionRate}%`]);
    rows.push(['Summary', 'Pages', String(stats.totalPages)]);
    rows.push(['Summary', 'Links', String(stats.totalLinks)]);
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
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-global.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{t('dashboard.analytics')}</h1>
            <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de toutes vos pages</p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector value={period} onChange={setPeriod} />
            {stats.totalClicks > 0 && (
              <Button onClick={exportCSV} variant="outline" size="sm" className="h-8 text-[11px] gap-1.5">
                <Download className="w-3 h-3" /> Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium">Vues</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.totalViews}</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-[11px] text-muted-foreground font-medium">Clics</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.totalClicks}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium">Conversion</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.conversionRate}%</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium">Pages</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.totalPages}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium">Liens</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{stats.totalLinks}</p>
          </div>
        </div>

        {/* Daily chart — Views + Clicks */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-display font-semibold text-foreground">Activité (30 jours)</h4>
          </div>
          {stats.dailyClicks.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.dailyClicks.map((d, i) => ({
                date: d.date,
                clicks: d.clicks,
                views: stats.dailyViews[i]?.views || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', color: 'hsl(var(--foreground))' }}
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                />
                <Bar dataKey="views" fill="hsl(var(--muted-foreground)/0.15)" radius={[4, 4, 0, 0]} name="Vues" />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Clics" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">Pas encore de données</p>
          )}
        </div>

        {/* Top Pages — views + clicks */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-display font-semibold text-foreground">Performance par page</h4>
          </div>
          {stats.topPages.length > 0 ? (
            <div className="space-y-2">
              {stats.topPages.map((page, idx) => {
                const cvr = page.views > 0 ? ((page.clicks / page.views) * 100).toFixed(1) : '—';
                return (
                  <div key={page.pageId} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-sm font-bold text-muted-foreground/50 w-6 shrink-0">#{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{page.displayName || page.username}</p>
                        <p className="text-xs text-muted-foreground">@{page.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Vues</p>
                        <p className="text-sm font-semibold text-foreground">{page.views}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Clics</p>
                        <p className="text-sm font-semibold text-foreground">{page.clicks}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">CVR</p>
                        <p className="text-sm font-semibold text-foreground">{cvr}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune page pour le moment</p>
          )}
        </div>

        {/* Geo — Countries + Cities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-display font-semibold text-foreground">Pays</h4>
            </div>
            <BreakdownList items={stats.countryStats} labelKey="country" valueKey="count" />
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-display font-semibold text-foreground">Villes</h4>
            </div>
            <BreakdownList items={stats.cityStats} labelKey="city" valueKey="count" />
          </div>
        </div>

        {/* Sources */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-display font-semibold text-foreground">Sources de trafic</h4>
          </div>
          <BreakdownList items={stats.referrerStats} labelKey="referrer" valueKey="count" max={10} />

        {/* Device / Browser / OS — Pie Charts */}
        <ProFeatureGate requiredPlan="starter" label="Statistiques d'appareils">
        {(stats.deviceStats.length > 0 || stats.browserStats.length > 0 || stats.osStats.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Appareils', icon: <MousePointerClick className="w-4 h-4 text-muted-foreground" />, data: stats.deviceStats.map(d => ({ name: d.device === 'mobile' ? '📱 Mobile' : d.device === 'tablet' ? '📱 Tablet' : '💻 Desktop', value: d.count })) },
              { title: 'Navigateurs', icon: <Globe className="w-4 h-4 text-muted-foreground" />, data: stats.browserStats.map(b => ({ name: b.browser, value: b.count })) },
              { title: 'Systèmes', icon: <TrendingUp className="w-4 h-4 text-muted-foreground" />, data: stats.osStats.map(o => ({ name: o.os, value: o.count })) },
            ].map(({ title, icon, data }) => (
              <div key={title} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  {icon}
                  <h4 className="font-display font-semibold text-foreground">{title}</h4>
                </div>
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      {activeIndices[title] === undefined && (
                        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 20, fontWeight: 700 }}>
                          {data.reduce((s, d) => s + d.value, 0)}
                        </text>
                      )}
                      {activeIndices[title] === undefined && (
                        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 10 }}>
                          Total
                        </text>
                      )}
                      <Pie
                        data={data.map(d => ({ ...d, _total: data.reduce((s, x) => s + x.value, 0) }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        animationBegin={0}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        startAngle={90}
                        endAngle={-270}
                        activeIndex={activeIndices[title]}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActiveIndices(prev => ({ ...prev, [title]: index }))}
                        onMouseLeave={() => setActiveIndices(prev => ({ ...prev, [title]: undefined }))}
                      >
                        {data.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} className="drop-shadow-lg" style={{ cursor: 'pointer' }} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', color: 'hsl(var(--foreground))', fontSize: 12 }}
                        formatter={(value: number) => {
                          const total = data.reduce((s, d) => s + d.value, 0);
                          return [`${value} (${Math.round((value / total) * 100)}%)`, ''];
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">Pas encore de données</p>
                )}
              </div>
            ))}
          </div>
        )}
        </ProFeatureGate>
      </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
