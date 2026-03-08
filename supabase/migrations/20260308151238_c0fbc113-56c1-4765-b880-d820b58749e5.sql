
-- Add cover photo, NSFW flag, and social links to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS cover_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_nsfw boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add thumbnail to links
ALTER TABLE public.links 
  ADD COLUMN IF NOT EXISTS thumbnail_url text DEFAULT NULL;
