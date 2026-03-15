import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TapSparkles as Sparkles } from '@/components/icons/TapIcons';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface ProFeatureGateProps {
  children: ReactNode;
  requiredPlan?: 'starter' | 'pro';
  label?: string;
}

/**
 * Wraps content with a blurred overlay + unlock CTA when the user's plan
 * is below the required level. Shows children normally otherwise.
 */
const ProFeatureGate = ({ children, requiredPlan = 'starter', label = 'Fonctionnalité Pro' }: ProFeatureGateProps) => {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  const planRank: Record<string, number> = { free: 0, starter: 1, pro: 2 };
  const userRank = planRank[subscription.plan] ?? 0;
  const requiredRank = planRank[requiredPlan] ?? 1;

  if (userRank >= requiredRank) {
    return <>{children}</>;
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-[6px] opacity-60">
        {children}
      </div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl"
      >
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pop-violet to-pop-coral flex items-center justify-center shadow-lg shadow-pop-violet/20">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Disponible avec le plan {requiredPlan === 'pro' ? 'Pro' : 'Starter'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/settings')}
            className="h-8 px-4 text-xs rounded-xl gap-1.5 bg-gradient-to-r from-pop-violet to-pop-coral text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-3 h-3" /> Débloquer
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProFeatureGate;
