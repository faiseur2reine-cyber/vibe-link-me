
-- Fix: block direct inserts on page_views (use record_page_view RPC instead)
DROP POLICY "Anyone can insert page views" ON public.page_views;
CREATE POLICY "No direct inserts on page_views"
  ON public.page_views FOR INSERT
  TO public
  WITH CHECK (false);

-- Add email_weekly column to profiles
ALTER TABLE public.profiles ADD COLUMN email_weekly boolean NOT NULL DEFAULT true;
