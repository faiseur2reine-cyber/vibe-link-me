import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TapClick as MousePointerClick, TapTrending as TrendingUp, TapLink as Link2, TapLoader as Loader2 } from '@/components/icons/TapIcons';
import { FileText } from 'lucide-react';

const DashboardAnalytics = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pages, loading: pagesLoading } = useCreatorPages();
  const pageIds = pages.map(p => p.id);
  const stats = useGlobalAnalytics(pageIds);

  if (pagesLoading || stats.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('dashboard.analytics')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('analytics.overview')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MousePointerClick className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.totalClicks')}</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stats.totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('analytics.pagesCreated')}</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stats.totalPages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('analytics.activeLinks')}</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stats.totalLinks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base">{t('analytics.last30Days')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {stats.dailyClicks.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyClicks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    allowDecimals={false} 
                  />
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
            ) : (
              <p className="text-center text-muted-foreground py-12">{t('analytics.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('analytics.topPages')}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topPages.length > 0 ? (
              <div className="space-y-3">
                {stats.topPages.map((page, idx) => (
                  <div key={page.pageId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-muted-foreground w-6">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {page.displayName || page.username}
                        </p>
                        <p className="text-xs text-muted-foreground">@{page.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{page.clicks}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">{t('analytics.noPages')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
