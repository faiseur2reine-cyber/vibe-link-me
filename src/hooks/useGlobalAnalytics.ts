import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GlobalStats {
  totalClicks: number;
  totalLinks: number;
  totalPages: number;
  topPages: { pageId: string; username: string; displayName: string | null; clicks: number }[];
  dailyClicks: { date: string; clicks: number }[];
  loading: boolean;
}

export function useGlobalAnalytics(pageIds: string[]) {
  const { user } = useAuth();
  const [stats, setStats] = useState<GlobalStats>({
    totalClicks: 0, totalLinks: 0, totalPages: 0,
    topPages: [], dailyClicks: [], loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!user || pageIds.length === 0) {
      setStats(s => ({ ...s, loading: false, totalPages: pageIds.length }));
      return;
    }

    // Get all links for all pages
    const { data: links } = await supabase
      .from('links')
      .select('id, page_id')
      .in('page_id', pageIds);

    if (!links || links.length === 0) {
      setStats(s => ({ ...s, loading: false, totalPages: pageIds.length, totalLinks: 0 }));
      return;
    }

    const linkIds = links.map(l => l.id);

    // Get all clicks
    const { data: clicks } = await supabase
      .from('link_clicks')
      .select('link_id, clicked_at')
      .in('link_id', linkIds);

    if (!clicks) {
      setStats(s => ({ ...s, loading: false, totalPages: pageIds.length, totalLinks: links.length }));
      return;
    }

    // Map link_id -> page_id
    const linkToPage: Record<string, string> = {};
    links.forEach(l => { if (l.page_id) linkToPage[l.id] = l.page_id; });

    // Clicks per page
    const perPage: Record<string, number> = {};
    pageIds.forEach(id => { perPage[id] = 0; });
    clicks.forEach(c => {
      const pid = linkToPage[c.link_id];
      if (pid) perPage[pid] = (perPage[pid] || 0) + 1;
    });

    // Daily (last 30 days)
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

    // Get page info for top pages
    const { data: pages } = await supabase
      .from('creator_pages')
      .select('id, username, display_name')
      .in('id', pageIds);

    const topPages = pageIds
      .map(id => {
        const page = pages?.find(p => p.id === id);
        return {
          pageId: id,
          username: page?.username || '',
          displayName: page?.display_name || null,
          clicks: perPage[id] || 0,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);

    setStats({
      totalClicks: clicks.length,
      totalLinks: links.length,
      totalPages: pageIds.length,
      topPages,
      dailyClicks: Object.entries(daily).map(([date, clicks]) => ({ date, clicks })),
      loading: false,
    });
  }, [user, pageIds.join(',')]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return stats;
}
