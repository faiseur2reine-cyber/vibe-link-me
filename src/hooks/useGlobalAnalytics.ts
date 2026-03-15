import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GlobalStats {
  totalClicks: number;
  totalViews: number;
  totalLinks: number;
  totalPages: number;
  conversionRate: string;
  topPages: { pageId: string; username: string; displayName: string | null; clicks: number; views: number }[];
  dailyClicks: { date: string; clicks: number }[];
  dailyViews: { date: string; views: number }[];
  countryStats: { country: string; count: number }[];
  cityStats: { city: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
  osStats: { os: string; count: number }[];
  loading: boolean;
}

export function useGlobalAnalytics(pageIds: string[]) {
  const { user } = useAuth();
  const [stats, setStats] = useState<GlobalStats>({
    totalClicks: 0, totalViews: 0, totalLinks: 0, totalPages: 0, conversionRate: '—',
    topPages: [], dailyClicks: [], dailyViews: [],
    countryStats: [], cityStats: [], referrerStats: [],
    deviceStats: [], browserStats: [], osStats: [],
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!user || pageIds.length === 0) {
      setStats(s => ({ ...s, loading: false, totalPages: pageIds.length }));
      return;
    }

    // Get all links + page views in parallel
    const [linksRes, viewsRes, pagesRes] = await Promise.all([
      supabase.from('links').select('id, page_id').in('page_id', pageIds),
      supabase.from('page_views').select('page_id, viewed_at, country, city, referrer, device_type, browser, os').in('page_id', pageIds),
      supabase.from('creator_pages').select('id, username, display_name').in('id', pageIds),
    ]);

    const links = linksRes.data || [];
    const views = viewsRes.data || [];
    const pages = pagesRes.data || [];

    if (links.length === 0) {
      // Still count views even with no links
      const viewsByPage: Record<string, number> = {};
      pageIds.forEach(id => { viewsByPage[id] = 0; });
      views.forEach((v: any) => { if (v.page_id) viewsByPage[v.page_id] = (viewsByPage[v.page_id] || 0) + 1; });

      const topPages = pageIds.map(id => {
        const page = pages.find(p => p.id === id);
        return { pageId: id, username: page?.username || '', displayName: page?.display_name || null, clicks: 0, views: viewsByPage[id] || 0 };
      }).sort((a, b) => b.views - a.views);

      setStats(s => ({ ...s, loading: false, totalPages: pageIds.length, totalLinks: 0, totalViews: views.length, topPages }));
      return;
    }

    const linkIds = links.map(l => l.id);

    // Get all clicks
    const { data: clicks } = await supabase
      .from('link_clicks')
      .select('link_id, clicked_at, country, city, referrer, device_type, browser, os')
      .in('link_id', linkIds);

    const allClicks = clicks || [];

    // Map link_id → page_id
    const linkToPage: Record<string, string> = {};
    links.forEach(l => { if (l.page_id) linkToPage[l.id] = l.page_id; });

    // Clicks per page
    const clicksPerPage: Record<string, number> = {};
    pageIds.forEach(id => { clicksPerPage[id] = 0; });
    allClicks.forEach(c => {
      const pid = linkToPage[c.link_id];
      if (pid) clicksPerPage[pid] = (clicksPerPage[pid] || 0) + 1;
    });

    // Views per page
    const viewsPerPage: Record<string, number> = {};
    pageIds.forEach(id => { viewsPerPage[id] = 0; });
    views.forEach((v: any) => {
      if (v.page_id) viewsPerPage[v.page_id] = (viewsPerPage[v.page_id] || 0) + 1;
    });

    // Daily (last 30 days)
    const now = new Date();
    const dailyC: Record<string, number> = {};
    const dailyV: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyC[key] = 0;
      dailyV[key] = 0;
    }
    allClicks.forEach(c => { const d = new Date(c.clicked_at).toISOString().split('T')[0]; if (dailyC[d] !== undefined) dailyC[d]++; });
    views.forEach((v: any) => { const d = new Date(v.viewed_at).toISOString().split('T')[0]; if (dailyV[d] !== undefined) dailyV[d]++; });

    // Merge all events for breakdown stats
    const allEvents = [...allClicks, ...views] as any[];

    // Geo
    const countries: Record<string, number> = {};
    allEvents.forEach(e => { const c = e.country || null; if (c) countries[c] = (countries[c] || 0) + 1; });

    const cities: Record<string, number> = {};
    allEvents.forEach(e => { const c = e.city || null; if (c) cities[c] = (cities[c] || 0) + 1; });

    // Referrers
    const referrers: Record<string, number> = {};
    allEvents.forEach(e => { const r = e.referrer || 'Direct'; referrers[r] = (referrers[r] || 0) + 1; });

    // Device / Browser / OS
    const devices: Record<string, number> = {};
    allEvents.forEach(e => { const d = e.device_type || null; if (d) devices[d] = (devices[d] || 0) + 1; });

    const browsers: Record<string, number> = {};
    allEvents.forEach(e => { const b = e.browser || null; if (b) browsers[b] = (browsers[b] || 0) + 1; });

    const oses: Record<string, number> = {};
    allEvents.forEach(e => { const o = e.os || null; if (o) oses[o] = (oses[o] || 0) + 1; });

    // Top pages
    const topPages = pageIds
      .map(id => {
        const page = pages.find(p => p.id === id);
        return {
          pageId: id,
          username: page?.username || '',
          displayName: page?.display_name || null,
          clicks: clicksPerPage[id] || 0,
          views: viewsPerPage[id] || 0,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);

    const totalClicks = allClicks.length;
    const totalViews = views.length;
    const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '—';

    setStats({
      totalClicks,
      totalViews,
      totalLinks: links.length,
      totalPages: pageIds.length,
      conversionRate,
      topPages,
      dailyClicks: Object.entries(dailyC).map(([date, clicks]) => ({ date, clicks })),
      dailyViews: Object.entries(dailyV).map(([date, views]) => ({ date, views })),
      countryStats: Object.entries(countries).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
      cityStats: Object.entries(cities).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count),
      referrerStats: Object.entries(referrers).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count),
      deviceStats: Object.entries(devices).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count),
      browserStats: Object.entries(browsers).map(([browser, count]) => ({ browser, count })).sort((a, b) => b.count - a.count),
      osStats: Object.entries(oses).map(([os, count]) => ({ os, count })).sort((a, b) => b.count - a.count),
      loading: false,
    });
  }, [user, pageIds.join(',')]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return stats;
}
