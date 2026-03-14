import { CreatorPage } from '@/hooks/useCreatorPages';
import { useTranslation } from 'react-i18next';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Copy, Trash2, Search, ArrowUpRight, Link2, MousePointerClick, LayoutGrid, CheckSquare, Square, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PagesListViewProps {
  pages: CreatorPage[];
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage?: (id: string) => Promise<{ error: any; data?: any }>;
  onDeletePage?: (id: string) => Promise<{ error: any }>;
  onBulkUpdate?: (ids: string[], updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const StatPill = ({ icon: Icon, value, label }: { icon: any; value: number; label: string }) => (
  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
    <Icon className="w-3 h-3" />
    <span className="font-semibold text-foreground tabular-nums">{value}</span>
    <span>{label}</span>
  </div>
);

const PagesListView = ({ pages, onSelectPage, onCreatePage, onDuplicatePage, onDeletePage, onBulkUpdate }: PagesListViewProps) => {
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState<CreatorPage | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState(false);

  const filteredPages = useMemo(() => {
    let result = pages;
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => (p.status || 'draft') === statusFilter);
    }
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.display_name || '').toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        (p.operator || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [pages, search, statusFilter]);

  // Count pages per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: pages.length, draft: 0, active: 0, paused: 0 };
    pages.forEach(p => { const s = p.status || 'draft'; counts[s] = (counts[s] || 0) + 1; });
    return counts;
  }, [pages]);

  const pageIds = useMemo(() => pages.map(p => p.id), [pages]);
  const globalStats = useGlobalAnalytics(pageIds);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight font-display">{t('pages.title')}</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {t('pages.subtitle')}
        </p>
      </div>

      {/* Stats */}
      {pages.length > 0 && (
        <div data-tour="stats" className="flex items-center gap-5 text-sm">
          <StatPill icon={LayoutGrid} value={globalStats.totalPages} label="pages" />
          <StatPill icon={Link2} value={globalStats.totalLinks} label="liens" />
          <StatPill icon={MousePointerClick} value={globalStats.totalClicks} label="clics" />
        </div>
      )}

      {/* Search + Bulk toggle */}
      {pages.length > 1 && (
        <div className="flex items-center gap-2">
          {pages.length > 2 && (
            <div className="relative flex-1 sm:flex-none sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={t('pages.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-[13px] bg-transparent border-border/60 rounded-lg"
              />
            </div>
          )}
          <Button
            variant={bulkAction ? 'default' : 'outline'}
            size="sm"
            className="h-8 px-3 text-[11px] gap-1.5 shrink-0"
            onClick={() => { setBulkAction(!bulkAction); setSelected(new Set()); }}
          >
            <CheckSquare className="w-3 h-3" />
            {bulkAction ? t('pages.cancel') : t('pages.selection')}
          </Button>
        </div>
      )}

      {/* Status filter chips */}
      {pages.length > 1 && (
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: 'Toutes', color: '' },
            { key: 'active', label: 'Active', color: 'text-emerald-600' },
            { key: 'draft', label: 'Draft', color: 'text-amber-600' },
            { key: 'paused', label: 'Paused', color: 'text-red-600' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-foreground text-background'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {label} {statusCounts[key] > 0 && <span className="ml-0.5 opacity-60">{statusCounts[key]}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Pages */}
      {pages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Link2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="text-sm font-medium">{t('pages.noPages')}</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5 max-w-[240px]">
            {t('pages.noPagesDesc')}
          </p>
          <Button onClick={onCreatePage} size="sm" className="mt-4 h-8 px-4 text-[12px] gap-1.5 rounded-lg shadow-none">
            <Plus className="w-3 h-3" /> Créer une page
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPages.map((page, i) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <div
                onClick={() => {
                  if (bulkAction) {
                    setSelected(prev => {
                      const next = new Set(prev);
                      next.has(page.id) ? next.delete(page.id) : next.add(page.id);
                      return next;
                    });
                  } else {
                    onSelectPage(page.id);
                  }
                }}
                className={`group relative rounded-xl bg-card border p-3.5 cursor-pointer transition-all duration-150 ${
                  selected.has(page.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border/60 hover:border-border hover:bg-accent/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Bulk checkbox */}
                  {bulkAction && (
                    <div className="shrink-0">
                      {selected.has(page.id)
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4 text-muted-foreground/40" />
                      }
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-muted">
                    {page.avatar_url ? (
                      <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {(page.display_name || page.username)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[13px] truncate">{page.display_name || page.username}</p>
                    <p className="text-[11px] text-muted-foreground">@{page.username}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                </div>

                {page.bio && (
                  <p className="text-[11px] text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">{page.bio}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    {page.status && page.status !== 'draft' && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        page.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                        page.status === 'paused' ? 'bg-red-500/10 text-red-600' :
                        'bg-muted text-muted-foreground'
                      }`}>{page.status === 'active' ? 'Active' : page.status === 'paused' ? 'Paused' : page.status}</span>
                    )}
                    {page.is_nsfw && (
                      <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">18+</span>
                    )}
                    {page.operator && (
                      <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">{page.operator}</span>
                    )}
                    {(page.revenue_monthly ?? 0) > 0 && (
                      <span className="text-[9px] text-emerald-600 font-medium">{Math.round((page.revenue_monthly ?? 0) * (page.revenue_commission ?? 20) / 100)}€</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Click count — always visible */}
                    <span className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-1">
                      <MousePointerClick className="w-2.5 h-2.5" />
                      {globalStats.topPages.find(p => p.pageId === page.id)?.clicks ?? 0}
                    </span>
                    <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `${window.location.origin}/${page.username}`;
                        navigator.clipboard.writeText(url);
                        toast.success(t('pages.linkCopied'));
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                      title="Copier le lien"
                    >
                      <Link2 className="w-3 h-3" />
                    </button>
                    {onDuplicatePage && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const r = await onDuplicatePage(page.id);
                          r?.error ? toast.error('Erreur') : toast.success(t('pages.duplicated'));
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                    {onDeletePage && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(page); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <a
                      href={`/${page.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add card */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filteredPages.length * 0.02 }}
          >
            <div
              onClick={onCreatePage}
              className="rounded-xl border border-dashed border-border/60 bg-transparent p-3.5 cursor-pointer hover:border-border hover:bg-accent/20 transition-all duration-150 flex flex-col items-center justify-center min-h-[100px] text-center"
            >
              <Plus className="w-4 h-4 text-muted-foreground/60 mb-1" />
              <span className="text-[12px] text-muted-foreground">{t('pages.newPage')}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {bulkAction && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-3"
          >
            <span className="text-[12px] font-semibold">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
            <div className="w-px h-5 bg-background/20" />
            {onBulkUpdate && (
              <>
                <button
                  onClick={async () => {
                    await onBulkUpdate(Array.from(selected), { status: 'active' });
                    toast.success(`${selected.size} page(s) activée(s)`);
                    setSelected(new Set()); setBulkAction(false);
                  }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                >
                  Activer
                </button>
                <button
                  onClick={async () => {
                    await onBulkUpdate(Array.from(selected), { status: 'paused' });
                    toast.success(`${selected.size} page(s) mise(s) en pause`);
                    setSelected(new Set()); setBulkAction(false);
                  }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  Pause
                </button>
              </>
            )}
            <button
              onClick={() => {
                // Export selected pages to CSV
                const rows = [['Username', 'Display Name', 'Status', 'Operator', 'Revenue', 'Commission']];
                pages.filter(p => selected.has(p.id)).forEach(p => {
                  rows.push([p.username, p.display_name || '', p.status || 'draft', p.operator || '', String(p.revenue_monthly ?? 0), String(p.revenue_commission ?? 20)]);
                });
                const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'pages-export.csv'; a.click();
                URL.revokeObjectURL(url);
                toast.success(t('pages.csvExported'));
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
            >
              CSV
            </button>
            <button
              onClick={() => { setSelected(new Set()); setBulkAction(false); }}
              className="p-1 rounded-lg hover:bg-background/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette page ?</AlertDialogTitle>
            <AlertDialogDescription>
              La page <span className="font-semibold">@{deleteTarget?.username}</span> et ses liens seront supprimés définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget || !onDeletePage) return;
                const result = await onDeletePage(deleteTarget.id);
                result?.error ? toast.error('Erreur') : toast.success(t('pages.deleted'));
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
