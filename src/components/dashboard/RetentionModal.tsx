import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TapSparkles as Sparkles, TapX as X } from '@/components/icons/TapIcons';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'retention_modal_dismissed';
const SIGNUP_KEY = 'user_first_seen';
const DAYS_BEFORE_SHOW = 7;

/**
 * Shows a retention/upgrade modal after 7 days of usage for free users.
 */
const RetentionModal = () => {
  const { subscription, user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user || subscription.plan !== 'free' || subscription.loading) return;

    // Track first seen date
    const firstSeen = localStorage.getItem(SIGNUP_KEY);
    if (!firstSeen) {
      localStorage.setItem(SIGNUP_KEY, new Date().toISOString());
      return;
    }

    // Check if already dismissed recently (30 days cooldown)
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismiss = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 30) return;
    }

    // Show after DAYS_BEFORE_SHOW days
    const daysSinceSignup = (Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceSignup >= DAYS_BEFORE_SHOW) {
      const timer = setTimeout(() => setShow(true), 3000); // 3s delay after page load
      return () => clearTimeout(timer);
    }
  }, [user, subscription.plan, subscription.loading]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  };

  const handleUpgrade = () => {
    dismiss();
    navigate('/dashboard/settings');
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-md mx-auto"
          >
            <div className="relative rounded-3xl bg-card border border-border/50 shadow-2xl shadow-pop-violet/10 overflow-hidden">
              {/* Gradient top bar */}
              <div className="h-1.5 bg-gradient-to-r from-pop-violet via-pop-coral to-pop-yellow" />

              {/* Close button */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-6 pt-8 pb-6 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 3, scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pop-violet via-pop-coral to-pop-yellow flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pop-violet/20"
                >
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </motion.div>

                <h3 className="text-lg font-bold text-foreground font-display">
                  Tu utilises MyTaptap depuis 1 semaine 🎉
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Passe au niveau supérieur avec les analytics avancés, les pixels de tracking, 
                  les urgency widgets et bien plus.
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mt-5 text-left">
                  {[
                    'Analytics détaillés',
                    'Pixels Meta & TikTok',
                    'Urgency widgets',
                    'Thèmes exclusifs',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-pop-cyan shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 space-y-2">
                  <Button
                    onClick={handleUpgrade}
                    className="w-full h-10 rounded-xl text-sm font-semibold bg-gradient-to-r from-pop-violet to-pop-coral text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Voir les plans
                  </Button>
                  <button
                    onClick={dismiss}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RetentionModal;
