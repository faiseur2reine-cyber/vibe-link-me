import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TapLoader as Loader2, TapCheck as Check, TapX as X } from '@/components/icons/TapIcons';
import { supabase } from '@/integrations/supabase/client';

interface CreatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePage: (pageData: { username: string; display_name?: string }) => Promise<{ data?: any; error: any }>;
  onCreated?: (pageId: string) => void;
}

const CreatePageDialog = ({ open, onOpenChange, onCreatePage, onCreated }: CreatePageDialogProps) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const checkUsername = (value: string) => {
    if (timer) clearTimeout(timer);
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);
    if (cleaned.length < 3) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const t = setTimeout(async () => {
      const { data } = await supabase.from('creator_pages').select('username').eq('username', cleaned).maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);
    setTimer(t);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== 'available') return;
    setSaving(true);
    const result = await onCreatePage({
      username,
      display_name: displayName || undefined,
    });
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success('Page créée ! 🎉');
      onOpenChange(false);
      setUsername(''); setDisplayName(''); setUsernameStatus('idle');
      if (result.data?.id && onCreated) onCreated(result.data.id);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold font-display">Nouvelle page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-[12px]">Username</Label>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => checkUsername(e.target.value)}
                placeholder="nom-createur"
                required minLength={3} maxLength={30}
                className="h-8 text-[13px] pr-8"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                {usernameStatus === 'available' && <Check className="w-3 h-3 text-primary" />}
                {usernameStatus === 'taken' && <X className="w-3 h-3 text-destructive" />}
              </div>
            </div>
            {usernameStatus === 'available' && (
              <p className="text-[11px] text-primary">mytaptap.com/{username} est disponible</p>
            )}
            {usernameStatus === 'taken' && (
              <p className="text-[11px] text-destructive">Ce username est déjà pris</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Nom affiché</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Prénom ou pseudo"
              className="h-8 text-[13px]"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={saving || usernameStatus !== 'available'}
              className="w-full h-8 text-[12px] shadow-none"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Créer la page'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePageDialog;
