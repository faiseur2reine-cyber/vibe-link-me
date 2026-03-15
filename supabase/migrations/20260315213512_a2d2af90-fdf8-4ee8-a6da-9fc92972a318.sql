-- Add device_type, browser, os columns to page_views
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS browser text,
  ADD COLUMN IF NOT EXISTS os text;

-- Add device_type, browser, os columns to link_clicks
ALTER TABLE public.link_clicks
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS browser text,
  ADD COLUMN IF NOT EXISTS os text;

-- Update record_page_view function to accept new params
CREATE OR REPLACE FUNCTION public.record_page_view(
  p_page_id uuid,
  p_referrer text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_device_type text DEFAULT NULL,
  p_browser text DEFAULT NULL,
  p_os text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.page_views (page_id, referrer, country, city, device_type, browser, os)
  VALUES (p_page_id, p_referrer, p_country, p_city, p_device_type, p_browser, p_os);
END;
$$;

-- Add overload of record_click that accepts device info
CREATE OR REPLACE FUNCTION public.record_click(
  p_link_id uuid,
  p_referrer text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_ab_variant text DEFAULT NULL,
  p_device_type text DEFAULT NULL,
  p_browser text DEFAULT NULL,
  p_os text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.link_clicks (link_id, referrer, country, city, ab_variant, device_type, browser, os)
  VALUES (p_link_id, p_referrer, p_country, p_city, p_ab_variant, p_device_type, p_browser, p_os);
END;
$$;