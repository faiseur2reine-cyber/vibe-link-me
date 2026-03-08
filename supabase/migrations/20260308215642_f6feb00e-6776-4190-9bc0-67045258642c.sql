
CREATE TABLE public.urgency_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.urgency_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own urgency templates"
  ON public.urgency_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own urgency templates"
  ON public.urgency_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own urgency templates"
  ON public.urgency_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own urgency templates"
  ON public.urgency_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
