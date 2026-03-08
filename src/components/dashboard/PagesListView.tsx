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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes pages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez vos pages et suivez vos performances.
        </p>
      </div>

      {/* Stats — compact inline pills */}
      {pages.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-background rounded-full px-3 py-1.5 border border-border">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{globalStats.totalPages}</span> pages
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-background rounded-full px-3 py-1.5 border border-border">
            <Link2 className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{globalStats.totalLinks}</span> liens
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-background rounded-full px-3 py-1.5 border border-border">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{globalStats.totalClicks}</span> clics
          </div>
        </div>
      )}

      {/* Search */}
      {pages.length > 2 && (
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une page..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-background border-border"
          />
        </div>
      )}

      {/* Pages grid */}
      {pages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-base font-semibold">Aucune page</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Créez votre première page pour centraliser tous vos liens.
          </p>
          <Button onClick={onCreatePage} className="mt-5 h-9 px-5 text-sm gap-1.5 rounded-full">
            <Plus className="w-3.5 h-3.5" /> Créer une page
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPages.map((page, i) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                onClick={() => onSelectPage(page.id)}
                className="group relative rounded-xl bg-background border border-border p-4 cursor-pointer hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-border">
                    {page.avatar_url ? (
                      <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {(page.display_name || page.username)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{page.display_name || page.username}</p>
                    <p className="text-xs text-muted-foreground">@{page.username}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                {page.bio && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{page.bio}</p>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    {page.is_nsfw && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">18+</span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onDuplicatePage && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const r = await onDuplicatePage(page.id);
                          r?.error ? toast.error('Erreur') : toast.success('Dupliquée');
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeletePage && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(page); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <a
                      href={`/${page.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                      title="Voir"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filteredPages.length * 0.03 }}
          >
            <div
              onClick={onCreatePage}
              className="rounded-xl border-2 border-dashed border-border/70 bg-transparent p-4 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center min-h-[120px] text-center"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Nouvelle page</span>
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
