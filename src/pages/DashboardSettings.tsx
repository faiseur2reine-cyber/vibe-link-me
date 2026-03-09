import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Crown, CreditCard, AlertTriangle, Trash2, LogOut } from 'lucide-react';
import { PLANS } from '@/lib/plans';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

const DashboardSettings = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>('free');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('plan')
      .eq('user_id', user!.id)
      .single();

    if (data) {
      setPlan(data.plan || 'free');
    }
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('customer-portal');
    
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else if (data?.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    
    // Delete user's data (profiles will cascade delete)
    const { error } = await supabase.auth.admin.deleteUser(user!.id);
    
    if (error) {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de supprimer le compte. Contactez le support.', 
        variant: 'destructive' 
      });
      setDeleting(false);
    } else {
      toast({ title: 'Compte supprimé', description: 'Votre compte a été définitivement supprimé.' });
      await signOut();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = PLANS[plan as keyof typeof PLANS] || PLANS.free;

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Paramètres</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez votre compte et votre abonnement
          </p>
        </div>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              Abonnement
            </CardTitle>
            <CardDescription>Gérez votre plan et votre facturation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{currentPlan.name}</p>
                  <Badge variant={plan === 'free' ? 'secondary' : 'default'}>
                    {plan === 'free' ? 'Gratuit' : 'Premium'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan.maxLinks === Infinity 
                    ? 'Liens illimités' 
                    : `Jusqu'à ${currentPlan.maxLinks} liens`
                  }
                </p>
              </div>
              <div className="text-right">
                {plan !== 'free' && (
                  <p className="text-2xl font-bold text-foreground">
                    {(currentPlan.price / 100).toFixed(2)} €
                    <span className="text-sm text-muted-foreground">
                      /{currentPlan.interval === 'month' ? 'mois' : 'an'}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {plan === 'free' ? (
              <Button onClick={() => navigate('/#pricing')} className="w-full">
                <Crown className="w-4 h-4 mr-2" />
                Passer à Premium
              </Button>
            ) : (
              <Button onClick={handleManageSubscription} variant="outline" className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Gérer l'abonnement
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions du compte</CardTitle>
            <CardDescription>Gérez votre compte et vos données</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={signOut} 
              variant="outline" 
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Zone dangereuse
            </CardTitle>
            <CardDescription>Actions irréversibles sur votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Elle supprimera définitivement votre compte,
                    toutes vos pages, vos liens et vos données analytiques.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSettings;
