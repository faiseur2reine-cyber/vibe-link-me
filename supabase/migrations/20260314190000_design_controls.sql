-- Design controls: sliders + pickers
ALTER TABLE creator_pages ADD COLUMN IF NOT EXISTS button_radius integer DEFAULT 16;
ALTER TABLE creator_pages ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'filled';
ALTER TABLE creator_pages ADD COLUMN IF NOT EXISTS avatar_shape text DEFAULT 'circle';
ALTER TABLE creator_pages ADD COLUMN IF NOT EXISTS content_spacing text DEFAULT 'default';
