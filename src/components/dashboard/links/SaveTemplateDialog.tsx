import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkItem } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TapBookmark as BookmarkPlus, TapLoader as Loader2 } from '@/components/icons/TapIcons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: LinkItem[];
}

const SaveTemplateDialog = ({ open, onOpenChange, links }: SaveTemplateDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !name.trim() || links.length === 0) return;
    setSaving(true);
    const templateLinks = links.map(l => ({
      title: l.title, url: l.url, icon: l.icon, style: l.style,
      section_title: l.section_title, description: l.description,
      bg_color: l.bg_color, text_color: l.text_color,
    }));
    const { error } = await supabase.from('custom_templates').insert({
      user_id: user.id, name: name.trim(),
      description: desc.trim() || null, links: templateLinks as any,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('linksManager.templateSaved'));
      onOpenChange(false);
      setName('');
      setDesc('');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Setup Marie" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('linksManager.description')}</Label>
            <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optionnel" className="h-9" />
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
          <Button variant="ghost" onClick={() => onOpenChange(false)} size="sm">{t('dashboard.cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()} size="sm">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('dashboard.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTemplateDialog;
