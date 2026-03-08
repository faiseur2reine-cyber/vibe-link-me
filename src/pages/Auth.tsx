import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>(
    (searchParams.get('tab') as 'login' | 'signup') || 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // Username validation
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameTimer, setUsernameTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const checkUsername = (value: string) => {
    setUsername(value);
    if (usernameTimer) clearTimeout(usernameTimer);

    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleaned !== value) {
      setUsername(cleaned);
    }

    if (cleaned.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleaned)
        .maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);
    setUsernameTimer(timer);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const schema = z.object({
      email: z.string().email().max(255),
      password: z.string().min(6).max(128),
    });

    const result = schema.safeParse({ email, password });
    if (!result.success) {
      toast({ title: result.error.errors[0].message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== 'available') return;
    setLoading(true);

    const schema = z.object({
      email: z.string().email().max(255),
      password: z.string().min(6).max(128),
      username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/),
      displayName: z.string().max(100).optional(),
    });

    const result = schema.safeParse({ email, password, username, displayName: displayName || undefined });
    if (!result.success) {
      toast({ title: result.error.errors[0].message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.resetSent').replace('réinitialisation', 'confirmation') });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.resetSent') });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MyTaptap
          </span>
        </Link>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {tab === 'login' && t('auth.login')}
              {tab === 'signup' && t('auth.signup')}
              {tab === 'forgot' && t('auth.resetPassword')}
            </CardTitle>
            <CardDescription>
              {tab === 'login' && t('hero.subtitle').split('.')[0] + '.'}
              {tab === 'signup' && t('hero.subtitle').split('.')[0] + '.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Login */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : t('auth.loginBtn')}
                </Button>
                <div className="text-center space-y-2 text-sm">
                  <button type="button" onClick={() => setTab('forgot')} className="text-primary hover:underline block mx-auto">
                    {t('auth.forgotPassword')}
                  </button>
                  <p className="text-muted-foreground">
                    {t('auth.noAccount')}{' '}
                    <button type="button" onClick={() => setTab('signup')} className="text-primary hover:underline">
                      {t('auth.signupBtn')}
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Signup */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
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
                  {usernameStatus === 'taken' && (
                    <p className="text-xs text-destructive">{t('auth.usernameTaken')}</p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-xs text-green-500">{t('auth.usernameAvailable')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">{t('auth.displayName')}</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  disabled={loading || usernameStatus !== 'available'}
                >
                  {loading ? <Loader2 className="animate-spin" /> : t('auth.signupBtn')}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t('auth.hasAccount')}{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-primary hover:underline">
                    {t('auth.loginBtn')}
                  </button>
                </p>
              </form>
            )}

            {/* Forgot Password */}
            {tab === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t('auth.email')}</Label>
                  <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : t('auth.sendReset')}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <button type="button" onClick={() => setTab('login')} className="text-primary hover:underline">
                    {t('auth.loginBtn')}
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
