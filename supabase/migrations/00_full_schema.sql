-- =============================================================================
-- SafeGround — COMPLETE DATABASE SCHEMA (single file)
-- =============================================================================
-- Run this ENTIRE file once in Supabase → SQL Editor → New query → Paste → Run
--
-- Safe to re-run on an existing project: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- After running:
--   1. Database → Replication → enable `anonymous_chat` for Realtime chat
--   2. npx tsx scripts/seed.ts          (demo data)
--   3. npx tsx scripts/seedKnowledgeBase.ts  (RAG embeddings, needs OPENAI_API_KEY)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------
-- 1. Profiles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  alias TEXT NOT NULL DEFAULT 'Anonymous',
  email TEXT,
  full_name TEXT,
  language_pref TEXT NOT NULL DEFAULT 'english',
  support_preference TEXT NOT NULL DEFAULT 'secular',
  trigger_tags TEXT[] NOT NULL DEFAULT '{}',
  streak_goal INTEGER NOT NULL DEFAULT 30,
  region TEXT,
  religion TEXT,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legacy columns from older migrations (harmless if unused)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language TEXT,
  ADD COLUMN IF NOT EXISTS support_mode TEXT,
  ADD COLUMN IF NOT EXISTS guardian_opt_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recovery_goal TEXT,
  ADD COLUMN IF NOT EXISTS triggers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT false;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. Streaks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_clean_days INTEGER NOT NULL DEFAULT 0,
  last_clean_date DATE,
  last_logged_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade: old table may have separate id column — add missing app columns
ALTER TABLE public.streaks
  ADD COLUMN IF NOT EXISTS last_clean_date DATE,
  ADD COLUMN IF NOT EXISTS last_logged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "streaks_select_own" ON public.streaks;
CREATE POLICY "streaks_select_own"
  ON public.streaks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "streaks_insert_own" ON public.streaks;
CREATE POLICY "streaks_insert_own"
  ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "streaks_update_own" ON public.streaks;
CREATE POLICY "streaks_update_own"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. Habit logs (supports both legacy + app column names)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- App columns (dashboard, check-in, admin)
  log_date DATE,
  mood_score SMALLINT DEFAULT 5,
  stress_level SMALLINT DEFAULT 5,
  urge_intensity SMALLINT DEFAULT 5,
  relapsed BOOLEAN DEFAULT false,
  khat_used_today BOOLEAN DEFAULT false,
  khat_hours_ago INTEGER,
  alcohol_used_today BOOLEAN DEFAULT false,
  trigger_tags TEXT[] DEFAULT '{}',
  ai_intervention_triggered BOOLEAN DEFAULT false,
  -- Legacy columns (older check-in path)
  log_type TEXT DEFAULT 'daily',
  mood SMALLINT,
  stress SMALLINT,
  urge TEXT,
  khat_used BOOLEAN DEFAULT false,
  alcohol_used BOOLEAN DEFAULT false,
  triggers JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  intensity SMALLINT,
  context_tags JSONB DEFAULT '[]'::jsonb,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habit_logs
  ADD COLUMN IF NOT EXISTS log_date DATE,
  ADD COLUMN IF NOT EXISTS mood_score SMALLINT,
  ADD COLUMN IF NOT EXISTS stress_level SMALLINT,
  ADD COLUMN IF NOT EXISTS urge_intensity SMALLINT,
  ADD COLUMN IF NOT EXISTS relapsed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS khat_used_today BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS khat_hours_ago INTEGER,
  ADD COLUMN IF NOT EXISTS alcohol_used_today BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trigger_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS log_type TEXT DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS mood SMALLINT,
  ADD COLUMN IF NOT EXISTS stress SMALLINT,
  ADD COLUMN IF NOT EXISTS urge TEXT,
  ADD COLUMN IF NOT EXISTS khat_used BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS alcohol_used BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS triggers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS intensity SMALLINT,
  ADD COLUMN IF NOT EXISTS context_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.habit_logs SET log_date = created_at::date
WHERE log_date IS NULL AND created_at IS NOT NULL;

UPDATE public.habit_logs SET mood_score = LEAST(10, GREATEST(1, mood * 2))
WHERE mood_score IS NULL AND mood IS NOT NULL;

UPDATE public.habit_logs SET stress_level = LEAST(10, GREATEST(1, stress * 2))
WHERE stress_level IS NULL AND stress IS NOT NULL;

UPDATE public.habit_logs SET urge_intensity = COALESCE(intensity, 5)
WHERE urge_intensity IS NULL;

