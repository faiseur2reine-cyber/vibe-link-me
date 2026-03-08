import { useTranslation } from 'react-i18next';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LinkItem } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MousePointerClick, TrendingUp, Lock } from 'lucide-react';

interface AnalyticsPanelProps {
  links: LinkItem[];
  plan: string;
}

const AnalyticsPanel = ({ links, plan }: AnalyticsPanelProps) => {
  const { t } = useTranslation();
  const { clickStats, dailyClicks, totalClicks, loading } = useAnalytics();
  const isPro = plan === 'pro';

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">{t('common.loading')}</p>;
  }

  const getClicksForLink = (linkId: string) => {
    return clickStats.find(s => s.linkId === linkId)?.totalClicks || 0;
  };

  return (
    <div className="space-y-6">
      {/* Total clicks */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <MousePointerClick className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('dashboard.totalClicks')}</p>
          <p className="text-3xl font-display font-bold text-foreground">{totalClicks}</p>
        </div>
      </div>

      {/* Per-link stats */}
      <div className="space-y-2">
        <h4 className="font-display font-semibold text-foreground">{t('dashboard.links')}</h4>
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

      {/* Daily chart (Pro only) */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-display font-semibold text-foreground">{t('dashboard.analytics')}</h4>
          {!isPro && (
            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> PRO
            </span>
          )}
        </div>

        <div className={`${!isPro ? 'blur-sm pointer-events-none select-none' : ''}`}>
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

        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-medium text-muted-foreground bg-background/80 px-4 py-2 rounded-full">
              {t('pricing.upgrade')} pour voir les graphiques
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
