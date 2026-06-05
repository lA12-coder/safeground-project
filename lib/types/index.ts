export type Profile = {
  id: string
  alias: string
  email?: string
  full_name?: string
  language_pref: string
  support_preference: string
  trigger_tags: string[]
  streak_goal: number
  region?: string
  religion?: string
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export type HabitLog = {
  id: string
  user_id: string
  log_date: string
  mood_score: number
  stress_level: number
  urge_intensity: number
  relapsed: boolean
  khat_used_today: boolean
  khat_hours_ago: number | null
  alcohol_used_today: boolean
  trigger_tags: string[]
  ai_intervention_triggered: boolean
  created_at: string
}

export type Streak = {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_clean_days: number
  last_clean_date: string | null
  last_logged_at: string | null
  updated_at: string
}

export type Provider = {
  id: string
  name: string
  org_name?: string
  type: string
  specialization: string
  city: string
  region: string
  bio: string
  languages: string[]
  consultation_fee: number | null
  pro_bono: boolean
  online: boolean
  in_person: boolean
  is_verified: boolean
  is_active: boolean
  email?: string
  user_id?: string
  phone: string
  rating: number
  session_types?: string[]
  availability_slots?: Record<string, unknown>
  faith_category?: string
  traditions?: string[]
  ministries?: string[]
  programs?: string[]
  mentors?: string[]
  created_at: string
}

export type TelehealthBooking = {
  id: string
  user_id: string
  provider_id: string
  session_type: string
  scheduled_at: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  meeting_link?: string
  created_at: string
}

export type AnonymousChat = {
  id: string
  room_id: string
  user_alias: string
  message: string
  message_type: string
  is_flagged: boolean
  flag_reason?: string
  is_deleted: boolean
  created_at: string
}

export type GuardianControl = {
  id: string
  user_id: string
  guardian_alias: string
  relationship: string
  monitoring_level: string
  notify_on_panic: boolean
  notify_on_relapse: boolean
  notify_streak_break: boolean
  token: string
  is_active: boolean
  last_accessed_at?: string
  created_at: string
}

export type PanicAlert = {
  id: string
  user_id: string
  triggered_at: string
  status: 'active' | 'resolved'
  coping_steps_completed: number
  completed_at?: string
}

export type Milestone = {
  id: string
  user_id: string
  days: number
  achieved_at: string
}

export type NotificationLog = {
  id: string
  user_id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

export type AdminMetrics = {
  total_users: number
  panic_today: number
  active_streaks: number
  provider_queue: number
  avg_streak: number
  relapse_rate_7d: number
  chat_today: number
  flagged_messages: number
  new_users_7d: number
  activity_30d: { date: string; checkins: number; panic: number }[]
}

export type GuardianViewData = {
  alias: string
  current_streak: number
  longest_streak: number
  last_7_days_mood: { day: string; mood: number }[]
  last_panic_event_date: string | null
  recent_alerts: { type: string; date: string }[]
}

export type AdminSeedRequest = {
  type: 'users' | 'logs' | 'providers' | 'chat' | 'demo' | 'clear'
}

// == New Types for Complete Admin System ==

export type FaithOrganization = {
  id: string
  org_name: string
  faith_tradition: 'orthodox' | 'protestant' | 'muslim' | 'traditional'
  rep_name: string
  rep_phone: string
  rep_email: string
  program_name: string
  description: string
  recovery_activities: string[]
  weekly_structure: string
  city: string
  region: string
  verification_docs: string[]
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export type AdminUser = {
  id: string
  email: string
  alias: string
  role: 'super_admin' | 'platform_admin' | 'moderator' | 'provider_reviewer' | 'analytics_manager'
  created_at: string
}

export type PanicEvent = {
  id: string
  user_id: string
  alias: string
  triggered_at: string
  status: 'active' | 'resolved'
  coping_steps_completed: number
  completed_at: string | null
}

export type ModerationAction = 'delete' | 'restore' | 'warn' | 'mute' | 'ban'

export type ContentItem = {
  id: string
  type: 'affirmation' | 'article' | 'emergency_message' | 'faith_resource' | 'professional_resource'
  title: string
  body: string
  language: string
  tags: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export type FeatureFlags = {
  chat: boolean
  guardian: boolean
  faith_programs: boolean
  ai_coach: boolean
}

export type SystemHealth = {
  database: 'healthy' | 'degraded' | 'down'
  api: 'healthy' | 'degraded' | 'down'
  realtime: 'healthy' | 'degraded' | 'down'
  sms: 'healthy' | 'degraded' | 'down'
  ai: 'healthy' | 'degraded' | 'down'
}

export type AnalyticsData = {
  user_growth: { month: string; count: number }[]
  recovery_success: { label: string; rate: number }[]
  avg_streak_distribution: { label: string; value: number }[]
  common_triggers: { trigger: string; count: number }[]
  active_regions: { region: string; count: number }[]
}

export type BookingMetrics = {
  upcoming: number
  completed: number
  cancelled: number
  no_show: number
}

export type GuardianMetrics = {
  active_links: number
  guardian_types: { type: string; count: number }[]
  monitoring_levels: { level: string; count: number }[]
}

export type UserProfile = Profile & {
  streak?: Streak
  guardian?: GuardianControl
  last_checkin?: string
}
