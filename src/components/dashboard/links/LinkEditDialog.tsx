import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkItem } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  TapLoader as Loader2, TapImagePlus as ImagePlus, TapX as X,
  TapPalette as Palette, TapChevronDown as ChevronDown, TapClock as Clock,
} from '@/components/icons/TapIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { detectPlatform } from '@/lib/platforms';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface LinkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLink: LinkItem | null;
  onAdd: (link: { title: string; url: string; icon: string }) => Promise<{ error: any } | undefined>;
  onUpdate: (id: string, updates: Partial<LinkItem>) => Promise<{ error: any } | undefined>;
  linksCount: number;
  onFirstLink?: () => void;
}

const LinkEditDialog = ({ open, onOpenChange, editingLink, onAdd, onUpdate, linksCount, onFirstLink }: LinkEditDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
  const [scheduledAt, setScheduledAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Populate fields when editing or reset when adding
  useEffect(() => {
    if (!open) return;
    if (editingLink) {
      setTitle(editingLink.title);
      setUrl(editingLink.url);
      setIcon(editingLink.icon);
      setDescription(editingLink.description || '');
      setBgColor(editingLink.bg_color || '');
      setTextColor(editingLink.text_color || '');
      setLinkStyle(editingLink.style || 'default');
      setSectionTitle(editingLink.section_title || '');
      setThumbnailFile(null);
      setThumbnailPreview(editingLink.thumbnail_url || null);
      setScheduledAt(editingLink.scheduled_at ? editingLink.scheduled_at.slice(0, 16) : '');
      setExpiresAt(editingLink.expires_at ? editingLink.expires_at.slice(0, 16) : '');
      setShowCustomization(!!(editingLink.bg_color || editingLink.text_color || editingLink.description || editingLink.style !== 'default' || editingLink.section_title || editingLink.scheduled_at || editingLink.expires_at));
    } else {
      setTitle(''); setUrl(''); setIcon('link');
      setDescription(''); setBgColor(''); setTextColor('');
      setLinkStyle('default'); setSectionTitle('');
      setThumbnailFile(null); setThumbnailPreview(null);
      setShowCustomization(false); setScheduledAt(''); setExpiresAt('');
    }
  }, [open, editingLink]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('linksManager.imageTooLarge'));
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

  const handleRemoveThumbnail = async () => {
    if (editingLink) await onUpdate(editingLink.id, { thumbnail_url: null } as any);
    setThumbnailFile(null);
    setThumbnailPreview(null);
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
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
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
      if (result?.error) toast.error(result.error.message);
    } else {
      const result = await onAdd({ title: title.trim(), url: normalizedUrl, icon });
      if (result?.error) {
        toast.error(result.error.message);
      } else if (linksCount === 0 && onFirstLink) {
        onFirstLink();
      }
    }
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {editingLink ? t('dashboard.editLink') : t('dashboard.addLink')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('dashboard.linkTitle')}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Ex: OnlyFans - Marie" className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('dashboard.linkUrl')}</Label>
            <Input
              value={url}
              onChange={(e) => {
                const newUrl = e.target.value;
                setUrl(newUrl);
                if (!editingLink) {
                  const platform = detectPlatform(newUrl);
                  if (platform) {
                    if (!title || title === '') setTitle(platform.name);
                    if (!bgColor) setBgColor(platform.bgColor);
                    if (!textColor) setTextColor(platform.textColor);
                    if (linkStyle === 'default' && platform.style === 'featured') setLinkStyle('featured');
                  }
                }
              }}
              maxLength={500} placeholder="https://example.com" className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('linksManager.description')}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} placeholder="Ex: @marie_official • Top 1% 🔥" rows={2} className="resize-none text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('linksManager.photo')}</Label>
            {thumbnailPreview ? (
              <div className="relative w-full h-28 rounded-lg overflow-hidden bg-muted">
                <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={handleRemoveThumbnail} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center hover:bg-foreground/80 transition-colors">
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

          <button type="button" onClick={() => setShowCustomization(!showCustomization)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Palette className="w-3.5 h-3.5" />
            {t('linksManager.advancedCustomization')}
            <ChevronDown className={`w-3 h-3 transition-transform ${showCustomization ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCustomization && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="space-y-4 p-3 rounded-lg bg-muted/40 border border-border">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t('linksManager.section')}</Label>
                    <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} maxLength={50} placeholder={t('linksManager.sectionPlaceholder')} className="h-8 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t('linksManager.style')}</Label>
                    <Select value={linkStyle} onValueChange={setLinkStyle}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LINK_STYLES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t('linksManager.background')}</Label>
                      <div className="flex items-center gap-1 flex-wrap">
                        {PRESET_COLORS.map(color => (
                          <button key={color} type="button" onClick={() => setBgColor(bgColor === color ? '' : color)}
                            className={`w-5 h-5 rounded-full transition-all ${bgColor === color ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid hsl(var(--border))' : undefined }} />
                        ))}
                        {bgColor && <button type="button" onClick={() => setBgColor('')} className="text-[10px] text-muted-foreground hover:text-foreground ml-1">✕</button>}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t('linksManager.textColor')}</Label>
                      <div className="flex items-center gap-1 flex-wrap">
                        {['#FFFFFF', '#000000'].map(color => (
                          <button key={color} type="button" onClick={() => setTextColor(textColor === color ? '' : color)}
                            className={`w-5 h-5 rounded-full transition-all ${textColor === color ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid hsl(var(--border))' : undefined }} />
                        ))}
                        <Input type="color" value={textColor || '#FFFFFF'} onChange={(e) => setTextColor(e.target.value)} className="w-5 h-5 p-0 border-0 cursor-pointer rounded-full overflow-hidden" />
                        {textColor && <button type="button" onClick={() => setTextColor('')} className="text-[10px] text-muted-foreground hover:text-foreground ml-1">✕</button>}
                      </div>
                    </div>
                  </div>

                  {(bgColor || textColor) && (
                    <div className="flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-medium" style={{ backgroundColor: bgColor || undefined, color: textColor || undefined }}>
                      {title || t('linksManager.linkPreview')}
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Programmation
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Apparition</span>
                        <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-7 text-[11px]" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Expiration</span>
                        <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-7 text-[11px]" />
                      </div>
                    </div>
                    {(scheduledAt || expiresAt) && (
                      <button type="button" onClick={() => { setScheduledAt(''); setExpiresAt(''); }} className="text-[10px] text-muted-foreground hover:text-foreground">
                        ✕ Retirer la programmation
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} size="sm" className="rounded-lg">{t('dashboard.cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !url.trim()} size="sm" className="rounded-lg">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('dashboard.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkEditDialog;
