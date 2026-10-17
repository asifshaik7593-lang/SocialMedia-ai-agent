CREATE TABLE IF NOT EXISTS public.campaign (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_icon TEXT NOT NULL,
  agent_office TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.campaign
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS campaign_name TEXT,
  ADD COLUMN IF NOT EXISTS campaign_icon TEXT,
  ADD COLUMN IF NOT EXISTS agent_office TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS campaign_user_id_idx ON public.campaign (user_id);
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.campaign FROM anon, authenticated;
GRANT SELECT, INSERT ON public.campaign TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaign' AND policyname = 'users can read their own campaign'
  ) THEN
    CREATE POLICY "users can read their own campaign"
      ON public.campaign FOR SELECT TO authenticated
      USING (user_id = (SELECT auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaign' AND policyname = 'users can create their own campaign'
  ) THEN
    CREATE POLICY "users can create their own campaign"
      ON public.campaign FOR INSERT TO authenticated
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
END
$$;
