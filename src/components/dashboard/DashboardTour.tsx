import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'pages',
    title: 'Vos pages',
    description: 'Gérez toutes vos pages depuis cette vue. Cliquez sur une page pour la modifier.',
    target: '[data-tour="pages-list"]',
    position: 'bottom',
  },
  {
    id: 'create',
    title: 'Créer une page',
    description: 'Créez une nouvelle page en un clic. Vous pouvez avoir plusieurs pages.',
    target: '[data-tour="create-button"]',
    position: 'bottom',
  },
  {
    id: 'stats',
    title: 'Statistiques',
    description: 'Suivez vos performances globales : pages, liens et clics.',
    target: '[data-tour="stats"]',
    position: 'bottom',
  },
];

interface DashboardTourProps {
  onComplete: () => void;
}

export const DashboardTour = ({ onComplete }: DashboardTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep]);

  const updatePosition = () => {
    const step = tourSteps[currentStep];
    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 120;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - tooltipHeight - 16;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 16;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 16;
        break;
    }

    setPosition({ top, left });
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{ top: position.top, left: position.left }}
          className="fixed z-50 w-[280px] bg-card border border-border rounded-lg shadow-lg p-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              <button
                onClick={handleSkip}
                className="shrink-0 w-6 h-6 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} / {tourSteps.length}
              </span>
              <Button onClick={handleNext} size="sm" className="h-7 text-xs gap-1.5">
                {currentStep < tourSteps.length - 1 ? (
                  <>
                    Suivant <ArrowRight className="w-3 h-3" />
                  </>
                ) : (
                  'Terminer'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
