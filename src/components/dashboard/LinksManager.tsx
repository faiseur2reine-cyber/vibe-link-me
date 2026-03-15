import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkItem } from '@/hooks/useDashboard';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  TapPlus as Plus, TapGrip as GripVertical, TapPencil as Pencil, TapTrash as Trash2,
  TapExternalLink as ExternalLink, TapLayout as LayoutTemplate, TapBookmark as BookmarkPlus,
  TapLink as LinkIcon, TapClock as Clock, TapClick as MousePointerClick,
  TapEyeOff as EyeOff, TapCopy as Copy, TapSortAZ as ArrowDownAZ, TapTrendingDown as TrendingDown,
  TapCrown as Crown,
} from '@/components/icons/TapIcons';
import { detectPlatform } from '@/lib/platforms';
import LinkFavicon from '@/components/LinkFavicon';
import { useLinkClickCounts } from '@/hooks/useLinkClickCounts';

// Sub-components
import LinkEditDialog from './links/LinkEditDialog';
import LinkTemplatesDialog from './links/LinkTemplatesDialog';
import SaveTemplateDialog from './links/SaveTemplateDialog';
import CelebrationModal from './CelebrationModal';

interface LinksManagerProps {
  links: LinkItem[];
  plan: string;
  onAdd: (link: { title: string; url: string; icon: string }) => Promise<{ error: any } | undefined>;
  onUpdate: (id: string, updates: Partial<LinkItem>) => Promise<{ error: any } | undefined>;
  onDelete: (id: string) => Promise<{ error: any } | undefined>;
  onReorder: (links: LinkItem[]) => Promise<void>;
  onRefetch?: () => Promise<void>;
  pageId?: string;
  username?: string;
}

