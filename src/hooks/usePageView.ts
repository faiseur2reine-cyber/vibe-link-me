import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const VIEWED_KEY = 'pv_';

/**
 * Records a page view once per session per page.
 * Uses the rate-limited-click edge function with a special link_id convention:
 *   link_id = "pageview_<page_id>"
 * 
 * The analytics panel can filter these to calculate conversion rate.
 */
export function usePageView(pageId: string | undefined) {
  useEffect(() => {
    if (!pageId) return;

    // Check if already viewed this session
    const key = VIEWED_KEY + pageId;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}

    // Record the view
    const referrer = document.referrer || 'direct';
    supabase.functions.invoke('rate-limited-click', {
      body: {
        link_id: `pageview_${pageId}`,
        referrer,
        ab_variant: null,
      },
    }).catch(() => {}); // Silent fail
  }, [pageId]);
}
