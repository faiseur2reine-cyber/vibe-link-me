import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { THEMES, canAccessTheme, ThemeConfig } from '@/lib/themes';
import { Lock, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const DashboardThemes = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<string>('free');
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const [loading, setLoading] = useState(false);

  // Load user plan and theme
  useState(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('plan, theme')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserPlan(data.plan || 'free');
            setSelectedTheme(data.theme || 'default');
          }
        });
    }
  });

  const handleSelectTheme = async (themeKey: string, theme: ThemeConfig) => {
    if (!canAccessTheme(theme.tier, userPlan)) {
      toast({
        title: 'Thème premium',
        description: `Ce thème nécessite un plan ${theme.tier === 'pro' ? 'Pro' : 'Starter'}.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ theme: themeKey })
      .eq('user_id', user!.id);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setSelectedTheme(themeKey);
      toast({ title: 'Thème appliqué', description: `Le thème ${theme.name} a été appliqué.` });
    }
    setLoading(false);
  };

  const tierBadgeColor = (tier: string) => {
    if (tier === 'free') return 'bg-secondary/20 text-secondary-foreground';
    if (tier === 'starter') return 'bg-primary/20 text-primary';
    return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Thèmes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personnalisez l'apparence de vos pages
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-sm text-foreground">
            Votre plan actuel : <span className="font-semibold capitalize">{userPlan}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(THEMES).map(([key, theme]) => {
            const isLocked = !canAccessTheme(theme.tier, userPlan);
            const isSelected = selectedTheme === key;
            
            return (
              <Card
                key={key}
                className={`overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${isLocked ? 'opacity-60' : 'hover:shadow-lg'}`}
                onClick={() => !isLocked && handleSelectTheme(key, theme)}
              >
                <div className={`h-32 ${theme.preview} relative`}>
                  {isLocked && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {isSelected && !isLocked && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-foreground">{theme.name}</h3>
                    <Badge className={tierBadgeColor(theme.tier)} variant="secondary">
                      {theme.tier.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {isLocked 
                      ? `Nécessite le plan ${theme.tier === 'pro' ? 'Pro' : 'Starter'}`
                      : 'Cliquer pour appliquer'
                    }
                  </p>
                  {isLocked && (
                    <Button size="sm" variant="outline" className="w-full" disabled={loading}>
                      Débloquer
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardThemes;
