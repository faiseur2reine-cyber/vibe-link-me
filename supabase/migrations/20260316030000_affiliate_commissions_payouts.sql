-- Affiliate commission history — one row per commission event
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  amount integer NOT NULL, -- cents
  currency text NOT NULL DEFAULT 'eur',
  plan text NOT NULL, -- 'starter' or 'pro'
  event_type text NOT NULL DEFAULT 'subscription', -- 'subscription', 'renewal', 'upgrade'
  stripe_invoice_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can read own commissions"
  ON public.affiliate_commissions FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

CREATE INDEX idx_commissions_referrer ON public.affiliate_commissions(referrer_id);
CREATE INDEX idx_commissions_created ON public.affiliate_commissions(created_at DESC);

-- Affiliate payouts — tracks Stripe Connect transfers
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  amount integer NOT NULL, -- cents
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
  stripe_transfer_id text,
  stripe_payout_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can read own payouts"
  ON public.affiliate_payouts FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

CREATE INDEX idx_payouts_referrer ON public.affiliate_payouts(referrer_id);

-- Stripe Connect account ID on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_connect_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS affiliate_balance integer NOT NULL DEFAULT 0; -- accumulated unpaid balance in cents