UPDATE public.habit_logs SET khat_used_today = COALESCE(khat_used, false)
WHERE khat_used_today IS NULL;

UPDATE public.habit_logs SET alcohol_used_today = COALESCE(alcohol_used, false)
WHERE alcohol_used_today IS NULL;

CREATE INDEX IF NOT EXISTS habit_logs_user_log_date_idx
  ON public.habit_logs (user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS habit_logs_user_created_idx
  ON public.habit_logs (user_id, created_at DESC);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "habit_logs_select_own" ON public.habit_logs;
CREATE POLICY "habit_logs_select_own"
  ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "habit_logs_insert" ON public.habit_logs;
CREATE POLICY "habit_logs_insert"
  ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "habit_logs_update_own" ON public.habit_logs;
CREATE POLICY "habit_logs_update_own"
  ON public.habit_logs FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. Providers (clinical + faith orgs + spiritual teachers)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_name TEXT,
  type TEXT NOT NULL,
  specialization TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT 'Ethiopia',
  bio TEXT NOT NULL DEFAULT '',
  languages TEXT[] NOT NULL DEFAULT '{}',
  consultation_fee INTEGER,
  pro_bono BOOLEAN NOT NULL DEFAULT false,
  online BOOLEAN NOT NULL DEFAULT false,
  in_person BOOLEAN NOT NULL DEFAULT true,
  session_types TEXT[],
  availability_slots JSONB,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT false,
  phone TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 0,
  email TEXT,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS availability_slots JSONB;

CREATE INDEX IF NOT EXISTS idx_providers_email ON public.providers (email);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers (user_id);
CREATE INDEX IF NOT EXISTS idx_providers_type_verified ON public.providers (type, is_verified, is_active);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "providers_select_verified" ON public.providers;
CREATE POLICY "providers_select_verified"
  ON public.providers FOR SELECT USING (is_verified = true AND is_active = true);

DROP POLICY IF EXISTS "providers_insert_public" ON public.providers;
CREATE POLICY "providers_insert_public"
  ON public.providers FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 5. Anonymous chat (live chat + admin moderation)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anonymous_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL DEFAULT 'global',
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  alias TEXT DEFAULT 'Anonymous',
  session_id TEXT DEFAULT 'anon',
  reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_alias TEXT,
  message TEXT,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.anonymous_chat
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS alias TEXT DEFAULT 'Anonymous',
  ADD COLUMN IF NOT EXISTS session_id TEXT DEFAULT 'anon',
  ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS user_alias TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS anonymous_chat_room_created_idx
  ON public.anonymous_chat (room_id, created_at ASC);

ALTER TABLE public.anonymous_chat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anonymous_chat_select" ON public.anonymous_chat;
CREATE POLICY "anonymous_chat_select"
  ON public.anonymous_chat FOR SELECT USING (true);

DROP POLICY IF EXISTS "anonymous_chat_insert" ON public.anonymous_chat;
CREATE POLICY "anonymous_chat_insert"
  ON public.anonymous_chat FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "anonymous_chat_update" ON public.anonymous_chat;
CREATE POLICY "anonymous_chat_update"
  ON public.anonymous_chat FOR UPDATE USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 6. Guardian controls
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guardian_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  guardian_alias TEXT NOT NULL DEFAULT 'Guardian',
  relationship TEXT NOT NULL DEFAULT 'trusted_friend',
  monitoring_level TEXT NOT NULL DEFAULT 'alert_only',
  notify_on_panic BOOLEAN NOT NULL DEFAULT true,
  notify_on_relapse BOOLEAN NOT NULL DEFAULT false,
  notify_streak_break BOOLEAN NOT NULL DEFAULT true,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.guardian_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guardian_controls_select_own" ON public.guardian_controls;
CREATE POLICY "guardian_controls_select_own"
  ON public.guardian_controls FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "guardian_controls_insert_own" ON public.guardian_controls;
CREATE POLICY "guardian_controls_insert_own"
  ON public.guardian_controls FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "guardian_controls_update_own" ON public.guardian_controls;
CREATE POLICY "guardian_controls_update_own"
  ON public.guardian_controls FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. Telehealth bookings (directory + spiritual program)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.telehealth_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'initial',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  amount_etb INTEGER,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.telehealth_bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS amount_etb INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS telehealth_bookings_user_idx
  ON public.telehealth_bookings (user_id, scheduled_at DESC);

ALTER TABLE public.telehealth_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "telehealth_bookings_select_own" ON public.telehealth_bookings;
CREATE POLICY "telehealth_bookings_select_own"
  ON public.telehealth_bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "telehealth_bookings_insert_own" ON public.telehealth_bookings;
CREATE POLICY "telehealth_bookings_insert_own"
  ON public.telehealth_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "telehealth_bookings_update_own" ON public.telehealth_bookings;
CREATE POLICY "telehealth_bookings_update_own"
  ON public.telehealth_bookings FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. Legacy bookings table (fallback)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  notes TEXT,
  session_type TEXT,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  amount_etb INTEGER,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS amount_etb INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_own" ON public.bookings;
CREATE POLICY "bookings_select_own"
  ON public.bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
CREATE POLICY "bookings_insert_own"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. Notification logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_logs_select_own" ON public.notification_logs;
CREATE POLICY "notification_logs_select_own"
  ON public.notification_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_logs_insert_own" ON public.notification_logs;
CREATE POLICY "notification_logs_insert_own"
  ON public.notification_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 10. Milestones
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  days INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, days)
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "milestones_select_own" ON public.milestones;
CREATE POLICY "milestones_select_own"
  ON public.milestones FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "milestones_insert_own" ON public.milestones;
