import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkItem } from '@/hooks/useDashboard';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, GripVertical, Pencil, Trash2, ExternalLink, Loader2, ImagePlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LinksManagerProps {
  links: LinkItem[];
  plan: string;
  onAdd: (link: { title: string; url: string; icon: string }) => Promise<{ error: any } | undefined>;
  onUpdate: (id: string, updates: Partial<LinkItem>) => Promise<{ error: any } | undefined>;
  onDelete: (id: string) => Promise<{ error: any } | undefined>;
  onReorder: (links: LinkItem[]) => Promise<void>;
}

const LinksManager = ({ links, plan, onAdd, onUpdate, onDelete, onReorder }: LinksManagerProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('link');
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const maxLinks = plan === 'pro' ? Infinity : plan === 'starter' ? 20 : 5;
  const canAddMore = links.length < maxLinks;

  const openNew = () => {
    if (!canAddMore) {
      const msgKey = plan === 'starter' ? 'dashboard.maxLinks20' : 'dashboard.maxLinks5';
      toast({ title: t(msgKey), variant: 'destructive' });
      return;
    }
    setEditingLink(null);
    setTitle('');
    setUrl('');
    setIcon('link');
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setDialogOpen(true);
  };

  const openEdit = (link: LinkItem) => {
    setEditingLink(link);
    setTitle(link.title);
    setUrl(link.url);
    setIcon(link.icon);
    setThumbnailFile(null);
    setThumbnailPreview(link.thumbnail_url || null);
    setDialogOpen(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large (max 5MB)', variant: 'destructive' });
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const uploadThumbnail = async (linkId: string): Promise<string | null> => {
    if (!thumbnailFile || !user) return null;
    const ext = thumbnailFile.name.split('.').pop();
    const path = `${user.id}/thumbnails/${linkId}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, thumbnailFile, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) return;
    setSaving(true);

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    if (editingLink) {
      let thumbUrl = editingLink.thumbnail_url;
      if (thumbnailFile) {
        setUploadingThumb(true);
        thumbUrl = await uploadThumbnail(editingLink.id);
        setUploadingThumb(false);
      }
      const result = await onUpdate(editingLink.id, { 
        title: title.trim(), url: normalizedUrl, icon,
        ...(thumbnailFile ? { thumbnail_url: thumbUrl } : {}),
      });
      if (result?.error) toast({ title: result.error.message, variant: 'destructive' });
    } else {
      const result = await onAdd({ title: title.trim(), url: normalizedUrl, icon });
      if (result?.error) toast({ title: result.error.message, variant: 'destructive' });
      // Upload thumbnail after link is created (need link id)
      // For simplicity we'll skip thumbnail on create and let user edit after
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result?.error) toast({ title: result.error.message, variant: 'destructive' });
  };

  const handleRemoveThumbnail = async () => {
    if (editingLink) {
      await onUpdate(editingLink.id, { thumbnail_url: null } as any);
    }
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(links);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onReorder(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">{t('dashboard.links')} ({links.length}{plan !== 'pro' ? `/${maxLinks}` : ''})</h3>
        <Button onClick={openNew} size="sm" className="rounded-full gap-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Plus className="w-4 h-4" /> {t('dashboard.addLink')}
        </Button>
      </div>

      {links.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{t('dashboard.addLink')} ✨</p>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="links">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {links.map((link, index) => (
                <Draggable key={link.id} draggableId={link.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-3 flex items-center gap-3 transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      {link.thumbnail_url && (
                        <img src={link.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(link)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => window.open(link.url, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingLink ? t('dashboard.editLink') : t('dashboard.addLink')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('dashboard.linkTitle')}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="My Website" />
            </div>
            <div className="space-y-2">
              <Label>{t('dashboard.linkUrl')}</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} maxLength={500} placeholder="https://example.com" />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail (optional)</Label>
              {thumbnailPreview ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-muted">
                  <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors text-muted-foreground text-sm">
                  <ImagePlus className="w-5 h-5" />
                  <span>Add thumbnail image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
              {t('dashboard.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving || !title.trim() || !url.trim()} className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              {saving ? <Loader2 className="animate-spin" /> : t('dashboard.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinksManager;
