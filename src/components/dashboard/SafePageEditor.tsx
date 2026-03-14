import { useState, useEffect } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ShieldCheck, Check } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

interface SafePageEditorProps {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const SafePageEditor = ({ page, onUpdate }: SafePageEditorProps) => {
  const [enabled, setEnabled] = useState(page.safe_page_enabled ?? false);
  const [redirectUrl, setRedirectUrl] = useState(page.safe_page_redirect_url || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEnabled(page.safe_page_enabled ?? false);
    setRedirectUrl(page.safe_page_redirect_url || '');
  }, [page.id, page.safe_page_enabled, page.safe_page_redirect_url]);

  const triggerSave = useAutoSave(async () => {
    const result = await onUpdate({
      safe_page_enabled: enabled,
      safe_page_redirect_url: redirectUrl,
    });
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(result.error.message);
    }
  }, 1500);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-muted/30">
        <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-[12px] font-medium">Page de couverture sécurisée</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Quand activée, les visiteurs verront d'abord une page neutre (couverture). 
            Ils pourront cliquer pour accéder à votre vraie page ou être redirigés vers une URL sûre.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[12px]">Activer la Safe Page</Label>
        <Switch checked={enabled} onCheckedChange={(v) => { setEnabled(v); triggerSave(); }} />
      </div>

      {enabled && (
        <div className="space-y-2">
          <Label className="text-[12px]">URL de redirection sûre</Label>
          <Input
            value={redirectUrl}
            onChange={e => { setRedirectUrl(e.target.value); triggerSave(); }}
            placeholder="https://google.com"
            className="h-8 text-[12px]"
          />
          <p className="text-[10px] text-muted-foreground">
            L'URL vers laquelle le bouton "Quitter" redirigera les visiteurs.
          </p>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <Check className="w-3 h-3" /> Sauvegardé
        </div>
      )}
    </div>
  );
};

export default SafePageEditor;
