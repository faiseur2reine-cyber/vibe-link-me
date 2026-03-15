-- Add device tracking columns to link_clicks and page_views
-- These are populated by the edge function from User-Agent parsing

ALTER TABLE public.link_clicks ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE public.link_clicks ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE public.link_clicks ADD COLUMN IF NOT EXISTS os text;

ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS os text;

-- Update the record_click function to accept new params
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
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.link_clicks (link_id, referrer, country, city, ab_variant, device_type, browser, os)
  VALUES (p_link_id, p_referrer, p_country, p_city, p_ab_variant, p_device_type, p_browser, p_os);
END;
$$;

-- Update the record_page_view function to accept new params
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
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_views (page_id, referrer, country, city, device_type, browser, os)
  VALUES (p_page_id, p_referrer, p_country, p_city, p_device_type, p_browser, p_os);
END;
$$;

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_link_clicks_device ON public.link_clicks (device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_device ON public.page_views (device_type);
