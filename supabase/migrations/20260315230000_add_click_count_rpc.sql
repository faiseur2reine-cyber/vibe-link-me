-- Efficient click count by link ID — replaces client-side counting
CREATE OR REPLACE FUNCTION public.get_link_click_counts(p_link_ids uuid[])
RETURNS TABLE(link_id uuid, click_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lc.link_id, COUNT(*) as click_count
  FROM public.link_clicks lc
  WHERE lc.link_id = ANY(p_link_ids)
  GROUP BY lc.link_id;
$$;
