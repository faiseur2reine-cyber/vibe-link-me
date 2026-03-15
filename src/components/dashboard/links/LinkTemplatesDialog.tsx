import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TapLayout as LayoutTemplate } from '@/components/icons/TapIcons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLinkTemplates, type CustomTemplate, type TemplateLink } from './linkTemplates';
import TemplateCard from './TemplateCard';

interface LinkTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linksCount: number;
  pageId?: string;
  onRefetch?: () => Promise<void>;
}

const LinkTemplatesDialog = ({ open, onOpenChange, linksCount, pageId, onRefetch }: LinkTemplatesDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const LINK_TEMPLATES = useLinkTemplates(t);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (open && user) {
      supabase
        .from('custom_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setCustomTemplates(data as unknown as CustomTemplate[]);
        });
    }
  }, [open, user]);

  const applyTemplateLinks = async (templateLinks: TemplateLink[]) => {
    if (!user) return;
    const toInsert = templateLinks;
    setApplying(true);
    const inserts = toInsert.map((tl, idx) => ({
      title: tl.title, url: tl.url, icon: tl.icon, user_id: user.id,
      position: linksCount + idx, style: tl.style,
      section_title: tl.section_title, description: tl.description,
      bg_color: tl.bg_color, text_color: tl.text_color,
      ...(pageId ? { page_id: pageId } : {}),
    }));
    const { error } = await supabase.from('links').insert(inserts);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('linksManager.templateApplied'));
      if (onRefetch) await onRefetch();
    }
    setApplying(false);
    onOpenChange(false);
  };

  const handleDeleteCustomTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('custom_templates').delete().eq('id', id);
    if (!error) {
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
      toast.success(t('linksManager.templateDeleted'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    loading={applying}
                    onApply={() => applyTemplateLinks(template.links)}
                    onDelete={(e) => handleDeleteCustomTemplate(template.id, e)}
                  />
                ))}
              </div>
            </div>
          )}

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
                  loading={applying}
                  onApply={() => applyTemplateLinks(template.links)}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkTemplatesDialog;
