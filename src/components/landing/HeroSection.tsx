import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { TapArrowRight as ArrowRight, TapCheck as Check, TapX as X, TapLoader as Loader2 } from '@/components/icons/TapIcons';
import { supabase } from '@/integrations/supabase/client';

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [checkTimer, setCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Phone mockup 3D tilt
  const phoneRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = phoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const handleUsernameChange = (value: string) => {
    if (checkTimer) clearTimeout(checkTimer);
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);

    if (cleaned.length < 3) {
      setStatus('idle');
      return;
    }

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
    if (username.length < 3) {
      inputRef.current?.focus();
      return;
    }
    navigate(`/auth?tab=signup&username=${encodeURIComponent(username)}`);
  };

  const mockLinks = [
    { label: 'OnlyFans', color: '#00AFF0' },
    { label: 'Instagram', color: '#E1306C' },
    { label: 'Telegram', color: '#229ED9' },
    { label: 'YouTube', color: '#FF0000' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-pop-yellow/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -top-20 -right-32 w-[400px] h-[400px] bg-pop-coral/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-pop-violet/8 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative px-4 sm:px-6 pt-20 sm:pt-32 pb-20 sm:pb-36 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* ── Left — Copy + optin ── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex-1 text-center lg:text-left max-w-xl"
          >
            {/* Title */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-[-0.04em] leading-[1.08] text-foreground"
            >
              Ton link-in-bio.{' '}
              <span className="text-pop-gradient">
                En 30 secondes.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="mt-5 text-muted-foreground text-[15px] sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0"
            >
              Deeplinks, analytics, safe page, urgency widgets. Tout ce dont un créateur a besoin, gratuit.
            </motion.p>

            {/* ── Username claim input ── */}
            <motion.div variants={item} className="mt-8">
              <div className="flex items-center max-w-md mx-auto lg:mx-0">
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
                  {/* Status indicator */}
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
              <div className="h-5 mt-2 text-center lg:text-left">
                {status === 'available' && username.length >= 3 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[12px] text-emerald-600 font-medium"
                  >
                    mytaptap.com/{username} est disponible
                  </motion.p>
                )}
                {status === 'taken' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[12px] text-red-500 font-medium"
                  >
                    Ce nom est déjà pris, essaie un autre
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={item} className="mt-4 flex items-center gap-5 justify-center lg:justify-start text-[12px] text-muted-foreground/50 font-medium">
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
          </motion.div>

          {/* ── Right — Phone mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="flex-shrink-0 hidden md:block"
            style={{ perspective: 1000 }}
          >
            <motion.div
              ref={phoneRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative w-[260px]"
            >
              {/* Glow */}
              <div className="absolute -inset-12 bg-gradient-to-br from-pop-violet/12 via-pop-coral/8 to-pop-yellow/8 rounded-full blur-3xl" />

              {/* Phone frame */}
              <div className="relative rounded-[2.2rem] border-2 border-border/50 bg-black overflow-hidden shadow-2xl shadow-black/20">
                {/* Notch */}
                <div className="h-7 bg-black flex items-center justify-center">
                  <div className="w-16 h-[4px] rounded-full bg-white/10" />
                </div>

                {/* Content — immersive style */}
                <div className="relative">
                  {/* Hero gradient (simulating cover photo) */}
                  <div className="h-36 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-0 right-0 text-center">
                      <p className="text-white text-[13px] font-bold tracking-tight">
                        {username || 'tonnom'}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-white/40 text-[9px]">Active now</span>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="px-3 pt-4 pb-6 space-y-2 bg-black">
                    {mockLinks.map((link, i) => (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08, ease }}
                        className="flex items-center gap-2.5 bg-white rounded-full px-3 py-2.5"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: link.color }}
                        >
                          <span className="text-white text-[8px] font-bold">{link.label[0]}</span>
                        </div>
                        <span className="text-black text-[11px] font-semibold truncate">{link.label}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-black/20 ml-auto shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.4, ease }}
                className="absolute -left-14 top-16 hidden lg:block bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 shadow-lg rotate-[-2deg]"
              >
                <p className="text-[11px] font-bold text-foreground">+2,847 clics</p>
                <p className="text-[9px] text-muted-foreground">cette semaine</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.4, ease }}
                className="absolute -right-12 bottom-24 hidden lg:block bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 shadow-lg rotate-[2deg]"
              >
                <p className="text-[11px] font-bold text-emerald-500">Safe page ✓</p>
                <p className="text-[9px] text-muted-foreground">anti-bot actif</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
