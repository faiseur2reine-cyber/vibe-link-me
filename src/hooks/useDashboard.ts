import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  theme: string;
  plan: string;
  is_nsfw: boolean;
  social_links: SocialLink[];
}

export interface LinkItem {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
  thumbnail_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setProfile({
        ...data,
        social_links: (data.social_links as unknown as SocialLink[]) || [],
      } as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const dbUpdates = { ...updates } as any;
    if (updates.social_links) {
      dbUpdates.social_links = JSON.parse(JSON.stringify(updates.social_links));
    }
    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('user_id', user.id);
    if (!error) await fetchProfile();
    return { error };
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
}

export function useLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true });
    setLinks((data as LinkItem[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const addLink = async (link: { title: string; url: string; icon: string }) => {
    if (!user) return;
    const position = links.length;
    const { error } = await supabase
      .from('links')
      .insert({ ...link, user_id: user.id, position });
    if (!error) await fetchLinks();
    return { error };
  };

  const updateLink = async (id: string, updates: Partial<LinkItem>) => {
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

  const reorderLinks = async (reordered: LinkItem[]) => {
    if (!user) return;
    setLinks(reordered);
    const updates = reordered.map((link, index) =>
      supabase.from('links').update({ position: index }).eq('id', link.id).eq('user_id', user.id)
    );
    await Promise.all(updates);
  };

  return { links, loading, addLink, updateLink, deleteLink, reorderLinks, refetch: fetchLinks };
}
