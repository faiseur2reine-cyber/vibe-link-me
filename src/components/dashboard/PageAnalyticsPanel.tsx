import { useState } from 'react';
import { usePageAnalytics, PageLink, PageAnalyticsPeriod } from '@/hooks/useCreatorPages';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TapClick as MousePointerClick, TapTrending as TrendingUp, TapGlobe as Globe, TapMapPin as MapPin, TapLink as Link2, TapClock as Clock } from '@/components/icons/TapIcons';
import { FlaskConical, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PeriodSelector, Period } from '@/components/dashboard/PeriodSelector';

const COLORS = [
  'hsl(270, 70%, 55%)', 'hsl(330, 80%, 60%)', 'hsl(25, 95%, 58%)',
  'hsl(200, 80%, 50%)', 'hsl(150, 60%, 45%)', 'hsl(45, 90%, 50%)',
  'hsl(0, 70%, 55%)', 'hsl(280, 60%, 65%)',
];

// Two-tailed z-test for two proportions
const computeABSignificance = (clicksA: number, clicksB: number) => {
  const nA = clicksA + clicksB; // total impressions approximation not available, use clicks as proxy
  // We treat this as a binomial test: proportion of clicks going to A vs expected 50%
  const total = clicksA + clicksB;
  if (total < 10) return { pValue: 1, significant: false, confidence: 0, sampleSize: total, needMore: Math.max(0, 30 - total) };

  const pA = clicksA / total;
  const pB = clicksB / total;
  const pPool = 0.5; // null hypothesis: equal split
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / clicksA + 1 / clicksB));
  
  // Avoid division by zero
  if (se === 0) return { pValue: 1, significant: false, confidence: 0, sampleSize: total, needMore: 0 };
  
  const z = (pA - pB) / se;
  
  // Approximate p-value from z-score (two-tailed)
  const absZ = Math.abs(z);
  // Using approximation: P(Z > z) ≈ erfc(z/√2)/2
  const pValue = 2 * (1 - normalCDF(absZ));
  const confidence = Math.round((1 - pValue) * 100);
  const significant = pValue < 0.05;
  
  // Estimate samples needed for significance (rough)
  const needMore = significant ? 0 : Math.max(0, Math.ceil(30 / Math.max(0.01, Math.abs(pA - pB))) - total);
  
  return { pValue, significant, confidence, sampleSize: total, needMore };
};

// Standard normal CDF approximation (Abramowitz & Stegun)
const normalCDF = (x: number): number => {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
};

interface PageAnalyticsPanelProps {
  pageId: string;
  links: PageLink[];
}

