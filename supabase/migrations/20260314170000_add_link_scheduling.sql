-- Link scheduling: show/hide links based on date/time
ALTER TABLE page_links ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT NULL;
ALTER TABLE page_links ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT NULL;

-- Index for filtering active links
CREATE INDEX IF NOT EXISTS idx_page_links_schedule 
ON page_links (page_id, scheduled_at, expires_at);
