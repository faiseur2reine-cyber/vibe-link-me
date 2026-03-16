-- Add subscription tracking fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
