import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Lightweight hook: returns a Map of linkId → click count.
 * Only fetches totals, not full analytics.
 */
export function useLinkClickCounts(linkIds: string[]) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (linkIds.length === 0) return;

    const fetchCounts = async () => {
      const { data } = await supabase
        .from('link_clicks')
        .select('link_id')
        .in('link_id', linkIds);

      if (!data) return;

      const map = new Map<string, number>();
      data.forEach(row => {
        map.set(row.link_id, (map.get(row.link_id) || 0) + 1);
      });
      setCounts(map);
    };

    fetchCounts();
  }, [linkIds.join(',')]);

  return counts;
}
