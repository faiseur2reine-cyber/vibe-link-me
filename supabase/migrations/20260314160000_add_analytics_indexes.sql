-- Index for faster analytics queries on link_clicks
-- These speed up: per-link click counts, daily aggregation, geo stats, referrer stats

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id_clicked_at 
ON link_clicks (link_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at 
ON link_clicks (clicked_at DESC);

-- Index for faster page lookups by username (public profile loads)
CREATE INDEX IF NOT EXISTS idx_creator_pages_username 
ON creator_pages (username);

-- Index for faster link lookups by page_id + position (link ordering)
CREATE INDEX IF NOT EXISTS idx_page_links_page_id_position 
ON page_links (page_id, position);
