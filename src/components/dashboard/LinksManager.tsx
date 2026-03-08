import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkItem } from '@/hooks/useDashboard';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, GripVertical, Pencil, Trash2, ExternalLink, Loader2, ImagePlus, X, Palette, LayoutTemplate } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LINK_TEMPLATES = [
  {
    id: 'onlyfans-creator',
    name: '🔥 OnlyFans Creator',
    desc: 'Template pour créatrice OnlyFans avec liens essentiels',
    links: [
      { title: 'OnlyFans', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: null, description: 'Subscribe to my exclusive content 💋', bg_color: '#00AFF0', text_color: '#FFFFFF' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Réseaux sociaux', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'Twitter / X', url: 'https://x.com/', icon: 'link', style: 'default', section_title: 'Réseaux sociaux', description: null, bg_color: '#000000', text_color: '#FFFFFF' },
      { title: 'TikTok', url: 'https://tiktok.com/', icon: 'link', style: 'default', section_title: 'Réseaux sociaux', description: null, bg_color: '#000000', text_color: '#FFFFFF' },
      { title: 'Wishlist Amazon', url: 'https://amazon.com/', icon: 'link', style: 'default', section_title: 'Cadeaux', description: 'Send me a gift 🎁', bg_color: '#FF9900', text_color: '#000000' },
    ],
  },
  {
    id: 'agency-multi',
    name: '🏢 Agence Multi-Créatrices',
    desc: 'Template agence avec sections par créatrice',
    links: [
      { title: 'OnlyFans - Créatrice 1', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Créatrice 1', description: '@creatrice1 • Top Creator 🌟', bg_color: '#00AFF0', text_color: '#FFFFFF' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Créatrice 1', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'OnlyFans - Créatrice 2', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Créatrice 2', description: '@creatrice2 • Exclusive Content 💎', bg_color: '#00AFF0', text_color: '#FFFFFF' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Créatrice 2', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'instagram-influencer',
    name: '📸 Influenceur Instagram',
    desc: 'Liens standards pour influenceur/créateur de contenu',
    links: [
      { title: 'YouTube', url: 'https://youtube.com/', icon: 'link', style: 'featured', section_title: null, description: 'Watch my latest videos 🎬', bg_color: '#FF0000', text_color: '#FFFFFF' },
      { title: 'TikTok', url: 'https://tiktok.com/', icon: 'link', style: 'default', section_title: 'Réseaux', description: null, bg_color: '#000000', text_color: '#FFFFFF' },
      { title: 'Snapchat', url: 'https://snapchat.com/', icon: 'link', style: 'default', section_title: 'Réseaux', description: null, bg_color: '#FFFC00', text_color: '#000000' },
      { title: 'Contact Pro', url: 'mailto:contact@example.com', icon: 'link', style: 'default', section_title: 'Business', description: 'Collaborations & partenariats', bg_color: null, text_color: null },
    ],
  },
  {
    id: 'ecommerce',
    name: '🛍️ E-commerce / Boutique',
    desc: 'Liens vers vos boutiques et produits',
    links: [
      { title: 'Ma Boutique', url: 'https://shopify.com/', icon: 'link', style: 'featured', section_title: null, description: 'Découvrez ma collection 🛒', bg_color: '#96BF48', text_color: '#FFFFFF' },
      { title: 'Nouveau Drop', url: 'https://example.com/drop', icon: 'link', style: 'card', section_title: 'Produits', description: 'Collection limitée 🔥', bg_color: '#000000', text_color: '#FFFFFF' },
      { title: 'Promo -20%', url: 'https://example.com/promo', icon: 'link', style: 'default', section_title: 'Produits', description: 'Code: MYTAPTAP20', bg_color: '#EF4444', text_color: '#FFFFFF' },
      { title: 'Instagram Shop', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Réseaux', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
    ],
  },
];

interface LinksManagerProps {
  links: LinkItem[];
  plan: string;
  onAdd: (link: { title: string; url: string; icon: string }) => Promise<{ error: any } | undefined>;
  onUpdate: (id: string, updates: Partial<LinkItem>) => Promise<{ error: any } | undefined>;
  onDelete: (id: string) => Promise<{ error: any } | undefined>;
  onReorder: (links: LinkItem[]) => Promise<void>;
  onRefetch?: () => Promise<void>;
}

const LINK_STYLES = [
  { value: 'default', label: 'Standard', desc: 'Bouton classique' },
  { value: 'featured', label: 'Featured', desc: 'Mis en avant, plus grand' },
  { value: 'card', label: 'Card', desc: 'Carte avec thumbnail' },
  { value: 'minimal', label: 'Minimal', desc: 'Texte simple' },
];

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#F43F5E',
];

const LinksManager = ({ links, plan, onAdd, onUpdate, onDelete, onReorder }: LinksManagerProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('link');
  const [description, setDescription] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [linkStyle, setLinkStyle] = useState('default');
  const [sectionTitle, setSectionTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const maxLinks = plan === 'pro' ? Infinity : plan === 'starter' ? 20 : 5;
  const canAddMore = links.length < maxLinks;

  const handleApplyTemplate = async (template: typeof LINK_TEMPLATES[0]) => {
    if (!user) return;
    const remaining = maxLinks === Infinity ? Infinity : maxLinks - links.length;
    const templateLinks = template.links.slice(0, remaining);
    if (templateLinks.length === 0) {
      toast({ title: 'Limite de liens atteinte', variant: 'destructive' });
      return;
    }
    setApplyingTemplate(true);
    const startPosition = links.length;
    const inserts = templateLinks.map((tl, idx) => ({
      title: tl.title,
      url: tl.url,
      icon: tl.icon,
      user_id: user.id,
      position: startPosition + idx,
      style: tl.style,
      section_title: tl.section_title,
      description: tl.description,
      bg_color: tl.bg_color,
      text_color: tl.text_color,
    }));
    const { error } = await supabase.from('links').insert(inserts);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Template "${template.name}" appliqué ! 🎉` });
      // Trigger refetch via parent
      await onAdd({ title: '__refetch__', url: '__refetch__', icon: '' }).catch(() => {});
    }
    setApplyingTemplate(false);
    setTemplateDialogOpen(false);
  };

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
    setDescription('');
    setBgColor('');
    setTextColor('');
    setLinkStyle('default');
    setSectionTitle('');
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setShowCustomization(false);
    setDialogOpen(true);
  };

  const openEdit = (link: LinkItem) => {
    setEditingLink(link);
    setTitle(link.title);
    setUrl(link.url);
    setIcon(link.icon);
    setDescription(link.description || '');
    setBgColor(link.bg_color || '');
    setTextColor(link.text_color || '');
    setLinkStyle(link.style || 'default');
    setSectionTitle(link.section_title || '');
    setThumbnailFile(null);
    setThumbnailPreview(link.thumbnail_url || null);
    setShowCustomization(!!(link.bg_color || link.text_color || link.description || link.style !== 'default' || link.section_title));
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

    const customFields = {
      description: description.trim() || null,
      bg_color: bgColor.trim() || null,
      text_color: textColor.trim() || null,
      style: linkStyle,
      section_title: sectionTitle.trim() || null,
    };

    if (editingLink) {
      let thumbUrl = editingLink.thumbnail_url;
      if (thumbnailFile) {
        setUploadingThumb(true);
        thumbUrl = await uploadThumbnail(editingLink.id);
        setUploadingThumb(false);
      }
      const result = await onUpdate(editingLink.id, {
        title: title.trim(), url: normalizedUrl, icon,
        ...customFields,
        ...(thumbnailFile ? { thumbnail_url: thumbUrl } : {}),
      });
      if (result?.error) toast({ title: result.error.message, variant: 'destructive' });
    } else {
      const result = await onAdd({ title: title.trim(), url: normalizedUrl, icon });
      if (result?.error) toast({ title: result.error.message, variant: 'destructive' });
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
              {links.map((link, index) => {
                // Show section header if this link starts a new section
                const prevLink = index > 0 ? links[index - 1] : null;
                const showSectionHeader = link.section_title && 
                  (!prevLink || prevLink.section_title !== link.section_title);

                return (
                  <div key={link.id}>
                    {showSectionHeader && (
                      <div className="flex items-center gap-2 pt-4 pb-1 first:pt-0">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                          {link.section_title}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <Draggable draggableId={link.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 flex items-center gap-3 transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          {link.bg_color && (
                            <div 
                              className="w-3 h-8 rounded-full shrink-0" 
                              style={{ backgroundColor: link.bg_color }}
                            />
                          )}
                          {link.thumbnail_url && (
                            <img src={link.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium truncate text-foreground">{link.title}</p>
                              {link.section_title && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 truncate max-w-[80px]">
                                  {link.section_title}
                                </span>
                              )}
                            </div>
                            {link.description && (
                              <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground/60 truncate">{link.url}</p>
                          </div>
                          {link.style !== 'default' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 capitalize">
                              {link.style}
                            </span>
                          )}
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
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingLink ? t('dashboard.editLink') : t('dashboard.addLink')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label>{t('dashboard.linkTitle')}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Ex: OnlyFans - Marie" />
            </div>

            {/* Description / Creator name */}
            <div className="space-y-2">
              <Label>Description / Nom de la créatrice</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                maxLength={200} 
                placeholder="Ex: @marie_official • Top 1% 🔥"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label>{t('dashboard.linkUrl')}</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} maxLength={500} placeholder="https://example.com" />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Photo / Thumbnail</Label>
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
                  <span>Ajouter une photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
              )}
            </div>

            {/* Customization toggle */}
            <button
              type="button"
              onClick={() => setShowCustomization(!showCustomization)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Palette className="w-4 h-4" />
              {showCustomization ? 'Masquer la personnalisation' : 'Personnaliser le style'}
            </button>

            {showCustomization && (
              <div className="space-y-4 p-4 rounded-xl bg-muted/50 border border-border">
                {/* Section / Category */}
                <div className="space-y-2">
                  <Label>Section / Catégorie</Label>
                  <Input 
                    value={sectionTitle} 
                    onChange={(e) => setSectionTitle(e.target.value)} 
                    maxLength={50} 
                    placeholder="Ex: Marie, Réseaux sociaux, Boutique..."
                  />
                  <p className="text-xs text-muted-foreground">Les liens avec la même section seront regroupés ensemble</p>
                </div>

                {/* Link Style */}
                <div className="space-y-2">
                  <Label>Style d'affichage</Label>
                  <Select value={linkStyle} onValueChange={setLinkStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LINK_STYLES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{s.label}</span>
                            <span className="text-xs text-muted-foreground">{s.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <Label>Couleur de fond</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBgColor(bgColor === color ? '' : color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${bgColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <Input
                      type="color"
                      value={bgColor || '#000000'}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                    />
                    {bgColor && (
                      <button type="button" onClick={() => setBgColor('')} className="text-xs text-muted-foreground hover:text-foreground">
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <Label>Couleur du texte</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setTextColor(textColor === '#FFFFFF' ? '' : '#FFFFFF')}
                      className={`w-7 h-7 rounded-full border-2 bg-white transition-all ${textColor === '#FFFFFF' ? 'border-primary scale-110' : 'border-muted'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setTextColor(textColor === '#000000' ? '' : '#000000')}
                      className={`w-7 h-7 rounded-full border-2 bg-black transition-all ${textColor === '#000000' ? 'border-primary scale-110' : 'border-muted'}`}
                    />
                    <Input
                      type="color"
                      value={textColor || '#FFFFFF'}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                    />
                    {textColor && (
                      <button type="button" onClick={() => setTextColor('')} className="text-xs text-muted-foreground hover:text-foreground">
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {(bgColor || textColor) && (
                  <div className="space-y-1">
                    <Label className="text-xs">Aperçu</Label>
                    <div
                      className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium"
                      style={{
                        backgroundColor: bgColor || undefined,
                        color: textColor || undefined,
                      }}
                    >
                      <span className="flex-1 text-center">{title || 'Titre du lien'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
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