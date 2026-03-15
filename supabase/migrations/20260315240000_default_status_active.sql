-- Change default page status from 'draft' to 'active'
-- Draft was never enforced on the public page, so all draft pages are actually live.
-- This aligns the DB default with the actual behavior.

ALTER TABLE public.creator_pages ALTER COLUMN status SET DEFAULT 'active';

-- Update existing draft pages to active (they were always publicly accessible anyway)
UPDATE public.creator_pages SET status = 'active' WHERE status = 'draft';
