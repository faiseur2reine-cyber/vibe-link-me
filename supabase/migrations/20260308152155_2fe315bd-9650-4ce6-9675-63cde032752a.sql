
ALTER TABLE public.links 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS bg_color text,
  ADD COLUMN IF NOT EXISTS text_color text,
  ADD COLUMN IF NOT EXISTS style text NOT NULL DEFAULT 'default';
