-- Align Supabase tables with app expectations (run once in SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / IF NOT EXISTS columns

-- streaks: app reads last_clean_date
ALTER TABLE public.streaks
  ADD COLUMN IF NOT EXISTS last_clean_date DATE;

-- habit_logs: app uses log_date + mood_score columns
ALTER TABLE public.habit_logs
  ADD COLUMN IF NOT EXISTS log_date DATE,
  ADD COLUMN IF NOT EXISTS mood_score SMALLINT,
  ADD COLUMN IF NOT EXISTS stress_level SMALLINT,
  ADD COLUMN IF NOT EXISTS urge_intensity SMALLINT,
  ADD COLUMN IF NOT EXISTS relapsed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS khat_used_today BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS khat_hours_ago INTEGER,
  ADD COLUMN IF NOT EXISTS alcohol_used_today BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trigger_tags TEXT[] DEFAULT '{}';

UPDATE public.habit_logs
SET log_date = created_at::date
WHERE log_date IS NULL AND created_at IS NOT NULL;

UPDATE public.habit_logs
SET mood_score = LEAST(10, GREATEST(1, mood * 2))
WHERE mood_score IS NULL AND mood IS NOT NULL;

UPDATE public.habit_logs
SET stress_level = LEAST(10, GREATEST(1, stress * 2))
WHERE stress_level IS NULL AND stress IS NOT NULL;

UPDATE public.habit_logs
SET urge_intensity = COALESCE(intensity, 5)
WHERE urge_intensity IS NULL;

UPDATE public.habit_logs
SET khat_used_today = COALESCE(khat_used, false)
WHERE khat_used_today IS NULL;

UPDATE public.habit_logs
SET alcohol_used_today = COALESCE(alcohol_used, false)
WHERE alcohol_used_today IS NULL;

-- telehealth bookings (admin + provider dashboards)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
