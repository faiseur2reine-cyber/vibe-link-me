
-- Create page_views table
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid NOT NULL REFERENCES public.creator_pages(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  referrer text,
  country text,
  city text
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Public can insert (via edge function / rpc)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  TO public
  WITH CHECK (true);

-- Page owners can read their views
CREATE POLICY "Page owners can read views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM public.creator_pages WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_page_views_page_id ON public.page_views(page_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at);

-- Function to record a page view (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.record_page_view(
  p_page_id uuid,
  p_referrer text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.page_views (page_id, referrer, country, city)
  VALUES (p_page_id, p_referrer, p_country, p_city);
END;
$$;
