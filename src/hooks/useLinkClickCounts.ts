import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Lightweight hook: returns a Map of linkId → click count.
 * Uses server-side GROUP BY via RPC — fetches N rows (one per link),
 * not N×clicks rows.
 */
export function useLinkClickCounts(linkIds: string[]) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (linkIds.length === 0) return;

    const fetchCounts = async () => {
      // Try RPC first (efficient, server-side GROUP BY)
      const { data, error } = await supabase.rpc('get_link_click_counts', {
        p_link_ids: linkIds,
      });

      if (!error && data) {
        const map = new Map<string, number>();
        (data as { link_id: string; click_count: number }[]).forEach(row => {
          map.set(row.link_id, row.click_count);
        });
        setCounts(map);
        return;
      }

      // Fallback: client-side count (works before migration is applied)
      const { data: fallbackData } = await supabase
        .from('link_clicks')
        .select('link_id')
        .in('link_id', linkIds);

      if (fallbackData) {
        const map = new Map<string, number>();
        fallbackData.forEach(row => {
          map.set(row.link_id, (map.get(row.link_id) || 0) + 1);
        });
        setCounts(map);
      }
    };

    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkIds.join(',')]);

  return counts;
}
