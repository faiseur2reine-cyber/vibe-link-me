
-- Update record_click to accept referrer, country, city
CREATE OR REPLACE FUNCTION public.record_click(p_link_id uuid, p_referrer text DEFAULT NULL, p_country text DEFAULT NULL, p_city text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.link_clicks (link_id, referrer, country, city)
  VALUES (p_link_id, p_referrer, p_country, p_city);
END;
$$;
