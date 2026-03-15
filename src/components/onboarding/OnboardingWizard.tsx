import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';
import { useCreatorPages } from '@/hooks/useCreatorPages';
import { onboardingTemplates, OnboardingTemplate } from '@/lib/onboardingTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TapSparkles as Sparkles, TapPalette as Palette, TapBriefcase as Briefcase, TapShoppingCart as ShoppingCart, TapArrowRight as ArrowRight, TapArrowLeft as ArrowLeft, TapCheck as Check, TapLoader as Loader2 } from '@/components/icons/TapIcons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  palette: Palette,
  briefcase: Briefcase,
  'shopping-cart': ShoppingCart,
};

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, updateStep, complete, skip } = useOnboarding(user?.id);
  const { createPage, addMultipleLinks } = useCreatorPages();

  const [selectedTemplate, setSelectedTemplate] = useState<OnboardingTemplate | null>(null);
  const [username, setUsername] = useState(() => user?.user_metadata?.username || '');
  const [displayName, setDisplayName] = useState(() => user?.user_metadata?.display_name || user?.user_metadata?.username || '');
  const [bio, setBio] = useState('');
  const [creating, setCreating] = useState(false);

  const steps: OnboardingStep[] = ['welcome', 'template', 'customize', 'preview', 'success'];
  const currentStepIndex = steps.indexOf(state.currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = async () => {
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex < steps.length - 1) {
      await updateStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = async () => {
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      await updateStep(steps[currentIndex - 1]);
    }
  };

  const handleSkip = async () => {
    await skip();
    localStorage.setItem('onboarding_completed', '1');
    navigate('/dashboard');
  };

  const handleCreatePage = async () => {
    if (!user || !selectedTemplate) return;

    setCreating(true);
    try {
      const pageData = {
        username: username.trim() || `user_${user.id.slice(0, 8)}`,
        display_name: displayName.trim() || 'Mon profil',
        bio: bio.trim() || '',
        theme: selectedTemplate.theme,
        social_links: selectedTemplate.suggestedSocials,
      };

      const result = await createPage(pageData);
      
      if (result.error) {
        toast.error('Erreur lors de la création');
        setCreating(false);
        return;
      }

      if (result.data && selectedTemplate.suggestedLinks.length > 0) {
        await addMultipleLinks(
          result.data.id,
          selectedTemplate.suggestedLinks.map((link, index) => ({
            ...link,
            position: index,
          }))
        );
      }

      await complete();
      localStorage.setItem('onboarding_completed', '1');
      await updateStep('success');
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-semibold font-display">MyTaptap</h1>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="h-7 text-xs">
              Passer
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Welcome */}
            {state.currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold font-display">Bienvenue sur MyTaptap 👋</h2>
                  <p className="text-muted-foreground text-lg">
                    Créez votre page en quelques clics et partagez tous vos liens en un seul endroit
                  </p>
                </div>
                <Button onClick={handleNext} size="lg" className="gap-2">
                  Commencer <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Template */}
            {state.currentStep === 'template' && (
              <motion.div
                key="template"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold font-display">Choisissez un template</h2>
                  <p className="text-muted-foreground">Sélectionnez celui qui correspond le mieux à votre activité</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {onboardingTemplates.map((template) => {
                    const Icon = iconMap[template.icon];
                    return (
                      <Card
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 cursor-pointer transition-all hover:border-primary ${
                          selectedTemplate?.id === template.id ? 'border-primary bg-accent/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <Check className="w-5 h-5 text-primary shrink-0" />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </Button>
                  <Button onClick={handleNext} disabled={!selectedTemplate} className="flex-1 gap-2">
                    Continuer <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Customize */}
            {state.currentStep === 'customize' && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold font-display">Personnalisez votre profil</h2>
                  <p className="text-muted-foreground">Ces informations seront visibles sur votre page publique</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom d'utilisateur</label>
                    <Input
                      placeholder="votrenom"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">mytaptap.com/{username || 'votrenom'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom d'affichage</label>
                    <Input
                      placeholder="Votre nom"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      placeholder="Parlez de vous en quelques mots..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </Button>
                  <Button onClick={handleNext} className="flex-1 gap-2">
                    Continuer <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Preview */}
            {state.currentStep === 'preview' && selectedTemplate && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold font-display">Aperçu de votre page</h2>
                  <p className="text-muted-foreground">Voici à quoi ressemblera votre page</p>
                </div>
                <Card className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto" />
                    <h3 className="font-semibold">{displayName || 'Votre nom'}</h3>
                    <p className="text-sm text-muted-foreground">@{username || 'votrenom'}</p>
                    {bio && <p className="text-sm">{bio}</p>}
                  </div>
                  <div className="space-y-2">
                    {selectedTemplate.suggestedLinks.map((link, index) => (
                      <div key={index} className="p-3 rounded-lg border bg-card text-sm">
                        {link.title}
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="flex gap-2">
                  <Button onClick={handleBack} variant="outline" className="flex-1 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Modifier
                  </Button>
                  <Button onClick={handleCreatePage} disabled={creating} className="flex-1 gap-2">
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Création...
                      </>
                    ) : (
                      <>
                        Créer ma page <Check className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {state.currentStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold font-display">C'est prêt ! 🎉</h2>
                  <p className="text-muted-foreground text-lg">
                    Votre page est créée. Découvrez votre dashboard pour la personnaliser
                  </p>
                </div>
                <Button onClick={handleFinish} size="lg" className="gap-2">
                  Accéder au dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
