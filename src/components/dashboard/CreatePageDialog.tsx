import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CreatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePage: (username: string, displayName?: string) => Promise<{ data?: any; error: any }>;
}

const CreatePageDialog = ({ open, onOpenChange, onCreatePage }: CreatePageDialogProps) => {
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
    const result = await onCreatePage(username, displayName || undefined);
    if (result.error) {
      toast({ title: result.error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Page créée ! 🎉' });
      onOpenChange(false);
      setUsername('');
      setDisplayName('');
      setUsernameStatus('idle');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Nouvelle page créateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Username (URL publique)</Label>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => checkUsername(e.target.value)}
                placeholder="nom-createur"
                required
                minLength={3}
                maxLength={30}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {usernameStatus === 'available' && <Check className="w-4 h-4 text-green-500" />}
                {usernameStatus === 'taken' && <X className="w-4 h-4 text-destructive" />}
              </div>
            </div>
            {usernameStatus === 'available' && (
              <p className="text-xs text-green-500">mytaptap.com/{username} est disponible ✓</p>
            )}
            {usernameStatus === 'taken' && (
              <p className="text-xs text-destructive">Ce username est déjà pris</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Nom affiché</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Prénom ou pseudo"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={saving || usernameStatus !== 'available'}
              className="w-full"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer la page'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePageDialog;
