import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClickStats {
  linkId: string;
  totalClicks: number;
}

export interface DailyClicks {
  date: string;
  clicks: number;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [clickStats, setClickStats] = useState<ClickStats[]>([]);
  const [dailyClicks, setDailyClicks] = useState<DailyClicks[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    // Get user's links
    const { data: links } = await supabase
      .from('links')
      .select('id')
      .eq('user_id', user.id);

    if (!links || links.length === 0) {
      setLoading(false);
      return;
    }

    const linkIds = links.map(l => l.id);

    // Get click counts per link
    const { data: clicks } = await supabase
      .from('link_clicks')
      .select('link_id, clicked_at')
      .in('link_id', linkIds);

    if (!clicks) {
      setLoading(false);
      return;
    }

    // Aggregate per link
    const perLink: Record<string, number> = {};
    clicks.forEach(c => {
      perLink[c.link_id] = (perLink[c.link_id] || 0) + 1;
    });

    const stats: ClickStats[] = linkIds.map(id => ({
      linkId: id,
      totalClicks: perLink[id] || 0,
    }));

    setClickStats(stats);
    setTotalClicks(clicks.length);

    // Aggregate per day (last 30 days)
    const daily: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      daily[d.toISOString().split('T')[0]] = 0;
    }

    clicks.forEach(c => {
      const day = new Date(c.clicked_at).toISOString().split('T')[0];
      if (daily[day] !== undefined) daily[day]++;
    });

    setDailyClicks(
      Object.entries(daily).map(([date, clicks]) => ({ date, clicks }))
    );

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { clickStats, dailyClicks, totalClicks, loading, refetch: fetchStats };
}

export async function recordClick(linkId: string) {
  const referrer = document.referrer || null;
  await supabase.rpc('record_click', { 
    p_link_id: linkId, 
    p_referrer: referrer,
  });
}
