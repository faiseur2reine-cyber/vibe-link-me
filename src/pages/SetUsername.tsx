import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X } from 'lucide-react';

const SetUsername = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameTimer, setUsernameTimer] = useState<NodeJS.Timeout | null>(null);

  const checkUsername = (value: string) => {
    if (usernameTimer) clearTimeout(usernameTimer);
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);
    if (cleaned.length < 3) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('username').eq('username', cleaned).maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);
    setUsernameTimer(timer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || usernameStatus !== 'available') return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ username, display_name: displayName || username })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: error.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MyTaptap
          </span>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">{t('auth.username')}</CardTitle>
            <CardDescription>Choisissez un nom d'utilisateur unique pour votre page publique.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('auth.username')}</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => checkUsername(e.target.value)}
                    placeholder="mon-pseudo"
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
                {usernameStatus === 'taken' && <p className="text-xs text-destructive">{t('auth.usernameTaken')}</p>}
                {usernameStatus === 'available' && <p className="text-xs text-green-500">{t('auth.usernameAvailable')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('auth.displayName')}</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={saving || usernameStatus !== 'available'}
              >
                {saving ? <Loader2 className="animate-spin" /> : t('dashboard.save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetUsername;
