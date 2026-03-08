CREATE TABLE public.custom_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own templates" ON public.custom_templates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.custom_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.custom_templates FOR DELETE TO authenticated USING (auth.uid() = user_id);