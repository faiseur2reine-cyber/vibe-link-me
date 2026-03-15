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
