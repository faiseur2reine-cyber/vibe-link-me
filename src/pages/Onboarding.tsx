import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { TapLoader as Loader2 } from '@/components/icons/TapIcons';

const Onboarding = () => {
  const { user, loading } = useAuth();

  // Fast bail: if already completed, don't show
  if (!loading && localStorage.getItem('onboarding_completed')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <OnboardingWizard />;
};

export default Onboarding;
