ALTER TABLE public.creator_pages 
  ADD COLUMN IF NOT EXISTS custom_bg_color text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_text_color text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_accent_color text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_btn_color text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_btn_text_color text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_font text DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS link_layout text DEFAULT 'list',
  ADD COLUMN IF NOT EXISTS custom_css text DEFAULT NULL;