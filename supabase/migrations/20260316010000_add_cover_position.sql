-- Add cover_position for focal point selection
-- Stores CSS object-position value like "50% 30%" or "center top"
ALTER TABLE public.creator_pages ADD COLUMN IF NOT EXISTS cover_position text DEFAULT '50% 50%';
