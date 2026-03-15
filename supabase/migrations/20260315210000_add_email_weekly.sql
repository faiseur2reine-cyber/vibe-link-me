-- Add weekly email preference to profiles (default: true for new users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_weekly boolean DEFAULT true;
