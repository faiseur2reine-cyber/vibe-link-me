import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { PlanKey } from '@/lib/plans';

interface SubscriptionState {
  plan: PlanKey;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  subscription: SubscriptionState;
  needsUsername: boolean;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const defaultSubscription: SubscriptionState = {
  plan: 'free',
  subscribed: false,
  subscriptionEnd: null,
  loading: true,
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  subscription: defaultSubscription,
  needsUsername: false,
  signOut: async () => {},
  checkSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);
  const [needsUsername, setNeedsUsername] = useState(false);

  const checkUsernameNeeded = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .maybeSingle();
    setNeedsUsername(!!data?.username?.startsWith('user_'));
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      setSubscription(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('check-subscription error', error);
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }

      setSubscription({
        plan: data?.plan || 'free',
        subscribed: data?.subscribed || false,
        subscriptionEnd: data?.subscription_end || null,
        loading: false,
      });
    } catch (e) {
      console.error('check-subscription error', e);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => {
          checkSubscription();
          checkUsernameNeeded(session.user.id);
        }, 0);
      } else {
        // Reset subscription when logged out
        setSubscription(defaultSubscription);
        setNeedsUsername(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
        checkUsernameNeeded(session.user.id);
      }
    });

    return () => authSub.unsubscribe();
  }, [checkSubscription]);

  // Auto-refresh subscription every 60 seconds when logged in
  useEffect(() => {
    if (!session?.user) return;
    
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session?.user, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscription(defaultSubscription);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user: session?.user ?? null, 
        loading, 
        subscription,
        signOut, 
        checkSubscription 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
