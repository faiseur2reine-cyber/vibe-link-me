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

  // ── Fast plan check: reads from profiles table (no Stripe call) ──
  // The plan field in profiles is kept in sync by the stripe-webhook edge function.
  // This is called on every login / page refresh — it's a single DB query, not an API call.
  const loadPlanFromDb = useCallback(async (userId: string) => {
    try {
      setSubscription(prev => ({ ...prev, loading: true }));
      const { data } = await supabase
        .from('profiles')
        .select('plan, subscription_end')
        .eq('user_id', userId)
        .maybeSingle();

      const plan = (data?.plan || 'free') as PlanKey;
      setSubscription({
        plan,
        subscribed: plan !== 'free',
        subscriptionEnd: data?.subscription_end || null,
        loading: false,
      });
    } catch {
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // ── Full Stripe sync: calls edge function (expensive, use sparingly) ──
  // Only called explicitly: after checkout success, or manual refresh.
  // This calls Stripe API via the check-subscription edge function,
  // which also updates profiles.plan as a side effect.
  const checkSubscription = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      setSubscription({ ...defaultSubscription, loading: false });
      return;
    }

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
          // Fast: read plan from DB (no Stripe call)
          loadPlanFromDb(session.user.id);
          checkUsernameNeeded(session.user.id);
        }, 0);
      } else {
        setSubscription(defaultSubscription);
        setNeedsUsername(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        loadPlanFromDb(session.user.id);
        checkUsernameNeeded(session.user.id);
      }
    });

    return () => authSub.unsubscribe();
  }, [loadPlanFromDb, checkUsernameNeeded]);

  // NOTE: No more 60-second polling interval.
  // Plan is read from profiles on login, and synced via Stripe webhook.
  // checkSubscription() is only called after checkout success (in DashboardNew).

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
        needsUsername,
        signOut,
        checkSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
