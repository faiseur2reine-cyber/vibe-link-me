import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type OnboardingStep = 'welcome' | 'template' | 'customize' | 'preview' | 'success';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completed: boolean;
  completedSteps: OnboardingStep[];
  skipped: boolean;
}

export const useOnboarding = (userId: string | undefined) => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'welcome',
    completed: false,
    completedSteps: [],
    skipped: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadState();
  }, [userId]);

  const loadState = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('onboarding_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading onboarding:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setState({
        currentStep: (data.current_step as OnboardingStep) || 'welcome',
        completed: data.completed,
        completedSteps: (data.completed_steps as OnboardingStep[]) || [],
        skipped: data.skipped || false,
      });
    }
    setLoading(false);
  };

  const updateStep = async (step: OnboardingStep) => {
    if (!userId) return;

    const newCompletedSteps = [...state.completedSteps];
    if (!newCompletedSteps.includes(state.currentStep)) {
      newCompletedSteps.push(state.currentStep);
    }

    const newState = {
      ...state,
      currentStep: step,
      completedSteps: newCompletedSteps,
    };

    setState(newState);

    await supabase
      .from('onboarding_state')
      .upsert({
        user_id: userId,
        current_step: step,
        completed_steps: newCompletedSteps,
        completed: false,
        updated_at: new Date().toISOString(),
      });
  };

  const complete = async () => {
    if (!userId) return;

    setState({ ...state, completed: true });

    await supabase
      .from('onboarding_state')
      .upsert({
        user_id: userId,
        completed: true,
        completed_at: new Date().toISOString(),
        current_step: 'success',
        updated_at: new Date().toISOString(),
      });
  };

  const skip = async () => {
    if (!userId) return;

    setState({ ...state, skipped: true, completed: true });

    await supabase
      .from('onboarding_state')
      .upsert({
        user_id: userId,
        skipped: true,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  };

  return {
    state,
    loading,
    updateStep,
    complete,
    skip,
  };
};
