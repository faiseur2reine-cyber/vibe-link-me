import { useState, useCallback } from 'react';

export type OnboardingStep = 'welcome' | 'template' | 'customize' | 'preview' | 'success';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completed: boolean;
  completedSteps: OnboardingStep[];
  skipped: boolean;
}

const STORAGE_KEY = 'onboarding_state';
const COMPLETED_KEY = 'onboarding_completed';

function loadFromStorage(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { currentStep: 'welcome', completed: false, completedSteps: [], skipped: false };
}

function saveToStorage(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.completed || state.skipped) {
      localStorage.setItem(COMPLETED_KEY, '1');
    }
  } catch {}
}

export const useOnboarding = (_userId: string | undefined) => {
  const [state, setState] = useState<OnboardingState>(loadFromStorage);

  const updateStep = useCallback(async (step: OnboardingStep) => {
    setState(prev => {
      const newCompleted = [...prev.completedSteps];
      if (!newCompleted.includes(prev.currentStep)) newCompleted.push(prev.currentStep);
      const next = { ...prev, currentStep: step, completedSteps: newCompleted };
      saveToStorage(next);
      return next;
    });
  }, []);

  const complete = useCallback(async () => {
    setState(prev => {
      const next = { ...prev, completed: true };
      saveToStorage(next);
      return next;
    });
  }, []);

  const skip = useCallback(async () => {
    setState(prev => {
      const next = { ...prev, skipped: true, completed: true };
      saveToStorage(next);
      return next;
    });
  }, []);

  return { state, loading: false, updateStep, complete, skip };
};
