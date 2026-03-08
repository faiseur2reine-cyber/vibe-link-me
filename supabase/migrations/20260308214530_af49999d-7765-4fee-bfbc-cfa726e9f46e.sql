ALTER TABLE public.link_clicks ADD COLUMN IF NOT EXISTS ab_variant text DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.record_click(p_link_id uuid, p_referrer text DEFAULT NULL, p_country text DEFAULT NULL, p_city text DEFAULT NULL, p_ab_variant text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.link_clicks (link_id, referrer, country, city, ab_variant)
  VALUES (p_link_id, p_referrer, p_country, p_city, p_ab_variant);
END;
$$;