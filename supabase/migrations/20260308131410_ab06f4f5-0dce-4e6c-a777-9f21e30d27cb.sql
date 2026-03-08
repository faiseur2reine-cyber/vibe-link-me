
-- Click tracking table
CREATE TABLE public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  country TEXT
);

-- Index for fast aggregation
CREATE INDEX idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON public.link_clicks(clicked_at);

-- RLS: anyone can insert (public page clicks), owner can read
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (clicks from public pages)
CREATE POLICY "Anyone can record clicks" ON public.link_clicks
  FOR INSERT WITH CHECK (true);

-- Only link owners can read their click data
CREATE POLICY "Link owners can read clicks" ON public.link_clicks
  FOR SELECT TO authenticated
  USING (
    link_id IN (
      SELECT id FROM public.links WHERE user_id = auth.uid()
    )
  );

-- Function to record a click (callable from public pages without auth)
CREATE OR REPLACE FUNCTION public.record_click(p_link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.link_clicks (link_id) VALUES (p_link_id);
END;
$$;
