import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkItem } from '@/hooks/useDashboard';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Plus, GripVertical, Pencil, Trash2, ExternalLink, Loader2,
  ImagePlus, X, Palette, LayoutTemplate, BookmarkPlus, ChevronDown, Link as LinkIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { detectPlatform } from '@/lib/platforms';
import LinkFavicon from '@/components/LinkFavicon';

interface CustomTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  links: Array<{ title: string; url: string; icon: string; style: string; section_title: string | null; description: string | null; bg_color: string | null; text_color: string | null }>;
  created_at: string;
}

const useLinkTemplates = (t: (key: string) => string) => [
  {
    id: 'onlyfans-creator',
    name: '🔥 OnlyFans Creator',
    desc: t('linksManager.tplOnlyfansDesc'),
    gradient: 'from-sky-400 to-blue-500',
    links: [
      { title: 'OnlyFans', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplOnlyfansSub'), bg_color: '#1BAFE8', text_color: '#FFFFFF' },
      { title: 'OnlyFans VIP', url: 'https://onlyfans.com/', icon: 'link', style: 'default', section_title: null, description: t('linksManager.tplOnlyfansSub'), bg_color: '#FFFFFF', text_color: '#B05A90' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'Twitter / X', url: 'https://x.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#0F1419', text_color: '#FFFFFF' },
      { title: 'Telegram', url: 'https://t.me/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#229ED9', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'content-creator',
    name: '🎬 Content Creator',
    desc: t('linksManager.tplCreatorDesc'),
    gradient: 'from-red-500 to-pink-500',
    links: [
      { title: 'YouTube', url: 'https://youtube.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplYoutubeSub'), bg_color: '#FF1E1E', text_color: '#FFFFFF' },
      { title: 'Join Membership', url: 'https://youtube.com/', icon: 'link', style: 'default', section_title: null, description: t('linksManager.tplYoutubeSub'), bg_color: '#FFFFFF', text_color: '#CC334E' },
      { title: 'Twitch', url: 'https://twitch.tv/', icon: 'link', style: 'default', section_title: t('linksManager.sectionLive'), description: null, bg_color: '#9146FF', text_color: '#FFFFFF' },
      { title: 'TikTok', url: 'https://tiktok.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#000000', text_color: '#FFFFFF' },
      { title: 'Discord', url: 'https://discord.gg/', icon: 'link', style: 'default', section_title: t('linksManager.sectionCommunity'), description: t('linksManager.tplDiscordSub'), bg_color: '#5865F2', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'agency-multi',
    name: '🏢 ' + t('linksManager.tplAgencyName'),
    desc: t('linksManager.tplAgencyDesc'),
    gradient: 'from-violet-500 to-purple-600',
    links: [
      { title: 'OnlyFans — Creator 1', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Creator 1', description: '@creator1 · Top Creator 🌟', bg_color: '#1BAFE8', text_color: '#FFFFFF' },
      { title: 'Instagram — Creator 1', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Creator 1', description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'OnlyFans — Creator 2', url: 'https://onlyfans.com/', icon: 'link', style: 'featured', section_title: 'Creator 2', description: '@creator2 · Exclusive Content 💎', bg_color: '#111827', text_color: '#FFFFFF' },
      { title: 'Instagram — Creator 2', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: 'Creator 2', description: null, bg_color: '#FFFFFF', text_color: '#B05A90' },
    ],
  },
  {
    id: 'music-artist',
    name: '🎵 ' + t('linksManager.tplMusicName'),
    desc: t('linksManager.tplMusicDesc'),
    gradient: 'from-emerald-400 to-teal-500',
    links: [
      { title: 'Spotify', url: 'https://open.spotify.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplSpotifySub'), bg_color: '#1DB954', text_color: '#FFFFFF' },
      { title: 'Pre-save New Track', url: 'https://example.com/', icon: 'link', style: 'default', section_title: null, description: t('linksManager.tplSpotifySub'), bg_color: '#FFFFFF', text_color: '#1E7A52' },
      { title: 'Apple Music', url: 'https://music.apple.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionMusic'), description: null, bg_color: '#FA243C', text_color: '#FFFFFF' },
      { title: 'SoundCloud', url: 'https://soundcloud.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionMusic'), description: null, bg_color: '#FF5500', text_color: '#FFFFFF' },
      { title: t('linksManager.tplBooking'), url: 'mailto:booking@example.com', icon: 'link', style: 'default', section_title: 'Business', description: t('linksManager.tplBookingSub'), bg_color: '#111827', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'ecommerce',
    name: '🛍️ E-commerce',
    desc: t('linksManager.tplEcommerceDesc'),
    gradient: 'from-amber-400 to-orange-500',
    links: [
      { title: t('linksManager.myShop'), url: 'https://shopify.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.discoverCollection'), bg_color: '#111827', text_color: '#FFFFFF' },
      { title: t('linksManager.newDrop'), url: 'https://example.com/drop', icon: 'link', style: 'default', section_title: t('linksManager.sectionProducts'), description: t('linksManager.limitedCollection'), bg_color: '#FFFFFF', text_color: '#8C5A22' },
      { title: t('linksManager.promo20'), url: 'https://example.com/promo', icon: 'link', style: 'default', section_title: t('linksManager.sectionProducts'), description: 'Code: MYTAPTAP20', bg_color: '#EF4444', text_color: '#FFFFFF' },
      { title: 'Instagram Shop', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
    ],
  },
  {
    id: 'fitness-coach',
    name: '💪 ' + t('linksManager.tplFitnessName'),
    desc: t('linksManager.tplFitnessDesc'),
    gradient: 'from-lime-400 to-green-500',
    links: [
      { title: t('linksManager.tplCoaching'), url: 'https://cal.com/', icon: 'link', style: 'featured', section_title: null, description: t('linksManager.tplCoachingSub'), bg_color: '#10B981', text_color: '#FFFFFF' },
      { title: t('linksManager.tplPrograms'), url: 'https://example.com/programs', icon: 'link', style: 'default', section_title: t('linksManager.sectionPrograms'), description: null, bg_color: '#FFFFFF', text_color: '#158A64' },
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: null, bg_color: '#E4405F', text_color: '#FFFFFF' },
      { title: 'YouTube', url: 'https://youtube.com/', icon: 'link', style: 'default', section_title: t('linksManager.sectionSocial'), description: t('linksManager.tplWorkoutSub'), bg_color: '#FF1E1E', text_color: '#FFFFFF' },
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
  pageId?: string;
}

const LINK_STYLES = [
  { value: 'default', label: 'Standard' },
  { value: 'featured', label: 'Featured' },
  { value: 'card', label: 'Card' },
  { value: 'minimal', label: 'Minimal' },
];

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
];

const LinksManager = ({ links, plan, onAdd, onUpdate, onDelete, onReorder, onRefetch, pageId }: LinksManagerProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const LINK_TEMPLATES = useLinkTemplates(t);
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
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const maxLinks = plan === 'pro' ? Infinity : plan === 'starter' ? 20 : 5;
  const canAddMore = links.length < maxLinks;

  // --- Template logic ---
  const fetchCustomTemplates = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('custom_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setCustomTemplates(data as unknown as CustomTemplate[]);
  };

  const handleSaveAsTemplate = async () => {
    if (!user || !templateName.trim() || links.length === 0) return;
    setSavingTemplate(true);
    const templateLinks = links.map(l => ({
      title: l.title, url: l.url, icon: l.icon, style: l.style,
      section_title: l.section_title, description: l.description,
      bg_color: l.bg_color, text_color: l.text_color,
    }));
    const { error } = await supabase.from('custom_templates').insert({
      user_id: user.id, name: templateName.trim(),
      description: templateDesc.trim() || null, links: templateLinks as any,
    });
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('linksManager.templateSaved') });
      setSaveTemplateOpen(false);
      setTemplateName('');
      setTemplateDesc('');
      await fetchCustomTemplates();
    }
    setSavingTemplate(false);
  };

  const handleDeleteCustomTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('custom_templates').delete().eq('id', id);
    if (!error) {
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: t('linksManager.templateDeleted') });
    }
  };

  const applyTemplateLinks = async (templateLinks: Array<{ title: string; url: string; icon: string; style: string; section_title: string | null; description: string | null; bg_color: string | null; text_color: string | null }>) => {
    if (!user) return;
    const remaining = maxLinks === Infinity ? Infinity : maxLinks - links.length;
    const toInsert = templateLinks.slice(0, remaining === Infinity ? undefined : remaining);
    if (toInsert.length === 0) {
      toast({ title: t('linksManager.linkLimitReached'), variant: 'destructive' });
      return;
    }
    setApplyingTemplate(true);
    const startPosition = links.length;
    const inserts = toInsert.map((tl, idx) => ({
      title: tl.title, url: tl.url, icon: tl.icon, user_id: user.id,
      position: startPosition + idx, style: tl.style,
      section_title: tl.section_title, description: tl.description,
      bg_color: tl.bg_color, text_color: tl.text_color,
      ...(pageId ? { page_id: pageId } : {}),
    }));
    const { error } = await supabase.from('links').insert(inserts);
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('linksManager.templateApplied') });
      if (onRefetch) await onRefetch();
    }
    setApplyingTemplate(false);
    setTemplateDialogOpen(false);
  };

  // --- Link CRUD ---
  const openNew = () => {
    if (!canAddMore) {
      toast({ title: t(plan === 'starter' ? 'dashboard.maxLinks20' : 'dashboard.maxLinks5'), variant: 'destructive' });
      return;
    }
    setEditingLink(null); setTitle(''); setUrl(''); setIcon('link');
    setDescription(''); setBgColor(''); setTextColor('');
    setLinkStyle('default'); setSectionTitle('');
    setThumbnailFile(null); setThumbnailPreview(null);
    setShowCustomization(false); setDialogOpen(true);
  };

  const openEdit = (link: LinkItem) => {
    setEditingLink(link); setTitle(link.title); setUrl(link.url); setIcon(link.icon);
    setDescription(link.description || ''); setBgColor(link.bg_color || '');
    setTextColor(link.text_color || ''); setLinkStyle(link.style || 'default');
    setSectionTitle(link.section_title || '');
    setThumbnailFile(null); setThumbnailPreview(link.thumbnail_url || null);
    setShowCustomization(!!(link.bg_color || link.text_color || link.description || link.style !== 'default' || link.section_title));
    setDialogOpen(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t('linksManager.imageTooLarge'), variant: 'destructive' });
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
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = 'https://' + normalizedUrl;

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
    if (editingLink) await onUpdate(editingLink.id, { thumbnail_url: null } as any);
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

  // --- Render ---
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              {t('dashboard.links')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {links.length}{plan !== 'pro' ? ` / ${maxLinks}` : ''} {t('linksManager.linksCount')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => { setTemplateDialogOpen(true); fetchCustomTemplates(); }}
            size="sm" variant="ghost"
            className="h-8 rounded-lg gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          {links.length > 0 && (
            <Button
              onClick={() => setSaveTemplateOpen(true)}
              size="sm" variant="ghost"
              className="h-8 rounded-lg gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('linksManager.saveAsTemplate')}</span>
            </Button>
          )}
          <Button onClick={openNew} size="sm" className="h-8 rounded-lg gap-1.5 text-xs font-medium">
            <Plus className="w-3.5 h-3.5" /> {t('linksManager.add')}
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {links.length === 0 && (
        <button
          onClick={openNew}
          className="w-full py-10 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">{t('linksManager.addFirstLink')}</span>
        </button>
      )}

      {/* Links list */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="links">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
              {links.map((link, index) => {
                const prevLink = index > 0 ? links[index - 1] : null;
                const showSectionHeader = link.section_title &&
                  (!prevLink || prevLink.section_title !== link.section_title);

                return (
                  <div key={link.id}>
                    {showSectionHeader && (
                      <div className="flex items-center gap-2 pt-3 pb-1">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                          {link.section_title}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <Draggable draggableId={link.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                            snapshot.isDragging
                              ? 'bg-card shadow-lg ring-1 ring-border scale-[1.02]'
                              : 'hover:bg-muted/60'
                          }`}
                        >
                          {/* Drag handle — bigger touch target on mobile */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground active:text-foreground transition-colors shrink-0 p-1.5 -ml-1.5 rounded-lg hover:bg-muted/50 touch-manipulation"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Color dot or thumbnail */}
                          {link.thumbnail_url ? (
                            <img src={link.thumbnail_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : link.bg_color ? (
                            <div
                              className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: link.bg_color }}
                            >
                              <LinkFavicon url={link.url} size="sm" className={link.text_color ? '' : 'text-white'} />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <LinkFavicon url={link.url} size="sm" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate leading-tight">
                              {link.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {link.description || link.url}
                            </p>
                          </div>

                          {/* Badges */}
                          <div className="hidden sm:flex items-center gap-1 shrink-0">
                            {link.style !== 'default' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                                {link.style}
                              </span>
                            )}
                          </div>

                          {/* Actions — visible on hover */}
                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => openEdit(link)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(link.id)}
                            >
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

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingLink ? t('dashboard.editLink') : t('dashboard.addLink')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('dashboard.linkTitle')}</Label>
              <Input
                value={title} onChange={(e) => setTitle(e.target.value)}
                maxLength={100} placeholder="Ex: OnlyFans - Marie"
                className="h-9"
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('dashboard.linkUrl')}</Label>
              <Input
                value={url} onChange={(e) => {
                  const newUrl = e.target.value;
                  setUrl(newUrl);
                  // Auto-detect platform and fill fields if adding new link
                  if (!editingLink) {
                    const platform = detectPlatform(newUrl);
                    if (platform) {
                      if (!title || title === 'Nouveau lien' || title === '') setTitle(platform.name);
                      if (!bgColor) setBgColor(platform.bgColor);
                      if (!textColor) setTextColor(platform.textColor);
                      if (linkStyle === 'default' && platform.style === 'featured') setLinkStyle('featured');
                    }
                  }
                }}
                maxLength={500} placeholder="https://example.com"
                className="h-9"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('linksManager.description')}</Label>
              <Textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                maxLength={200} placeholder="Ex: @marie_official • Top 1% 🔥"
                rows={2} className="resize-none text-sm"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('linksManager.photo')}</Label>
              {thumbnailPreview ? (
                <div className="relative w-full h-28 rounded-lg overflow-hidden bg-muted">
                  <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button" onClick={handleRemoveThumbnail}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full h-20 rounded-lg border border-dashed border-border cursor-pointer hover:border-primary/40 hover:bg-muted/40 transition-colors text-muted-foreground text-xs">
                  <ImagePlus className="w-4 h-4" />
                  <span>{t('linksManager.addImage')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
              )}
            </div>

            {/* Customization toggle */}
            <button
              type="button"
              onClick={() => setShowCustomization(!showCustomization)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
              {t('linksManager.advancedCustomization')}
              <ChevronDown className={`w-3 h-3 transition-transform ${showCustomization ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCustomization && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 p-3 rounded-lg bg-muted/40 border border-border">
                    {/* Section */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t('linksManager.section')}</Label>
                      <Input
                        value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)}
                        maxLength={50} placeholder={t('linksManager.sectionPlaceholder')}
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Style */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t('linksManager.style')}</Label>
                      <Select value={linkStyle} onValueChange={setLinkStyle}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LINK_STYLES.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{t('linksManager.background')}</Label>
                        <div className="flex items-center gap-1 flex-wrap">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color} type="button"
                              onClick={() => setBgColor(bgColor === color ? '' : color)}
                              className={`w-5 h-5 rounded-full transition-all ${bgColor === color ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110' : 'hover:scale-110'}`}
                              style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid hsl(var(--border))' : undefined }}
                            />
                          ))}
                          {bgColor && (
                            <button type="button" onClick={() => setBgColor('')} className="text-[10px] text-muted-foreground hover:text-foreground ml-1">✕</button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{t('linksManager.textColor')}</Label>
                        <div className="flex items-center gap-1 flex-wrap">
                          {['#FFFFFF', '#000000'].map(color => (
                            <button
                              key={color} type="button"
                              onClick={() => setTextColor(textColor === color ? '' : color)}
                              className={`w-5 h-5 rounded-full transition-all ${textColor === color ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110' : 'hover:scale-110'}`}
                              style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid hsl(var(--border))' : undefined }}
                            />
                          ))}
                          <Input
                            type="color" value={textColor || '#FFFFFF'}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-5 h-5 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                          />
                          {textColor && (
                            <button type="button" onClick={() => setTextColor('')} className="text-[10px] text-muted-foreground hover:text-foreground ml-1">✕</button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mini preview */}
                    {(bgColor || textColor) && (
                      <div
                        className="flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: bgColor || undefined, color: textColor || undefined }}
                      >
                        {title || t('linksManager.linkPreview')}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} size="sm" className="rounded-lg">
              {t('dashboard.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving || !title.trim() || !url.trim()} size="sm" className="rounded-lg">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('dashboard.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Templates Dialog ── */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border px-5 pt-5 pb-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <LayoutTemplate className="w-4.5 h-4.5 text-primary" />
                </div>
                Templates
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('linksManager.templatesSubtitle')}
            </p>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Custom templates */}
            {customTemplates.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{t('linksManager.myTemplates')}</p>
                <div className="grid grid-cols-1 gap-2">
                  {customTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      name={template.name}
                      desc={template.description}
                      links={template.links}
                      loading={applyingTemplate}
                      onApply={() => applyTemplateLinks(template.links)}
                      onDelete={(e) => handleDeleteCustomTemplate(template.id, e)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Built-in */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{t('linksManager.preConfigured')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LINK_TEMPLATES.map(template => (
                  <TemplateCard
                    key={template.id}
                    name={template.name}
                    desc={template.desc}
                    links={template.links}
                    gradient={template.gradient}
                    loading={applyingTemplate}
                    onApply={() => applyTemplateLinks(template.links)}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Save Template Dialog ── */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4" /> {t('linksManager.saveAsTemplateTitle')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">
            {t('linksManager.linksSaved', { count: links.length })}
          </p>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('linksManager.name')}</Label>
              <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Ex: Setup Marie" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('linksManager.description')}</Label>
              <Input value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} placeholder="Optionnel" className="h-9" />
            </div>
            <div className="flex flex-wrap gap-1">
              {links.slice(0, 6).map((l, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: l.bg_color || 'hsl(var(--muted))',
                    color: l.text_color || 'hsl(var(--muted-foreground))',
                  }}
                >
                  {l.title}
                </span>
              ))}
              {links.length > 6 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                  +{links.length - 6}
                </span>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSaveTemplateOpen(false)} size="sm">{t('dashboard.cancel')}</Button>
            <Button onClick={handleSaveAsTemplate} disabled={savingTemplate || !templateName.trim()} size="sm">
              {savingTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('dashboard.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Template Card sub-component ── */
function TemplateCard({
  name, desc, links, gradient, loading, onApply, onDelete,
}: {
  name: string;
  desc: string | null;
  links: Array<{ title: string; bg_color: string | null; text_color: string | null }>;
  gradient?: string;
  loading: boolean;
  onApply: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => !loading && onApply()}
      className="w-full text-left rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Visual preview strip */}
      <div className={`relative h-16 flex items-end gap-1 px-3 pb-2 overflow-hidden ${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-muted'}`}>
        <div className="absolute inset-0 bg-black/10" />
        {links.slice(0, 4).map((tl, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-semibold shadow-sm backdrop-blur-sm truncate max-w-[100px]"
            style={{
              backgroundColor: tl.bg_color || 'rgba(255,255,255,0.9)',
              color: tl.text_color || '#000',
            }}
          >
            <span className="truncate">{tl.title}</span>
          </motion.div>
        ))}
        {links.length > 4 && (
          <span className="relative text-[9px] font-bold text-white/70 px-1">
            +{links.length - 4}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3.5 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{name}</p>
          {desc && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{desc}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDelete && (
            <span
              role="button"
              onClick={onDelete}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </span>
          )}
          <span className="text-[11px] font-semibold text-primary opacity-60 group-hover:opacity-100 transition-opacity">
            {loading ? '...' : t('linksManager.apply')}
          </span>
        </div>
      </div>
    </button>
  );
}

export default LinksManager;
