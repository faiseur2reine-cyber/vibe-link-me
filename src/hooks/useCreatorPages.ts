import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface CreatorPage {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  theme: string;
  is_nsfw: boolean;
  social_links: SocialLink[];
  created_at: string;
  updated_at: string;
  custom_bg_color: string | null;
  custom_text_color: string | null;
  custom_accent_color: string | null;
  custom_btn_color: string | null;
  custom_btn_text_color: string | null;
  custom_font: string;
  link_layout: string;
  custom_css: string | null;
}

export interface PageLink {
  id: string;
  user_id: string;
  page_id: string | null;
  title: string;
  url: string;
  icon: string;
  position: number;
  thumbnail_url: string | null;
  description: string | null;
  bg_color: string | null;
  text_color: string | null;
  style: string;
  section_title: string | null;
}

export function useCreatorPages() {
  const { user } = useAuth();
  const [pages, setPages] = useState<CreatorPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('creator_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) {
      setPages(data.map(d => ({
        ...d,
        social_links: (d.social_links as unknown as SocialLink[]) || [],
      })) as CreatorPage[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const createPage = async (username: string, displayName?: string) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    const { data, error } = await supabase
      .from('creator_pages')
      .insert({
        user_id: user.id,
        username,
        display_name: displayName || username,
      })
      .select()
      .single();
    if (!error) await fetchPages();
    return { data, error };
  };

  const updatePage = async (id: string, updates: Partial<CreatorPage>) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    const dbUpdates = { ...updates } as any;
    if (updates.social_links) {
      dbUpdates.social_links = JSON.parse(JSON.stringify(updates.social_links));
    }
    const { error } = await supabase
      .from('creator_pages')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchPages();
    return { error };
  };

  const deletePage = async (id: string) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    const { error } = await supabase
      .from('creator_pages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchPages();
    return { error };
  };

  const duplicatePage = async (id: string) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    const source = pages.find(p => p.id === id);
    if (!source) return { error: { message: 'Page not found' } };

    // Generate unique username
    let newUsername = `${source.username}-copy`;
    let suffix = 1;
    const { data: existing } = await supabase
      .from('creator_pages')
      .select('username')
      .like('username', `${source.username}-copy%`);
    const taken = new Set(existing?.map(e => e.username) || []);
    while (taken.has(newUsername)) {
      suffix++;
      newUsername = `${source.username}-copy-${suffix}`;
    }

    const { data: newPage, error } = await supabase
      .from('creator_pages')
      .insert({
        user_id: user.id,
        username: newUsername,
        display_name: `${source.display_name || source.username} (copie)`,
        bio: source.bio,
        avatar_url: source.avatar_url,
        cover_url: source.cover_url,
        theme: source.theme,
        is_nsfw: source.is_nsfw,
        social_links: JSON.parse(JSON.stringify(source.social_links)),
      })
      .select()
      .single();

    if (error || !newPage) {
      await fetchPages();
      return { error };
    }

    // Duplicate links
    const { data: sourceLinks } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', id)
      .order('position', { ascending: true });

    if (sourceLinks && sourceLinks.length > 0) {
      const newLinks = sourceLinks.map(l => ({
        user_id: user.id,
        page_id: newPage.id,
        title: l.title,
        url: l.url,
        icon: l.icon,
        position: l.position,
        thumbnail_url: l.thumbnail_url,
        description: l.description,
        bg_color: l.bg_color,
        text_color: l.text_color,
        style: l.style,
        section_title: l.section_title,
      }));
      await supabase.from('links').insert(newLinks);
    }

    await fetchPages();
    return { data: newPage, error: null };
  };

  return { pages, loading, createPage, updatePage, deletePage, duplicatePage, refetch: fetchPages };
}

export function usePageLinks(pageId: string | null) {
  const { user } = useAuth();
  const [links, setLinks] = useState<PageLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!user || !pageId) { setLoading(false); return; }
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', pageId)
      .order('position', { ascending: true });
    setLinks((data as PageLink[]) || []);
    setLoading(false);
  }, [user, pageId]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const addLink = async (link: { title: string; url: string; icon: string }) => {
    if (!user || !pageId) return;
    const position = links.length;
    const { error } = await supabase
      .from('links')
      .insert({ ...link, user_id: user.id, page_id: pageId, position });
    if (!error) await fetchLinks();
    return { error };
  };

  const updateLink = async (id: string, updates: Partial<PageLink>) => {
    if (!user) return;
    const { error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchLinks();
    return { error };
  };

  const deleteLink = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchLinks();
    return { error };
  };

  const reorderLinks = async (reordered: PageLink[]) => {
    if (!user) return;
    setLinks(reordered);
    const updates = reordered.map((link, index) =>
      supabase.from('links').update({ position: index }).eq('id', link.id).eq('user_id', user.id)
    );
    await Promise.all(updates);
  };

  return { links, loading, addLink, updateLink, deleteLink, reorderLinks, refetch: fetchLinks };
}

export function usePageAnalytics(pageId: string | null) {
  const { user } = useAuth();
  const [clickStats, setClickStats] = useState<{ linkId: string; totalClicks: number }[]>([]);
  const [dailyClicks, setDailyClicks] = useState<{ date: string; clicks: number }[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [countryStats, setCountryStats] = useState<{ country: string; clicks: number }[]>([]);
  const [cityStats, setCityStats] = useState<{ city: string; clicks: number }[]>([]);
  const [referrerStats, setReferrerStats] = useState<{ referrer: string; clicks: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user || !pageId) { setLoading(false); return; }

    const { data: links } = await supabase
      .from('links')
      .select('id')
      .eq('page_id', pageId);

    if (!links || links.length === 0) { setLoading(false); return; }

    const linkIds = links.map(l => l.id);

    const { data: clicks } = await supabase
      .from('link_clicks')
      .select('link_id, clicked_at, country, city, referrer, ab_variant')
      .in('link_id', linkIds);

    if (!clicks) { setLoading(false); return; }

    // Per link
    const perLink: Record<string, number> = {};
    clicks.forEach(c => { perLink[c.link_id] = (perLink[c.link_id] || 0) + 1; });
    setClickStats(linkIds.map(id => ({ linkId: id, totalClicks: perLink[id] || 0 })));
    setTotalClicks(clicks.length);

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
    setDailyClicks(Object.entries(daily).map(([date, clicks]) => ({ date, clicks })));

    // Country
    const countries: Record<string, number> = {};
    clicks.forEach(c => {
      const country = c.country || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;
    });
    setCountryStats(Object.entries(countries).map(([country, clicks]) => ({ country, clicks })).sort((a, b) => b.clicks - a.clicks));

    // City
    const cities: Record<string, number> = {};
    clicks.forEach(c => {
      const city = c.city || 'Unknown';
      cities[city] = (cities[city] || 0) + 1;
    });
    setCityStats(Object.entries(cities).map(([city, clicks]) => ({ city, clicks })).sort((a, b) => b.clicks - a.clicks));

    // Referrer
    const referrers: Record<string, number> = {};
    clicks.forEach(c => {
      const ref = c.referrer || 'Direct';
      referrers[ref] = (referrers[ref] || 0) + 1;
    });
    setReferrerStats(Object.entries(referrers).map(([referrer, clicks]) => ({ referrer, clicks })).sort((a, b) => b.clicks - a.clicks));

    setLoading(false);
  }, [user, pageId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { clickStats, dailyClicks, totalClicks, countryStats, cityStats, referrerStats, loading, refetch: fetchStats };
}
