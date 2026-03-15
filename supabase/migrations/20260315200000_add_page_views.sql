-- Create page_views table for tracking profile page views
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid NOT NULL REFERENCES public.creator_pages(id) ON DELETE CASCADE,
  referrer text,
  country text,
  city text,
  viewed_at timestamptz DEFAULT now()
);

-- RLS: service role inserts, page owners read
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page owners can read views"
  ON public.page_views FOR SELECT TO authenticated
  USING (
    page_id IN (
      SELECT id FROM public.creator_pages WHERE user_id = auth.uid()
    )
  );

-- No direct insert — only via record_page_view function (SECURITY DEFINER)
CREATE POLICY "No direct inserts on page_views"
  ON public.page_views FOR INSERT WITH CHECK (false);

-- Function to record a page view (called from edge function with service role)
CREATE OR REPLACE FUNCTION public.record_page_view(
  p_page_id uuid,
  p_referrer text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_views (page_id, referrer, country, city)
  VALUES (p_page_id, p_referrer, p_country, p_city);
END;
$$;

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_page_views_page_id ON public.page_views (page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views (viewed_at);
