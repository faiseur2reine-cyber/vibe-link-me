import { CreatorPage } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Users, MousePointerClick, Link2, TrendingUp, BarChart3, Copy, Trash2, Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { THEMES } from '@/lib/themes';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PagesListViewProps {
  pages: CreatorPage[];
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage?: (id: string) => Promise<{ error: any; data?: any }>;
  onDeletePage?: (id: string) => Promise<{ error: any }>;
}

type SortOption = 'newest' | 'oldest' | 'alpha';

const PagesListView = ({ pages, onSelectPage, onCreatePage, onDuplicatePage, onDeletePage }: PagesListViewProps) => {
  const [deleteTarget, setDeleteTarget] = useState<CreatorPage | null>(null);
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('all');
  const [nsfwFilter, setNsfwFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeFilterCount = [themeFilter !== 'all', nsfwFilter !== 'all'].filter(Boolean).length;

  const filteredPages = useMemo(() => {
    let result = pages;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.display_name || '').toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        (p.bio || '').toLowerCase().includes(q)
      );
    }

    if (themeFilter !== 'all') {
      result = result.filter(p => p.theme === themeFilter);
    }

    if (nsfwFilter === 'nsfw') {
      result = result.filter(p => p.is_nsfw);
    } else if (nsfwFilter === 'safe') {
      result = result.filter(p => !p.is_nsfw);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return (a.display_name || a.username).localeCompare(b.display_name || b.username);
    });

    return result;
  }, [pages, search, themeFilter, nsfwFilter, sortBy]);

  const usedThemes = useMemo(() => [...new Set(pages.map(p => p.theme))], [pages]);
  const pageIds = useMemo(() => pages.map(p => p.id), [pages]);
  const globalStats = useGlobalAnalytics(pageIds);

  const clearFilters = () => {
    setSearch('');
    setThemeFilter('all');
    setNsfwFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Mes pages créateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} page{pages.length !== 1 ? 's' : ''} créée{pages.length !== 1 ? 's' : ''}</p>
        </div>
        {pages.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une page..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-muted/50 border-border"
            />
          </div>
        )}
      </div>

      {/* Filters row */}
      {pages.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Filtres</span>
          </div>

          <Select value={themeFilter} onValueChange={setThemeFilter}>
            <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs rounded-full bg-muted/50 border-border">
              <SelectValue placeholder="Thème" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les thèmes</SelectItem>
              {usedThemes.map(t => (
                <SelectItem key={t} value={t}>{THEMES[t]?.name || t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={nsfwFilter} onValueChange={setNsfwFilter}>
            <SelectTrigger className="w-auto min-w-[100px] h-8 text-xs rounded-full bg-muted/50 border-border">
              <SelectValue placeholder="Contenu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout contenu</SelectItem>
              <SelectItem value="safe">Safe only</SelectItem>
              <SelectItem value="nsfw">NSFW only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-auto min-w-[130px] h-8 text-xs rounded-full bg-muted/50 border-border">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récentes</SelectItem>
              <SelectItem value="oldest">Plus anciennes</SelectItem>
              <SelectItem value="alpha">Alphabétique</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs rounded-full gap-1 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" /> Réinitialiser
            </Button>
          )}

          {(search || activeFilterCount > 0) && (
            <Badge variant="secondary" className="text-xs rounded-full">
              {filteredPages.length} résultat{filteredPages.length !== 1 ? 's' : ''}
            </Badge>
          )}

          <div className="ml-auto flex items-center border border-border rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grille"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Liste"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page, i) => (
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
                  {page.cover_url ? (
                    <div className="h-24 overflow-hidden rounded-t-xl">
                      <img src={page.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-xl" />
                  )}
                  <div className="p-4 -mt-8 relative">
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
                      <h3 className="font-display font-bold text-foreground truncate">{page.display_name || page.username}</h3>
                      <p className="text-sm text-muted-foreground">@{page.username}</p>
                      {page.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{page.bio}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        {page.is_nsfw && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">+18</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {onDuplicatePage && (
                          <button onClick={async (e) => { e.stopPropagation(); const r = await onDuplicatePage(page.id); r?.error ? toast.error('Erreur lors de la duplication') : toast.success('Page dupliquée avec succès'); }} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors" title="Dupliquer"><Copy className="w-3 h-3" /> Dupliquer</button>
                        )}
                        {onDeletePage && (
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(page); }} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors" title="Supprimer"><Trash2 className="w-3 h-3" /></button>
                        )}
                        <a href={`/${page.username}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"><ExternalLink className="w-3 h-3" /> Voir</a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: filteredPages.length * 0.05 }}>
            <Card className="cursor-pointer border-dashed border-2 hover:border-primary/50 transition-all h-full min-h-[200px] flex items-center justify-center" onClick={onCreatePage}>
              <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Nouvelle page</span>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPages.map((page, i) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                onClick={() => onSelectPage(page.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-background shadow shrink-0">
                    {page.avatar_url ? (
                      <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {(page.display_name || page.username)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-foreground truncate">{page.display_name || page.username}</h3>
                      {page.is_nsfw && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium shrink-0">+18</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">@{page.username}</p>
                  </div>

                  {/* Theme badge */}
                  <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">
                    {THEMES[page.theme]?.name || page.theme}
                  </Badge>

                  {/* Date */}
                  <span className="text-[10px] text-muted-foreground shrink-0 hidden md:block">
                    {new Date(page.created_at).toLocaleDateString()}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onDuplicatePage && (
                      <button onClick={async (e) => { e.stopPropagation(); const r = await onDuplicatePage(page.id); r?.error ? toast.error('Erreur') : toast.success('Dupliquée'); }} className="p-1 text-muted-foreground hover:text-primary transition-colors rounded" title="Dupliquer"><Copy className="w-3.5 h-3.5" /></button>
                    )}
                    {onDeletePage && (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(page); }} className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                    <a href={`/${page.username}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 text-muted-foreground hover:text-primary transition-colors rounded" title="Voir"><ExternalLink className="w-3.5 h-3.5" /></a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add new row */}
          <Card
            className="cursor-pointer border-dashed border-2 hover:border-primary/50 transition-all"
            onClick={onCreatePage}
          >
            <CardContent className="p-3 flex items-center justify-center gap-2 text-muted-foreground">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nouvelle page</span>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette page ?</AlertDialogTitle>
            <AlertDialogDescription>
              La page <span className="font-semibold">@{deleteTarget?.username}</span> et tous ses liens seront définitivement supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget || !onDeletePage) return;
                const result = await onDeletePage(deleteTarget.id);
                if (result?.error) {
                  toast.error('Erreur lors de la suppression');
                } else {
                  toast.success('Page supprimée');
                }
                setDeleteTarget(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PagesListView;
