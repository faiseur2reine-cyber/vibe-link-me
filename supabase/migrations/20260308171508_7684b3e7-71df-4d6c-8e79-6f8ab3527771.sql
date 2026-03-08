
-- Create creator_pages table (1 account = N creator pages)
CREATE TABLE public.creator_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  theme text NOT NULL DEFAULT 'default',
  is_nsfw boolean NOT NULL DEFAULT false,
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add page_id to links (nullable for now, will migrate data)
ALTER TABLE public.links ADD COLUMN page_id uuid REFERENCES public.creator_pages(id) ON DELETE CASCADE;

-- Add city to link_clicks
ALTER TABLE public.link_clicks ADD COLUMN city text;

-- Enable RLS on creator_pages
ALTER TABLE public.creator_pages ENABLE ROW LEVEL SECURITY;

-- RLS: Creator pages are publicly readable (for public profiles)
CREATE POLICY "Creator pages are publicly readable"
  ON public.creator_pages FOR SELECT
  USING (true);

-- RLS: Users can insert their own creator pages
CREATE POLICY "Users can insert own creator pages"
  ON public.creator_pages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update their own creator pages
CREATE POLICY "Users can update own creator pages"
  ON public.creator_pages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- RLS: Users can delete their own creator pages
CREATE POLICY "Users can delete own creator pages"
  ON public.creator_pages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Migrate existing data: create a creator_page for each profile that has links
INSERT INTO public.creator_pages (user_id, username, display_name, bio, avatar_url, cover_url, theme, is_nsfw, social_links)
SELECT p.user_id, p.username, p.display_name, p.bio, p.avatar_url, p.cover_url, p.theme, p.is_nsfw, p.social_links
FROM public.profiles p;

-- Update links to reference creator_pages
UPDATE public.links l
SET page_id = cp.id
FROM public.creator_pages cp
WHERE cp.user_id = l.user_id;

-- Updated_at trigger for creator_pages
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.creator_pages
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Enable realtime for creator_pages
ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_pages;
