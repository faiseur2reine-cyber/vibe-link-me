import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';

// ─── Password strength ───────────────────────────────────────────────────────

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const getPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const idx = Math.min(passed, 4);
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = [
    'bg-destructive',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-primary/80',
    'bg-primary',
  ];
  return { score: passed, label: labels[idx], color: colors[idx], checks };
};

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { score, label, color, checks } = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;

  const checkItems = [
    { key: 'length',    label: '8 caractères minimum' },
    { key: 'uppercase', label: 'Une majuscule' },
    { key: 'lowercase', label: 'Une minuscule' },
    { key: 'number',    label: 'Un chiffre' },
    { key: 'special',   label: 'Un caractère spécial (!@#…)' },
  ] as const;

  return (
    <div className="space-y-2 mt-1">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-destructive' : score <= 2 ? 'text-orange-500' : score <= 3 ? 'text-yellow-600' : 'text-primary'}`}>
        {label}
      </p>
      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {checkItems.map(({ key, label }) => (
          <li key={key} className={`flex items-center gap-1.5 text-xs ${checks[key] ? 'text-primary' : 'text-muted-foreground'}`}>
            {checks[key]
              ? <Check className="w-3 h-3 shrink-0" />
              : <X className="w-3 h-3 shrink-0 opacity-50" />}
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

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
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameTimer, setUsernameTimer] = useState<NodeJS.Timeout | null>(null);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const isPasswordValid = passwordStrength.score === 5;

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: (error as Error).message, variant: 'destructive' });
      setGoogleLoading(false);
    }
  };

  const checkUsername = (value: string) => {
    setUsername(value);
    if (usernameTimer) clearTimeout(usernameTimer);
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleaned !== value) setUsername(cleaned);
    if (cleaned.length < 3) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('username').eq('username', cleaned).maybeSingle();
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);
    setUsernameTimer(timer);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const schema = z.object({ email: z.string().email().max(255), password: z.string().min(6).max(128) });
    const result = schema.safeParse({ email, password });
    if (!result.success) { toast({ title: result.error.errors[0].message, variant: 'destructive' }); setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast({ title: error.message, variant: 'destructive' });
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== 'available') return;
    if (!isPasswordValid) {
      toast({ title: 'Mot de passe trop faible', description: 'Remplissez tous les critères de sécurité.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const schema = z.object({
      email: z.string().email().max(255),
      password: z.string().min(8).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
      username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/),
      displayName: z.string().max(100).optional(),
    });
    const result = schema.safeParse({ email, password, username, displayName: displayName || undefined });
    if (!result.success) { toast({ title: result.error.errors[0].message, variant: 'destructive' }); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username, display_name: displayName || username }, emailRedirectTo: window.location.origin } });
    if (error) toast({ title: error.message, variant: 'destructive' });
    else toast({ title: t('auth.resetSent').replace('réinitialisation', 'confirmation') });
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast({ title: error.message, variant: 'destructive' });
    else toast({ title: t('auth.resetSent') });
    setLoading(false);
  };

  const GoogleButton = () => (
    <>
      <div className="relative my-4">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
          ou
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {t('auth.googleBtn')}
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">
            {tab === 'login' && t('auth.login')}
            {tab === 'signup' && t('auth.signup')}
            {tab === 'forgot' && t('auth.resetPassword')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(tab === 'login' || tab === 'signup') && t('hero.subtitle').split('.')[0] + '.'}
          </p>
        </div>

        <Card className="border-border shadow-none">
          <CardContent className="pt-6">
            {tab === 'login' && (
              <div className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : t('auth.loginBtn')}
                  </Button>
                </form>
                <GoogleButton />
                <div className="text-center space-y-2 text-sm">
                  <button type="button" onClick={() => setTab('forgot')} className="text-muted-foreground hover:text-foreground block mx-auto text-xs">
                    {t('auth.forgotPassword')}
                  </button>
                  <p className="text-muted-foreground text-xs">
                    {t('auth.noAccount')}{' '}
                    <button type="button" onClick={() => setTab('signup')} className="text-primary hover:underline font-medium">{t('auth.signupBtn')}</button>
                  </p>
                </div>
              </div>
            )}

            {tab === 'signup' && (
              <div className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('auth.username')}</Label>
                    <div className="relative">
                      <Input id="username" value={username} onChange={(e) => checkUsername(e.target.value)} placeholder="mon-pseudo" required minLength={3} maxLength={30} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        {usernameStatus === 'available' && <Check className="w-4 h-4 text-primary" />}
                        {usernameStatus === 'taken' && <X className="w-4 h-4 text-destructive" />}
                      </div>
                    </div>
                    {usernameStatus === 'taken' && <p className="text-xs text-destructive">{t('auth.usernameTaken')}</p>}
                    {usernameStatus === 'available' && <p className="text-xs text-primary">{t('auth.usernameAvailable')}</p>}
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
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <PasswordStrengthMeter password={password} />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || usernameStatus !== 'available' || !isPasswordValid}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : t('auth.signupBtn')}
                  </Button>
                </form>
                <GoogleButton />
                <p className="text-center text-xs text-muted-foreground">
                  {t('auth.hasAccount')}{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-primary hover:underline font-medium">{t('auth.loginBtn')}</button>
                </p>
              </div>
            )}

            {tab === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t('auth.email')}</Label>
                  <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : t('auth.sendReset')}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  <button type="button" onClick={() => setTab('login')} className="text-primary hover:underline font-medium">{t('auth.loginBtn')}</button>
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