const LinksManager = ({ links, plan, onAdd, onUpdate, onDelete, onReorder, onRefetch, pageId, username }: LinksManagerProps) => {
  const { t } = useTranslation();
  const quickAddRef = useRef<HTMLInputElement>(null);
  const clickCounts = useLinkClickCounts(links.map(l => l.id));
  const [sortBy, setSortBy] = useState<'manual' | 'alpha' | 'clicks'>('manual');

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const maxLinks = plan === 'pro' ? Infinity : plan === 'starter' ? 20 : 5;
  const canAddMore = links.length < maxLinks;
  const hiddenCount = Math.max(0, links.length - maxLinks);

  // Sort
  const sortedLinks = sortBy === 'manual' ? links : [...links].sort((a, b) => {
    if (sortBy === 'alpha') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'clicks') return (clickCounts.get(b.id) || 0) - (clickCounts.get(a.id) || 0);
    return 0;
  });

  const applySortToDb = async () => {
    await onReorder(sortedLinks);
    toast.success('Ordre appliqué');
    setSortBy('manual');
  };

  // Cmd+K → focus quick add
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        quickAddRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const openNew = () => {
    if (!canAddMore) {
      toast.error(t(plan === 'starter' ? 'dashboard.maxLinks20' : 'dashboard.maxLinks5'));
      return;
    }
    setEditingLink(null);
    setEditDialogOpen(true);
  };

  const openEdit = (link: LinkItem) => {
    setEditingLink(link);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const deletedLink = links.find(l => l.id === id);
    const result = await onDelete(id);
    if (result?.error) {
      toast.error(result.error.message);
    } else if (deletedLink) {
      toast.success('Lien supprimé', {
        action: {
          label: 'Annuler',
          onClick: async () => {
            await onAdd({ title: deletedLink.title, url: deletedLink.url, icon: deletedLink.icon });
          },
        },
        duration: 5000,
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const items = Array.from(sortedLinks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onReorder(items);
  };

  const handleQuickAdd = async (raw: string) => {
    const wasEmpty = links.length === 0;
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    const platform = detectPlatform(url);
    const title = platform?.name || (() => {
      try { return new URL(url).hostname.replace('www.', ''); } catch { return raw; }
    })();
    const result = await onAdd({ title, url, icon: 'link' });
    if (!result?.error) {
      if (wasEmpty && username) {
        setCelebrationOpen(true);
      } else {
        toast.success(`${title} ajouté`);
      }
    }
    return result;
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{t('dashboard.links')}</h3>
            <p className="text-xs text-muted-foreground">
              {links.length}{plan !== 'pro' ? ` / ${maxLinks}` : ''} {t('linksManager.linksCount')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button onClick={() => setTemplatesOpen(true)} size="sm" variant="ghost" className="h-8 rounded-lg gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          {links.length > 0 && (
            <Button onClick={() => setSaveTemplateOpen(true)} size="sm" variant="ghost" className="h-8 rounded-lg gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('linksManager.saveAsTemplate')}</span>
            </Button>
          )}
          <Button onClick={openNew} size="sm" className="h-8 rounded-lg gap-1.5 text-xs font-medium">
            <Plus className="w-3.5 h-3.5" /> {t('linksManager.add')}
          </Button>
        </div>
      </div>

      {/* ── Hidden links warning ── */}
      {hiddenCount > 0 && (
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
          <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-amber-700 dark:text-amber-300">
              {hiddenCount} lien{hiddenCount > 1 ? 's' : ''} masqué{hiddenCount > 1 ? 's' : ''} sur votre page publique
            </p>
            <p className="text-[11px] text-amber-600/60 dark:text-amber-400/50 mt-0.5">
              Plan {plan === 'free' ? 'gratuit' : 'Starter'} : {maxLinks} liens max. Passez au plan supérieur pour tout afficher.
            </p>
          </div>
          <a href="/dashboard/settings" className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors">
            <Crown className="w-3 h-3" /> Upgrade
          </a>
        </div>
      )}

      {/* ── Sort controls ── */}
      {links.length > 2 && (
        <div className="flex items-center gap-1.5">
          {([
            { value: 'manual' as const, icon: GripVertical, label: 'Manuel' },
            { value: 'alpha' as const, icon: ArrowDownAZ, label: 'A→Z' },
            { value: 'clicks' as const, icon: TrendingDown, label: 'Clics' },
          ]).map(s => (
            <button key={s.value} onClick={() => setSortBy(s.value)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                sortBy === s.value ? 'bg-foreground text-background' : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30'}`}>
              <s.icon className="w-3 h-3" />
              {s.label}
            </button>
          ))}
          {sortBy !== 'manual' && (
            <button onClick={applySortToDb} className="ml-auto text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">
              Appliquer cet ordre
            </button>
          )}
        </div>
      )}

      {/* ── Quick add ── */}
      <div className="relative group">
        <Input
          ref={quickAddRef}
          placeholder="Coller une URL pour ajouter un lien..."
          className="h-10 text-[13px] pl-10 pr-16 bg-muted/20 border-dashed border-border/40 focus:border-primary/40 focus:bg-background"
          onKeyDown={async (e) => {
            if (e.key !== 'Enter') return;
            const input = e.currentTarget;
            const raw = input.value.trim();
            if (!raw) return;
            const result = await handleQuickAdd(raw);
            if (!result?.error) input.value = '';
          }}
        />
        <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary/50 transition-colors" />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/60 text-[10px] text-muted-foreground/40 font-mono border border-border/30">⌘K</kbd>
      </div>

      {/* ── Empty state ── */}
      {links.length === 0 && (
        <button
          onClick={openNew}
          className="w-full py-12 rounded-2xl border-2 border-dashed border-border/30 hover:border-primary/30 transition-all duration-300 flex flex-col items-center gap-3 text-muted-foreground/50 hover:text-foreground group"
        >
          <div className="w-12 h-12 rounded-2xl bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300">
            <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium block">{t('linksManager.addFirstLink')}</span>
            <span className="text-[11px] text-muted-foreground/40 mt-0.5 block">ou collez une URL ci-dessus</span>
          </div>
        </button>
      )}

      {/* ── Links list (drag & drop) ── */}
      <DragDropContext onDragEnd={sortBy === 'manual' ? handleDragEnd : () => {}}>
        <Droppable droppableId="links" isDropDisabled={sortBy !== 'manual'}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
              {sortedLinks.map((link, index) => {
                const prevLink = index > 0 ? sortedLinks[index - 1] : null;
                const showSectionHeader = link.section_title && (!prevLink || prevLink.section_title !== link.section_title);
                const isOverLimit = maxLinks !== Infinity && index >= maxLinks;

                return (
                  <div key={link.id}>
                    {/* Section divider */}
                    {showSectionHeader && (
                      <div className="flex items-center gap-2 pt-3 pb-1">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{link.section_title}</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}

                    {/* Separator before first hidden link */}
                    {isOverLimit && index === maxLinks && (
                      <div className="flex items-center gap-2 pt-2 pb-1 px-2">
                        <div className="h-px flex-1 bg-amber-500/20" />
                        <span className="text-[9px] font-semibold text-amber-600/50 dark:text-amber-400/40 uppercase tracking-widest flex items-center gap-1">
                          <EyeOff className="w-2.5 h-2.5" /> masqués
                        </span>
                        <div className="h-px flex-1 bg-amber-500/20" />
                      </div>
                    )}

                    <Draggable draggableId={link.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            snapshot.isDragging
                              ? 'bg-card shadow-xl shadow-black/[0.08] ring-1 ring-border/50 scale-[1.02]'
                              : 'hover:bg-accent/30'
                          } ${link.is_visible === false || isOverLimit ? 'opacity-35' : ''}`}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className={`transition-colors shrink-0 p-1.5 -ml-1.5 rounded-lg touch-manipulation ${
                              sortBy === 'manual'
                                ? 'cursor-grab active:cursor-grabbing text-muted-foreground/20 hover:text-muted-foreground/50 hover:bg-muted/40'
                                : 'cursor-default text-muted-foreground/10'
                            }`}
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          {/* Icon / thumbnail */}
                          {link.thumbnail_url ? (
                            <img src={link.thumbnail_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-border/20" />
                          ) : link.bg_color ? (
                            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm" style={{ backgroundColor: link.bg_color }}>
                              <LinkFavicon url={link.url} size="sm" className={link.text_color ? '' : 'text-white'} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                              <LinkFavicon url={link.url} size="sm" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-foreground truncate leading-tight">{link.title}</p>
                            <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{link.description || link.url}</p>
                          </div>

                          {/* Badges */}
                          <div className="hidden sm:flex items-center gap-1 shrink-0">
                            {(clickCounts.get(link.id) || 0) > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5 tabular-nums">
                                <MousePointerClick className="w-2.5 h-2.5" />
                                {clickCounts.get(link.id)}
                              </span>
                            )}
                            {link.style !== 'default' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{link.style}</span>
                            )}
                            {(link.scheduled_at || link.expires_at) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {link.scheduled_at && new Date(link.scheduled_at) > new Date() ? 'Programmé' : link.expires_at ? 'Expire' : ''}
                              </span>
                            )}
                            {link.is_visible === false && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5">
                                <EyeOff className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Dupliquer"
                              onClick={async () => {
                                const result = await onAdd({ title: link.title, url: link.url, icon: link.icon });
                                if (!result?.error) toast.success('Lien dupliqué');
                              }}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(link)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => window.open(link.url, '_blank')}>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(link.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* ── Dialogs ── */}
      <LinkEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editingLink={editingLink}
        onAdd={onAdd}
        onUpdate={onUpdate}
        linksCount={links.length}
        onFirstLink={() => setCelebrationOpen(true)}
      />

      <LinkTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        linksCount={links.length}
        maxLinks={maxLinks}
        pageId={pageId}
        onRefetch={onRefetch}
      />

      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        links={links}
      />

      {username && (
        <CelebrationModal
          open={celebrationOpen}
          onOpenChange={setCelebrationOpen}
          username={username}
        />
      )}
    </div>
  );
};

export default LinksManager;