const PageAnalyticsPanel = ({ pageId, links }: PageAnalyticsPanelProps) => {
  const { clickStats, dailyClicks, dailyViews, totalClicks, totalViews, countryStats, cityStats, referrerStats, deviceStats, browserStats, osStats, abStats, loading } = usePageAnalytics(pageId);

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Chargement...</p>;
  }

  const getClicksForLink = (linkId: string) => clickStats.find(s => s.linkId === linkId)?.totalClicks || 0;
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '—';

  const exportCSV = () => {
    const rows: string[][] = [];
    rows.push(['Section', 'Item', 'Value']);
    rows.push(['Summary', 'Total Views', String(totalViews)]);
    rows.push(['Summary', 'Total Clicks', String(totalClicks)]);
    rows.push(['Summary', 'Conversion Rate', `${conversionRate}%`]);
    links.forEach(l => rows.push(['Link', l.title, String(getClicksForLink(l.id))]));
    dailyClicks.forEach((d, i) => rows.push(['Daily', d.date, `${dailyViews[i]?.views || 0} views, ${d.clicks} clicks`]));
    countryStats.forEach(c => rows.push(['Country', c.country, String(c.clicks)]));
    cityStats.forEach(c => rows.push(['City', c.city, String(c.clicks)]));
    referrerStats.forEach(r => rows.push(['Referrer', r.referrer, String(r.clicks)]));
    deviceStats.forEach(d => rows.push(['Device', d.device, String(d.count)]));
    browserStats.forEach(b => rows.push(['Browser', b.browser, String(b.count)]));
    osStats.forEach(o => rows.push(['OS', o.os, String(o.count)]));
    abStats.forEach(a => rows.push(['A/B Variant', a.variant, String(a.clicks)]));

    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${pageId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Stats row: Views, Clicks, Conversion */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display font-semibold text-foreground">Vue d'ensemble</h4>
          {totalClicks > 0 && (
            <Button onClick={exportCSV} variant="outline" size="sm" className="h-8 text-[11px] gap-1.5">
              <Download className="w-3 h-3" /> Export CSV
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium">Vues</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{totalViews}</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-[11px] text-muted-foreground font-medium">Clics</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{totalClicks}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium">Conversion</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* Per-link stats */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-display font-semibold text-foreground">Clics par lien</h4>
        </div>
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">Aucun lien pour le moment.</p>
        )}
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-foreground">{link.title}</p>
              <p className="text-xs text-muted-foreground truncate">{link.url}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-3">
              <MousePointerClick className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{getClicksForLink(link.id)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Daily chart — Views + Clicks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-display font-semibold text-foreground">Activité (30 jours)</h4>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyClicks.map((d, i) => ({
            date: d.date,
            clicks: d.clicks,
            views: dailyViews[i]?.views || 0,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                color: 'hsl(var(--foreground))',
              }}
              labelFormatter={(v) => new Date(v).toLocaleDateString()}
            />
            <Bar dataKey="views" fill="hsl(var(--muted-foreground)/0.2)" radius={[4, 4, 0, 0]} name="Vues" />
            <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Clics" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Geo stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countries */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-display font-semibold text-foreground">Pays</h4>
          </div>
          {countryStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore de données</p>
          ) : (
            <div className="space-y-1.5">
              {countryStats.slice(0, 10).map((stat, i) => (
                <div key={stat.country} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-foreground">{stat.country}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(stat.clicks / (countryStats[0]?.clicks || 1)) * 100}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{stat.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cities */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-display font-semibold text-foreground">Villes</h4>
          </div>
          {cityStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore de données</p>
          ) : (
            <div className="space-y-1.5">
              {cityStats.slice(0, 10).map((stat, i) => (
                <div key={stat.city} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-foreground">{stat.city}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(stat.clicks / (cityStats[0]?.clicks || 1)) * 100}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{stat.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Referrers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-display font-semibold text-foreground">Sources de trafic</h4>
        </div>
        {referrerStats.length === 0 ? (
          <p className="text-sm text-muted-foreground">Pas encore de données</p>
        ) : (
          <div className="space-y-1.5">
            {referrerStats.slice(0, 10).map((stat, i) => (
              <div key={stat.referrer} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm text-foreground truncate flex-1 mr-2">{stat.referrer}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(stat.clicks / (referrerStats[0]?.clicks || 1)) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{stat.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Device / Browser / OS */}
      {(deviceStats.length > 0 || browserStats.length > 0 || osStats.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Devices */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-display font-semibold text-foreground">Appareils</h4>
            </div>
            {deviceStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données</p>
            ) : (
              <div className="space-y-1.5">
                {deviceStats.map((stat, i) => {
                  const total = deviceStats.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                  const label = stat.device === 'mobile' ? '📱 Mobile' : stat.device === 'tablet' ? '📱 Tablet' : '💻 Desktop';
                  return (
                    <div key={stat.device} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm text-foreground">{label}</span>
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
            )}
          </div>

          {/* Browsers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-display font-semibold text-foreground">Navigateurs</h4>
            </div>
            {browserStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données</p>
            ) : (
              <div className="space-y-1.5">
                {browserStats.slice(0, 6).map((stat, i) => {
                  const total = browserStats.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                  return (
                    <div key={stat.browser} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm text-foreground">{stat.browser}</span>
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
            )}
          </div>

          {/* OS */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-display font-semibold text-foreground">Systèmes</h4>
            </div>
            {osStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données</p>
            ) : (
              <div className="space-y-1.5">
                {osStats.slice(0, 6).map((stat, i) => {
                  const total = osStats.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                  return (
                    <div key={stat.os} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm text-foreground">{stat.os}</span>
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
            )}
          </div>
        </div>
      )}

      {/* A/B Test Results with Statistical Significance */}
      {abStats.length > 0 && (() => {
        const a = abStats.find(s => s.variant === 'A');
        const b = abStats.find(s => s.variant === 'B');
        const clicksA = a?.clicks || 0;
        const clicksB = b?.clicks || 0;
        const total = abStats.reduce((s, ab) => s + ab.clicks, 0);
        const stats = (clicksA > 0 && clicksB > 0) ? computeABSignificance(clicksA, clicksB) : null;
        const lift = clicksB > 0 ? Math.round(((clicksA - clicksB) / clicksB) * 100) : 0;

        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-display font-semibold text-foreground">Résultats A/B Test</h4>
            </div>

            {/* Variant cards */}
            <div className="grid grid-cols-2 gap-3">
              {abStats.map(stat => {
                const pct = total > 0 ? Math.round((stat.clicks / total) * 100) : 0;
                const isA = stat.variant === 'A';
                return (
                  <div key={stat.variant} className={`p-4 rounded-xl border ${isA ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center ${isA ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                        {stat.variant}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {isA ? 'Avec widgets' : 'Sans widgets'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.clicks}</p>
                    <p className="text-xs text-muted-foreground">{pct}% des clics</p>
                    <div className="mt-2 w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${isA ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lift */}
            {clicksB > 0 && (
              <p className={`mt-3 text-xs font-medium ${lift > 0 ? 'text-green-600' : lift < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {lift > 0 ? `↑ +${lift}%` : lift < 0 ? `↓ ${lift}%` : '='} {lift > 0 ? 'Les widgets augmentent les clics !' : lift < 0 ? 'Les widgets réduisent les clics.' : 'Pas de différence.'}
              </p>
            )}

            {/* Statistical Significance Card */}
            {stats ? (
              <div className={`mt-4 p-4 rounded-xl border ${stats.significant ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/30 border-border'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {stats.significant ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : stats.sampleSize < 30 ? (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <h5 className="text-sm font-semibold text-foreground">
                    {stats.significant ? 'Résultat statistiquement significatif ✓' : 'Test en cours…'}
                  </h5>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{stats.confidence}%</p>
                    <p className="text-[10px] text-muted-foreground">Confiance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground font-mono">
                      {stats.pValue < 0.001 ? '<0.001' : stats.pValue.toFixed(3)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">p-value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{stats.sampleSize}</p>
                    <p className="text-[10px] text-muted-foreground">Échantillon</p>
                  </div>
                </div>

                {/* Progress bar toward significance */}
                {!stats.significant && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Progression vers la significativité</span>
                      <span>{Math.min(100, Math.round(stats.confidence))}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all"
                        style={{ width: `${Math.min(100, stats.confidence)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {stats.sampleSize < 30
                        ? `Besoin d'au moins 30 clics (encore ~${stats.needMore} à collecter)`
                        : stats.needMore > 0
                          ? `Estimé ~${stats.needMore} clics supplémentaires pour atteindre p < 0.05`
                          : 'Collectez plus de données pour confirmer la tendance'}
                    </p>
                  </div>
                )}

                {stats.significant && (
                  <p className="mt-3 text-xs text-green-700 dark:text-green-400">
                    Le test est conclusif (p {'<'} 0.05). Vous pouvez désactiver le A/B test et appliquer la variante gagnante.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  En attente de clics dans les deux variantes pour calculer la significativité.
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default PageAnalyticsPanel;
