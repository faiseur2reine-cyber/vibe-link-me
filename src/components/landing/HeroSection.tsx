import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TapArrowRight as ArrowRight, TapCheck as Check, TapX as X, TapLoader as Loader2 } from '@/components/icons/TapIcons';
import { supabase } from '@/integrations/supabase/client';
import { Zap, BarChart3, ShieldCheck, Smartphone, Palette, Globe, Clock, Users } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const FEATURES = [
  { icon: Smartphone, label: 'Deeplinks', desc: 'Sort d\'Instagram, TikTok, Snapchat automatiquement' },
  { icon: BarChart3, label: 'Analytics', desc: 'Clics, pays, referrers, conversion rate' },
  { icon: ShieldCheck, label: 'Safe page', desc: 'Redirect anti-bot pour protéger tes liens' },
  { icon: Zap, label: 'Urgency widgets', desc: 'Countdown, scarcity, live viewers' },
  { icon: Palette, label: 'Design immersive', desc: 'Hero plein écran, boutons pill, custom CSS' },
  { icon: Users, label: 'Multi-pages', desc: 'Gère plusieurs créateurs depuis un compte' },
  { icon: Globe, label: 'Tracking pixels', desc: 'Meta Pixel, GA4, TikTok Pixel, UTM auto' },
  { icon: Clock, label: 'Scheduling', desc: 'Programme l\'apparition et l\'expiration des liens' },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [checkTimer, setCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUsernameChange = (value: string) => {
    if (checkTimer) clearTimeout(checkTimer);
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);
    if (cleaned.length < 3) { setStatus('idle'); return; }
    setStatus('checking');
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleaned)
        .maybeSingle();
      setStatus(data ? 'taken' : 'available');
    }, 400);
    setCheckTimer(timer);
  };

  const handleClaim = () => {
    if (username.length < 3) { inputRef.current?.focus(); return; }
    navigate(`/auth?tab=signup&username=${encodeURIComponent(username)}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-pop-yellow/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -top-20 -right-32 w-[400px] h-[400px] bg-pop-coral/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-pop-violet/8 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24 max-w-3xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          {/* Title */}
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[1.08] text-foreground"
          >
            Ton link-in-bio.{' '}
            <span className="text-pop-gradient">En 30 secondes.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="mt-5 text-muted-foreground text-[15px] sm:text-base leading-relaxed max-w-lg mx-auto"
          >
            Tout ce dont un créateur a besoin pour convertir son audience. Gratuit, sans limites cachées.
          </motion.p>

          {/* ── Username claim ── */}
          <motion.div variants={item} className="mt-8">
            <div className="flex items-center max-w-md mx-auto">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground/40 font-medium select-none pointer-events-none">
                  mytaptap.com/
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
                  placeholder="tonnom"
                  maxLength={30}
                  className="w-full h-14 pl-[128px] pr-12 text-[15px] font-semibold text-foreground bg-card border-2 border-border/60 rounded-2xl rounded-r-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/25"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />}
                  {status === 'available' && <Check className="w-4 h-4 text-emerald-500" />}
                  {status === 'taken' && <X className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              <button
                onClick={handleClaim}
                className="h-14 px-6 bg-primary text-primary-foreground text-[14px] font-bold rounded-2xl rounded-l-none border-2 border-primary hover:bg-primary/90 transition-all active:scale-[0.97] flex items-center gap-2 shrink-0"
              >
                C'est parti
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Status message */}
            <div className="h-5 mt-2">
              {status === 'available' && username.length >= 3 && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-emerald-600 font-medium">
                  mytaptap.com/{username} est disponible
                </motion.p>
              )}
              {status === 'taken' && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-red-500 font-medium">
                  Ce nom est déjà pris, essaie un autre
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={item} className="mt-3 flex items-center gap-5 justify-center text-[12px] text-muted-foreground/50 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Gratuit pour toujours
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              Setup en 30s
            </span>
          </motion.div>

          {/* ── Features grid ── */}
          <motion.div
            variants={item}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 text-left max-w-2xl mx-auto"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                className="group"
              >
                <f.icon className="w-4 h-4 text-muted-foreground/40 mb-2 group-hover:text-foreground/60 transition-colors" />
                <p className="text-[13px] font-semibold text-foreground leading-tight">{f.label}</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5 leading-snug">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
