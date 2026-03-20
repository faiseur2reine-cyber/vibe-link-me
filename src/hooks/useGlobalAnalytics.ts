import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllRows } from '@/lib/supabasePaginate';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface PreviousPeriodStats {
  totalClicks: number;
  totalViews: number;
}

export type HeatmapCell = { day: number; hour: number; count: number };

export interface GlobalStats {
  totalClicks: number;
  totalViews: number;
  totalLinks: number;
  totalPages: number;
  conversionRate: string;
  topPages: { pageId: string; username: string; displayName: string | null; clicks: number; views: number }[];
  dailyClicks: { date: string; clicks: number }[];
  dailyViews: { date: string; views: number }[];
  dailyClicksPrev: { date: string; clicks: number }[];
  dailyViewsPrev: { date: string; views: number }[];
  previousPeriod: PreviousPeriodStats;
  heatmap: HeatmapCell[];
  countryStats: { country: string; count: number }[];
  cityStats: { city: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
  osStats: { os: string; count: number }[];
  loading: boolean;
}

interface PageMeta {
  id: string;
  username: string;
  display_name: string | null;
}

function daysForPeriod(period: AnalyticsPeriod): number | null {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '90d') return 90;
  return null;
}

function dateThreshold(period: AnalyticsPeriod): string | null {
  const days = daysForPeriod(period);
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function useGlobalAnalytics(pageIds: string[], pagesMeta?: PageMeta[], period: AnalyticsPeriod = '30d') {
  const { user } = useAuth();
  const [stats, setStats] = useState<GlobalStats>({
    totalClicks: 0, totalViews: 0, totalLinks: 0, totalPages: 0, conversionRate: '—',
    topPages: [], dailyClicks: [], dailyViews: [],
    dailyClicksPrev: [], dailyViewsPrev: [],
    previousPeriod: { totalClicks: 0, totalViews: 0 },
    heatmap: [],
    countryStats: [], cityStats: [], referrerStats: [],
    deviceStats: [], browserStats: [], osStats: [],
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!user || pageIds.length === 0) {
      setStats(s => ({ ...s, loading: false, totalPages: pageIds.length }));
      return;
    }

    const threshold = dateThreshold(period);
    const fetchMeta = !pagesMeta || pagesMeta.length === 0;

    const [links, views, pagesData] = await Promise.all([
      fetchAllRows(() => supabase.from('links').select('id, page_id').in('page_id', pageIds)),
      fetchAllRows(() => {
        let q = supabase.from('page_views').select('page_id, viewed_at, country, city, referrer, device_type, browser, os').in('page_id', pageIds);
        if (threshold) q = q.gte('viewed_at', threshold);
        return q;
      }),
      fetchMeta
        ? supabase.from('creator_pages').select('id, username, display_name').in('id', pageIds).then(r => r.data || [])
        : Promise.resolve([]),
    ]);

    const pages: PageMeta[] = pagesMeta && pagesMeta.length > 0
      ? pagesMeta
      : (pagesData as PageMeta[]);

    const findPage = (id: string) => pages.find(p => p.id === id);

    if (links.length === 0) {
      const viewsByPage: Record<string, number> = {};
      pageIds.forEach(id => { viewsByPage[id] = 0; });
      views.forEach((v: any) => { if (v.page_id) viewsByPage[v.page_id] = (viewsByPage[v.page_id] || 0) + 1; });

      const topPages = pageIds.map(id => {
        const page = findPage(id);
        return { pageId: id, username: page?.username || '', displayName: page?.display_name || null, clicks: 0, views: viewsByPage[id] || 0 };
      }).sort((a, b) => b.views - a.views);

      setStats(s => ({ ...s, loading: false, totalPages: pageIds.length, totalLinks: 0, totalViews: views.length, topPages }));
      return;
    }

    const linkIds = links.map((l: any) => l.id);

    // Fetch current + previous period clicks
    const prevDays = daysForPeriod(period);
    const prevThreshold = prevDays ? (() => { const d = new Date(); d.setDate(d.getDate() - prevDays * 2); return d.toISOString(); })() : null;

    const allClicks = await fetchAllRows(() => {
      let q = supabase.from('link_clicks').select('link_id, clicked_at, country, city, referrer, device_type, browser, os').in('link_id', linkIds);
      if (prevThreshold) q = q.gte('clicked_at', prevThreshold);
      else if (threshold) q = q.gte('clicked_at', threshold);
      return q;
    });

    const linkToPage: Record<string, string> = {};
    links.forEach((l: any) => { if (l.page_id) linkToPage[l.id] = l.page_id; });

    // Split current vs previous period clicks
    const currentClicks = threshold ? allClicks.filter((c: any) => c.clicked_at >= threshold) : allClicks;
    const prevClicks = threshold ? allClicks.filter((c: any) => c.clicked_at < threshold) : [];

    const clicksPerPage: Record<string, number> = {};
    pageIds.forEach(id => { clicksPerPage[id] = 0; });
    currentClicks.forEach((c: any) => {
      const pid = linkToPage[c.link_id];
      if (pid) clicksPerPage[pid] = (clicksPerPage[pid] || 0) + 1;
    });

    const viewsPerPage: Record<string, number> = {};
    pageIds.forEach(id => { viewsPerPage[id] = 0; });
    views.forEach((v: any) => {
      if (v.page_id) viewsPerPage[v.page_id] = (viewsPerPage[v.page_id] || 0) + 1;
    });

    const days = daysForPeriod(period) || 90;
    const now = new Date();
    const dailyC: Record<string, number> = {};
    const dailyV: Record<string, number> = {};
    const dailyCPrev: Record<string, number> = {};
    const dailyVPrev: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyC[key] = 0;
      dailyV[key] = 0;
      // Previous period: offset by `days`
      const dp = new Date(now); dp.setDate(dp.getDate() - i - days);
      const keyP = dp.toISOString().split('T')[0];
      dailyCPrev[keyP] = 0;
      dailyVPrev[keyP] = 0;
    }
    currentClicks.forEach((c: any) => { const d = new Date(c.clicked_at).toISOString().split('T')[0]; if (dailyC[d] !== undefined) dailyC[d]++; });
    views.forEach((v: any) => { const d = new Date(v.viewed_at).toISOString().split('T')[0]; if (dailyV[d] !== undefined) dailyV[d]++; });
    prevClicks.forEach((c: any) => { const d = new Date(c.clicked_at).toISOString().split('T')[0]; if (dailyCPrev[d] !== undefined) dailyCPrev[d]++; });

    // Fetch previous period views
    let prevViewsData: any[] = [];
    if (prevDays && threshold) {
      const prevViewThreshold = (() => { const d2 = new Date(); d2.setDate(d2.getDate() - prevDays * 2); return d2.toISOString(); })();
      prevViewsData = await fetchAllRows(() =>
        supabase.from('page_views').select('page_id, viewed_at').in('page_id', pageIds)
          .gte('viewed_at', prevViewThreshold).lt('viewed_at', threshold)
      );
    }
    prevViewsData.forEach((v: any) => { const d = new Date(v.viewed_at).toISOString().split('T')[0]; if (dailyVPrev[d] !== undefined) dailyVPrev[d]++; });

    const allEvents = [...currentClicks, ...views] as any[];

    const aggregate = (key: string) => {
      const map: Record<string, number> = {};
      allEvents.forEach(e => { const v = e[key] || null; if (v) map[v] = (map[v] || 0) + 1; });
      return Object.entries(map).map(([k, count]) => ({ [key]: k, count })).sort((a, b) => b.count - a.count);
    };

    const referrers: Record<string, number> = {};
    allEvents.forEach(e => { const r = e.referrer || 'Direct'; referrers[r] = (referrers[r] || 0) + 1; });

    const topPages = pageIds
      .map(id => {
        const page = findPage(id);
        return { pageId: id, username: page?.username || '', displayName: page?.display_name || null, clicks: clicksPerPage[id] || 0, views: viewsPerPage[id] || 0 };
      })
      .sort((a, b) => b.clicks - a.clicks);

    const totalClicks = currentClicks.length;
    const totalViews = views.length;
    const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '—';

    // Heatmap: day-of-week × hour
    const heatmapGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    allEvents.forEach(e => {
      const ts = e.clicked_at || e.viewed_at;
      if (!ts) return;
      const dt = new Date(ts);
      heatmapGrid[dt.getDay()][dt.getHours()]++;
    });
    const heatmap: HeatmapCell[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap.push({ day, hour, count: heatmapGrid[day][hour] });
      }
    }

    setStats({
      totalClicks,
      totalViews,
      totalLinks: links.length,
      totalPages: pageIds.length,
      conversionRate,
      topPages,
      dailyClicks: Object.entries(dailyC).map(([date, clicks]) => ({ date, clicks })),
      dailyViews: Object.entries(dailyV).map(([date, views]) => ({ date, views })),
      dailyClicksPrev: Object.entries(dailyCPrev).map(([date, clicks]) => ({ date, clicks })),
      dailyViewsPrev: Object.entries(dailyVPrev).map(([date, views]) => ({ date, views })),
      previousPeriod: { totalClicks: prevClicks.length, totalViews: prevViewsData.length },
      heatmap,
      countryStats: aggregate('country') as any,
      cityStats: aggregate('city') as any,
      referrerStats: Object.entries(referrers).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count),
      deviceStats: aggregate('device_type').map(d => ({ device: (d as any).device_type, count: d.count })),
      browserStats: aggregate('browser') as any,
      osStats: aggregate('os') as any,
      loading: false,
    });
  }, [user, pageIds.join(','), period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return stats;
}
