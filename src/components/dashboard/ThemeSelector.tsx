import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { THEMES, canAccessTheme } from '@/lib/themes';
import { Profile } from '@/hooks/useDashboard';
import { toast } from '@/hooks/use-toast';
import { Lock, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeSelectorProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => Promise<{ error: any } | undefined>;
}

const ThemeSelector = ({ profile, onUpdate }: ThemeSelectorProps) => {
  const { t } = useTranslation();

  const handleSelect = async (key: string) => {
    const theme = THEMES[key];
    if (!canAccessTheme(theme.tier, profile.plan)) {
      const label = theme.tier === 'starter' ? 'Starter' : 'Pro';
      toast({ title: t('pricing.upgrade'), description: `Ce thème est réservé au plan ${label}.` });
      return;
    }
    const result = await onUpdate({ theme: key });
    if (result?.error) toast({ title: result.error.message, variant: 'destructive' });
    else toast({ title: t('common.success') });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-lg">{t('dashboard.theme')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(THEMES).map(([key, theme]) => {
          const isSelected = profile.theme === key;
          const isLocked = !canAccessTheme(theme.tier, profile.plan);
          const tierLabel = theme.tier === 'free' ? null : theme.tier.toUpperCase();

          return (
              <motion.button
                key={key}
                onClick={() => handleSelect(key)}
                layout
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative rounded-2xl p-3 border-2 transition-colors text-left ${
                  isSelected
                    ? 'border-primary shadow-md ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40'
                } ${isLocked ? 'opacity-70' : ''}`}
              >
                {/* Preview swatch */}
                <div className={`h-16 rounded-xl mb-2 overflow-hidden ${theme.preview}`}>
                  <motion.div
                    className="flex flex-col items-center justify-center h-full gap-1"
                    initial={false}
                    animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-white/30"
                      animate={isSelected ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                    <div className="w-12 h-1.5 rounded-full bg-white/30" />
                    <div className="w-16 h-2 rounded-full bg-white/20" />
                  </motion.div>
                </div>

                {/* Name */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{theme.name}</span>
                  <AnimatePresence mode="wait">
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>

                {/* Tier badge */}
                {tierLabel && (
                  <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5">
                    {tierLabel}
                  </Badge>
                )}
              </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;