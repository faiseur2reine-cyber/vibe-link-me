
-- Remove permissive INSERT policy, rely on record_click function instead
DROP POLICY "Anyone can record clicks" ON public.link_clicks;

-- No direct inserts allowed
CREATE POLICY "No direct inserts" ON public.link_clicks
  FOR INSERT WITH CHECK (false);
