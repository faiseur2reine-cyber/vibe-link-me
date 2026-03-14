
ALTER TABLE public.creator_pages
  ADD COLUMN IF NOT EXISTS tracking_meta_pixel text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tracking_ga4 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tracking_tiktok_pixel text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS utm_source text NOT NULL DEFAULT 'instagram',
  ADD COLUMN IF NOT EXISTS utm_medium text NOT NULL DEFAULT 'bio',
  ADD COLUMN IF NOT EXISTS utm_campaign text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS safe_page_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS safe_page_redirect_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS geo_greeting_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS connected_label text NOT NULL DEFAULT 'Active now',
  ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS operator text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS revenue_monthly numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_commission numeric NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
