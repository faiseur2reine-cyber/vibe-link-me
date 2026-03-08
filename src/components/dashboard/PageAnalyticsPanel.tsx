import { usePageAnalytics, PageLink } from '@/hooks/useCreatorPages';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { MousePointerClick, TrendingUp, Globe, MapPin, Link2 } from 'lucide-react';

const COLORS = [
  'hsl(270, 70%, 55%)', 'hsl(330, 80%, 60%)', 'hsl(25, 95%, 58%)',
  'hsl(200, 80%, 50%)', 'hsl(150, 60%, 45%)', 'hsl(45, 90%, 50%)',
  'hsl(0, 70%, 55%)', 'hsl(280, 60%, 65%)',
];

interface PageAnalyticsPanelProps {
  pageId: string;
  links: PageLink[];
}

const PageAnalyticsPanel = ({ pageId, links }: PageAnalyticsPanelProps) => {
  const { clickStats, dailyClicks, totalClicks, countryStats, cityStats, referrerStats, loading } = usePageAnalytics(pageId);

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Chargement...</p>;
  }

  const getClicksForLink = (linkId: string) => clickStats.find(s => s.linkId === linkId)?.totalClicks || 0;

  return (
    <div className="space-y-8">
      {/* Total clicks */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <MousePointerClick className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total des clics</p>
          <p className="text-3xl font-display font-bold text-foreground">{totalClicks}</p>
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

      {/* Daily chart */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-display font-semibold text-foreground">Clics (30 jours)</h4>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyClicks}>
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
            <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
    </div>
  );
};

export default PageAnalyticsPanel;
