CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON public.link_clicks (clicked_at);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views (viewed_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id_clicked_at ON public.link_clicks (link_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_id_viewed_at ON public.page_views (page_id, viewed_at);