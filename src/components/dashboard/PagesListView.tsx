import { CreatorPage } from '@/hooks/useCreatorPages';
import { useTranslation } from 'react-i18next';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { Button } from '@/components/ui/button';
import {
  TapPlus as Plus, TapExternalLink as ExternalLink, TapCopy as Copy,
  TapTrash as Trash2, TapSearch as Search, TapLink as Link2,
  TapClick as MousePointerClick, TapDollar as DollarSign,
  TapCheckSquare as CheckSquare, TapSquare as Square, TapX as X,
} from '@/components/icons/TapIcons';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PagesListViewProps {
  pages: CreatorPage[];
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage?: (id: string) => Promise<{ error: any; data?: any }>;
  onDeletePage?: (id: string) => Promise<{ error: any }>;
  onBulkUpdate?: (ids: string[], updates: Partial<CreatorPage>) => Promise<{ error: any }>;
  maxPages?: number;
}

// ── Status config ──
const STATUS = {
  active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  draft: { label: 'Draft', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  paused: { label: 'Paused', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
} as const;

const PagesListView = ({ pages, onSelectPage, onCreatePage, onDuplicatePage, onDeletePage, onBulkUpdate, maxPages }: PagesListViewProps) => {
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState<CreatorPage | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // ── Filters ──
  const filteredPages = useMemo(() => {
    let result = pages;
    if (statusFilter !== 'all') result = result.filter(p => (p.status || 'draft') === statusFilter);
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

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: pages.length, draft: 0, active: 0, paused: 0 };
    pages.forEach(p => { const s = p.status || 'draft'; c[s] = (c[s] || 0) + 1; });
    return c;
  }, [pages]);

  const pageIds = useMemo(() => pages.map(p => p.id), [pages]);
  const globalStats = useGlobalAnalytics(pageIds);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalRevenue = pages.reduce((sum, p) => {
    return sum + Math.round((p.revenue_monthly ?? 0) * (p.revenue_commission ?? 20) / 100);
  }, 0);

  // ── Empty state ──
  if (pages.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight font-display">{t('pages.title')}</h1>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
              <Link2 className="w-7 h-7 text-primary/60" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
              <Plus className="w-2.5 h-2.5 text-primary" />
            </div>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t('pages.noPages')}</h2>
          <p className="text-[13px] text-muted-foreground/50 mt-1.5 max-w-[280px] leading-relaxed">
            {t('pages.noPagesDesc')}
          </p>
          <Button onClick={onCreatePage} size="sm" className="mt-6 h-10 px-6 text-[13px] gap-2 rounded-xl font-semibold">
            <Plus className="w-4 h-4" /> {t('pages.createPage')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight font-display">{t('pages.title')}</h1>
          <div className="flex items-center gap-2.5 mt-1">
            <p className="text-[12px] text-muted-foreground/50">
              {pages.length} page{pages.length > 1 ? 's' : ''}
              {globalStats.totalClicks > 0 && <> · {globalStats.totalClicks.toLocaleString()} clics</>}
              {totalRevenue > 0 && <> · {totalRevenue.toLocaleString()}€</>}
            </p>
            {maxPages !== undefined && maxPages !== Infinity && (
              <div className="flex items-center gap-1.5">
                <div className="w-14 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pages.length >= maxPages ? 'bg-red-500' : pages.length >= maxPages - 1 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min((pages.length / maxPages) * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${pages.length >= maxPages ? 'text-red-500' : 'text-muted-foreground/40'}`}>
                  {pages.length}/{maxPages}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button onClick={onCreatePage} size="sm" className="h-9 px-4 text-[12px] gap-1.5 rounded-xl font-medium">
          <Plus className="w-3.5 h-3.5" /> Nouvelle page
        </Button>
      </div>

      {/* ── Toolbar ── */}
      {pages.length > 1 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-[12px] bg-transparent border-border/40 rounded-lg placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {(['all', 'active', 'draft', 'paused'] as const).map(key => {
              const count = statusCounts[key] || 0;
              if (key !== 'all' && count === 0) return null;
              const label = key === 'all' ? 'Toutes' : STATUS[key].label;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
                    statusFilter === key
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {label}
                  {count > 0 && <span className="ml-1 opacity-50">{count}</span>}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
            className={`h-8 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
              bulkMode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            {bulkMode ? 'Annuler' : 'Sélection'}
          </button>
        </div>
      )}

      {/* ── Page rows ── */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredPages.map((page, i) => {
            const status = STATUS[(page.status || 'draft') as keyof typeof STATUS] || STATUS.draft;
            const clicks = globalStats.topPages.find(p => p.pageId === page.id)?.clicks ?? 0;
            const commission = Math.round((page.revenue_monthly ?? 0) * (page.revenue_commission ?? 20) / 100);
            const isSelected = selected.has(page.id);

            return (
              <motion.div
                key={page.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.015, duration: 0.2 }}
              >
                <div
                  onClick={() => bulkMode ? toggleSelect(page.id) : onSelectPage(page.id)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary/8 ring-1 ring-primary/20'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  {/* Bulk checkbox */}
                  {bulkMode && (
                    <div className="shrink-0 w-5 flex items-center justify-center">
                      {isSelected
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4 text-muted-foreground/40" />
                      }
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-muted/60 ring-1 ring-border/20">
                    {page.avatar_url ? (
                      <img src={page.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/40">
                        <span className="text-[13px] font-semibold text-muted-foreground/50">
                          {(page.display_name || page.username)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold truncate">{page.display_name || page.username}</span>
                      {page.is_nsfw && (
                        <span className="text-[8px] bg-red-500/10 text-red-500 px-1 py-px rounded font-bold tracking-wider">18+</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground/40">@{page.username}</span>
                      {page.operator && (
                        <>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-[11px] text-muted-foreground/50 truncate max-w-[100px]">{page.operator}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${status.bg}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    <span className={`text-[10px] font-semibold ${status.text}`}>{status.label}</span>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center gap-4 text-[11px] tabular-nums mr-1">
                    <span className="flex items-center gap-1 text-muted-foreground/50" title="Clics">
                      <MousePointerClick className="w-3 h-3" />
                      {clicks.toLocaleString()}
                    </span>
                    {commission > 0 && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium" title="Commission">
                        <DollarSign className="w-3 h-3" />
                        {commission.toLocaleString()}€
                      </span>
                    )}
                  </div>

                  {/* Actions — visible on mobile, hover on desktop */}
                  {!bulkMode && (
                    <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                      <a
                        href={`/${page.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                        title="Voir la page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {onDeletePage && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(page); }}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          import('@/lib/clipboard').then(({ copyToClipboard }) => {
                            copyToClipboard(`${window.location.origin}/${page.username}`).then(ok => { if (ok) toast.success(t('pages.linkCopied')); });
                          });
                        }}
                        className="hidden sm:inline-flex w-8 h-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                        title="Copier le lien"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      {onDuplicatePage && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (maxPages !== undefined && maxPages !== Infinity && pages.length >= maxPages) {
                              onCreatePage();
                              return;
                            }
                            const r = await onDuplicatePage(page.id);
                            r?.error ? toast.error('Erreur') : toast.success(t('pages.duplicated'));
                          }}
                          className="hidden sm:inline-flex w-8 h-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* No results */}
        {filteredPages.length === 0 && pages.length > 0 && (
          <div className="text-center py-16">
            <p className="text-[13px] text-muted-foreground/40">Aucun résultat</p>
          </div>
        )}

        {/* Add row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div
            onClick={onCreatePage}
            className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer border border-dashed border-border/20 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-muted/30 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-200">
              <Plus className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[13px] text-muted-foreground/30 group-hover:text-foreground/60 transition-colors">{t('pages.newPage')}</span>
          </div>
        </motion.div>
      </div>

      {/* ── Bulk action bar ── */}
      <AnimatePresence>
        {bulkMode && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background rounded-xl px-4 py-2.5 shadow-2xl shadow-black/20 flex items-center gap-3"
          >
            <span className="text-[12px] font-semibold tabular-nums">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
            <div className="w-px h-4 bg-background/15" />
            {onBulkUpdate && (
              <>
                <button
                  onClick={async () => {
                    await onBulkUpdate(Array.from(selected), { status: 'active' });
                    toast.success(`${selected.size} page(s) activée(s)`);
                    setSelected(new Set()); setBulkMode(false);
                  }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                >
                  Activer
                </button>
                <button
                  onClick={async () => {
                    await onBulkUpdate(Array.from(selected), { status: 'paused' });
                    toast.success(`${selected.size} page(s) mise(s) en pause`);
                    setSelected(new Set()); setBulkMode(false);
                  }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  Pause
                </button>
              </>
            )}
            <button
              onClick={() => {
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
              onClick={() => { setSelected(new Set()); setBulkMode(false); }}
              className="p-1 rounded-lg hover:bg-background/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette page ?</AlertDialogTitle>
            <AlertDialogDescription>
              La page <span className="font-semibold">@{deleteTarget?.username}</span> et tous ses liens seront supprimés définitivement.
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
