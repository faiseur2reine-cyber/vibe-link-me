-- Link visibility toggle: hide links without deleting them
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true NOT NULL;
ALTER TABLE page_links ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true NOT NULL;