CREATE POLICY "milestones_insert_own"
  ON public.milestones FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 11. Knowledge base (RAG / AI chat)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  source TEXT,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding
  ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read knowledge_base" ON public.knowledge_base;
CREATE POLICY "Anyone can read knowledge_base"
  ON public.knowledge_base FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can insert knowledge_base" ON public.knowledge_base;
CREATE POLICY "Service role can insert knowledge_base"
  ON public.knowledge_base FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update knowledge_base" ON public.knowledge_base;
CREATE POLICY "Service role can update knowledge_base"
  ON public.knowledge_base FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service role can delete knowledge_base" ON public.knowledge_base;
CREATE POLICY "Service role can delete knowledge_base"
  ON public.knowledge_base FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.match_knowledge_base(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  category TEXT,
  source TEXT,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.category,
    kb.source,
    1 - (kb.embedding <=> query_embedding) AS similarity,
    kb.created_at
  FROM public.knowledge_base kb
  WHERE kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- -----------------------------------------------------------------------------
-- 12. Auto-create profile + streak on signup
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, alias)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'alias', NEW.raw_user_meta_data ->> 'display_name', 'Anonymous')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 13. Realtime for community chat
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public' AND tablename = 'anonymous_chat'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_chat;
  END IF;
EXCEPTION WHEN undefined_object THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 14. Backfill profiles + streaks for existing auth users
-- -----------------------------------------------------------------------------
INSERT INTO public.profiles (id, alias)
SELECT id, COALESCE(raw_user_meta_data ->> 'alias', raw_user_meta_data ->> 'display_name', 'Anonymous')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.streaks (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 15. Optional seed chat milestones (safe to skip if rows exist)
-- -----------------------------------------------------------------------------
INSERT INTO public.anonymous_chat (room_id, message_type, content, alias, session_id, user_alias, message)
SELECT 'global', 'milestone_share',
  'Day 30 clean. Grateful for this community — you are not alone.',
  'HopefulFalcon', 'seed', 'HopefulFalcon',
  'Day 30 clean. Grateful for this community — you are not alone.'
WHERE NOT EXISTS (SELECT 1 FROM public.anonymous_chat WHERE alias = 'HopefulFalcon' LIMIT 1);

INSERT INTO public.anonymous_chat (room_id, message_type, content, alias, session_id, user_alias, message)
SELECT 'global', 'milestone_share',
  'Prayed through the urge tonight. Still standing.',
  'QuietRiver', 'seed', 'QuietRiver',
  'Prayed through the urge tonight. Still standing.'
WHERE NOT EXISTS (SELECT 1 FROM public.anonymous_chat WHERE alias = 'QuietRiver' LIMIT 1);

-- =============================================================================
-- 16. Business model: AI subscription + booking commission
-- =============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS ai_requests_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

ALTER TABLE public.telehealth_bookings
  ADD COLUMN IF NOT EXISTS booking_category TEXT DEFAULT 'clinical',
  ADD COLUMN IF NOT EXISTS platform_fee_etb INTEGER,
  ADD COLUMN IF NOT EXISTS provider_payout_etb INTEGER;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_category TEXT DEFAULT 'clinical',
  ADD COLUMN IF NOT EXISTS platform_fee_etb INTEGER,
  ADD COLUMN IF NOT EXISTS provider_payout_etb INTEGER;

-- =============================================================================
-- Done. Verify with:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
-- =============================================================================
