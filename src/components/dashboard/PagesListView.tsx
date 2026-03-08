import { CreatorPage } from '@/hooks/useCreatorPages';
import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Copy, Trash2, Search, ArrowUpRight, Link2, MousePointerClick, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PagesListViewProps {
  pages: CreatorPage[];
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage?: (id: string) => Promise<{ error: any; data?: any }>;
  onDeletePage?: (id: string) => Promise<{ error: any }>;
}

const StatPill = ({ icon: Icon, value, label }: { icon: any; value: number; label: string }) => (
  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
    <Icon className="w-3 h-3" />
    <span className="font-semibold text-foreground tabular-nums">{value}</span>
    <span>{label}</span>
  </div>
);

const PagesListView = ({ pages, onSelectPage, onCreatePage, onDuplicatePage, onDeletePage }: PagesListViewProps) => {
  const [deleteTarget, setDeleteTarget] = useState<CreatorPage | null>(null);
  const [search, setSearch] = useState('');

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase();
    return pages.filter(p =>
      (p.display_name || '').toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q)
    );
  }, [pages, search]);

  const pageIds = useMemo(() => pages.map(p => p.id), [pages]);
  const globalStats = useGlobalAnalytics(pageIds);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight font-display">Mes pages</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Gérez vos pages et suivez vos performances.
        </p>
      </div>

      {/* Stats */}
      {pages.length > 0 && (
        <div className="flex items-center gap-5 text-sm">
          <StatPill icon={LayoutGrid} value={globalStats.totalPages} label="pages" />
          <StatPill icon={Link2} value={globalStats.totalLinks} label="liens" />
          <StatPill icon={MousePointerClick} value={globalStats.totalClicks} label="clics" />
        </div>
      )}

      {/* Search */}
      {pages.length > 2 && (
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-[13px] bg-transparent border-border/60 rounded-lg"
          />
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
          <h2 className="text-sm font-medium">Aucune page</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5 max-w-[240px]">
            Créez votre première page pour centraliser vos liens.
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
                onClick={() => onSelectPage(page.id)}
                className="group relative rounded-xl bg-card border border-border/60 p-3.5 cursor-pointer hover:border-border hover:bg-accent/30 transition-all duration-150"
              >
                <div className="flex items-center gap-2.5">
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
                    {page.is_nsfw && (
                      <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">18+</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onDuplicatePage && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const r = await onDuplicatePage(page.id);
                          r?.error ? toast.error('Erreur') : toast.success('Dupliquée');
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
              <span className="text-[12px] text-muted-foreground">Nouvelle page</span>
            </div>
          </motion.div>
        </div>
      )}

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
                result?.error ? toast.error('Erreur') : toast.success('Page supprimée');
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
