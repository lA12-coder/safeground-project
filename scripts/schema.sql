-- SafeGround Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/cwrnufudrpsbchnunqha/sql/new)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alias TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  language_pref TEXT NOT NULL DEFAULT 'english',
  support_preference TEXT NOT NULL DEFAULT 'secular',
  trigger_tags TEXT[] NOT NULL DEFAULT '{}',
  streak_goal INTEGER NOT NULL DEFAULT 30,
  region TEXT,
  religion TEXT,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_clean_days INTEGER NOT NULL DEFAULT 0,
  last_clean_date DATE,
  last_logged_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habit Logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  mood_score INTEGER NOT NULL DEFAULT 5,
  stress_level INTEGER NOT NULL DEFAULT 5,
  urge_intensity INTEGER NOT NULL DEFAULT 5,
  relapsed BOOLEAN NOT NULL DEFAULT false,
  khat_used_today BOOLEAN NOT NULL DEFAULT false,
  khat_hours_ago INTEGER,
  alcohol_used_today BOOLEAN NOT NULL DEFAULT false,
  trigger_tags TEXT[] NOT NULL DEFAULT '{}',
  ai_intervention_triggered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- 4. Providers
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  org_name TEXT,
  type TEXT NOT NULL,
  specialization TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Ethiopia',
  bio TEXT NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Anonymous Chat
CREATE TABLE IF NOT EXISTS anonymous_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  user_alias TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Guardian Controls
CREATE TABLE IF NOT EXISTS guardian_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guardian_alias TEXT NOT NULL DEFAULT 'Guardian',
  relationship TEXT NOT NULL DEFAULT 'trusted_friend',
  monitoring_level TEXT NOT NULL DEFAULT 'alert_only',
  notify_on_panic BOOLEAN NOT NULL DEFAULT true,
  notify_on_relapse BOOLEAN NOT NULL DEFAULT false,
  notify_streak_break BOOLEAN NOT NULL DEFAULT true,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Telehealth Bookings
CREATE TABLE IF NOT EXISTS telehealth_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'initial',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notification Logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  days INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, days)
);
