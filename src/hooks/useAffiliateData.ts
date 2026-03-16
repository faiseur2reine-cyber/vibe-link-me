import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Referral {
  id: string;
  referred_id: string;
  referral_code: string;
  status: string;
  commission_rate: number;
  total_earned: number;
  created_at: string;
  converted_at: string | null;
  referred_username?: string;
  referred_plan?: string;
}

export interface Commission {
  id: string;
  amount: number;
  currency: string;
  plan: string;
  event_type: string;
  created_at: string;
  referred_username?: string;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  stripe_transfer_id: string | null;
  created_at: string;
  paid_at: string | null;
  error_message: string | null;
}

export interface ConnectStatus {
  connected: boolean;
  ready: boolean;
  balance: number;
  account_id?: string;
}

export function useAffiliateData(userId: string | undefined) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>({ connected: false, ready: false, balance: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    const [profileRes, referralsRes, commissionsRes, payoutsRes] = await Promise.all([
      supabase.from('profiles').select('referral_code, affiliate_balance').eq('user_id', userId).single(),
      supabase.from('referrals').select('*').eq('referrer_id', userId).order('created_at', { ascending: false }),
      supabase.from('affiliate_commissions').select('*').eq('referrer_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('affiliate_payouts').select('*').eq('referrer_id', userId).order('created_at', { ascending: false }).limit(20),
    ]);

    const code = profileRes.data?.referral_code || '';
    const bal = profileRes.data?.affiliate_balance || 0;
    setReferralCode(code);
    setBalance(bal);

    const refs = (referralsRes.data || []) as Referral[];
    setReferrals(refs);
    setTotalEarned(refs.reduce((s, r) => s + (r.total_earned || 0), 0));

    // Enrich commissions with referred username
    const comms = (commissionsRes.data || []) as Commission[];
    if (comms.length > 0) {
      const referredIds = [...new Set(comms.map(c => (c as any).referred_id).filter(Boolean))];
      if (referredIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', referredIds);
        const map = new Map((profiles || []).map(p => [p.user_id, p.username]));
        comms.forEach(c => { c.referred_username = map.get((c as any).referred_id) || '?'; });
      }
    }
    setCommissions(comms);
    setPayouts((payoutsRes.data || []) as Payout[]);

    // Check Stripe Connect status
    try {
      const { data } = await supabase.functions.invoke('affiliate-payout', {
        body: { action: 'connect-status' },
      });
      if (data) setConnectStatus(data as ConnectStatus);
    } catch {}

    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { referrals, commissions, payouts, referralCode, balance, totalEarned, connectStatus, loading, refetch: fetchAll };
}
