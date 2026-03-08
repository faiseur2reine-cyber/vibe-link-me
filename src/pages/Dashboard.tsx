import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b border-border">
        <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t('dashboard.title')}
        </h1>
        <Button variant="ghost" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4" /> {t('nav.logout')}
        </Button>
      </nav>
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-muted-foreground">{t('common.loading')} — Dashboard coming in Phase 3</p>
      </div>
    </div>
  );
};

export default Dashboard;
