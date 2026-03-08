import { CreatorPage } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Users, MousePointerClick, Link2, TrendingUp, BarChart3, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PagesListViewProps {
  pages: CreatorPage[];
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage?: (id: string) => Promise<{ error: any; data?: any }>;
}

const PagesListView = ({ pages, onSelectPage, onCreatePage }: PagesListViewProps) => {
  const pageIds = useMemo(() => pages.map(p => p.id), [pages]);
  const globalStats = useGlobalAnalytics(pageIds);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Mes pages créateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} page{pages.length !== 1 ? 's' : ''} créée{pages.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Global Stats Summary */}
      {pages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pages</p>
                  <p className="text-xl font-display font-bold text-foreground">{globalStats.totalPages}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Liens</p>
                  <p className="text-xl font-display font-bold text-foreground">{globalStats.totalLinks}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MousePointerClick className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Clics totaux</p>
                  <p className="text-xl font-display font-bold text-foreground">{globalStats.totalClicks}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moy./page</p>
                  <p className="text-xl font-display font-bold text-foreground">
                    {globalStats.totalPages > 0 ? Math.round(globalStats.totalClicks / globalStats.totalPages) : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini chart */}
          {globalStats.totalClicks > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-display font-semibold text-sm text-foreground">Activité globale (30 jours)</h4>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={globalStats.dailyClicks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} width={25} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.75rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    />
                    <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top pages ranking */}
          {globalStats.topPages.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-display font-semibold text-sm text-foreground">Classement par clics</h4>
                </div>
                <div className="space-y-2">
                  {globalStats.topPages.map((page, i) => (
                    <div
                      key={page.pageId}
                      onClick={() => onSelectPage(page.pageId)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 cursor-pointer transition-colors"
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-primary text-primary-foreground' :
                        i === 1 ? 'bg-secondary text-secondary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{page.displayName || page.username}</p>
                        <p className="text-xs text-muted-foreground">@{page.username}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <MousePointerClick className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">{page.clicks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {pages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Aucune page créateur</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Créez votre première page créateur pour commencer à partager vos liens.
          </p>
          <Button onClick={onCreatePage} className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Plus className="w-4 h-4" /> Créer une page
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page, i) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
                onClick={() => onSelectPage(page.id)}
              >
                <CardContent className="p-0">
                  {/* Cover */}
                  {page.cover_url ? (
                    <div className="h-24 overflow-hidden rounded-t-xl">
                      <img src={page.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-xl" />
                  )}

                  <div className="p-4 -mt-8 relative">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-background shadow-lg">
                      {page.avatar_url ? (
                        <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-foreground">
                            {(page.display_name || page.username)?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <h3 className="font-display font-bold text-foreground truncate">
                        {page.display_name || page.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">@{page.username}</p>
                      {page.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{page.bio}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        {page.is_nsfw && (
                          <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full font-medium">+18</span>
                        )}
                      </div>
                      <a
                        href={`/${page.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Voir
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add new card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pages.length * 0.05 }}
          >
            <Card
              className="cursor-pointer border-dashed border-2 hover:border-primary/50 transition-all h-full min-h-[200px] flex items-center justify-center"
              onClick={onCreatePage}
            >
              <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Nouvelle page</span>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PagesListView;
