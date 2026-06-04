export type Profile = {
  id: string;
  email: string;
  full_name: string;
  alias: string;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  user_id: string;
  habit_type: 'mindfulness' | 'physical' | 'social' | 'creative' | 'spiritual';
  duration_minutes: number;
  mood_before: number;
  mood_after: number;
  notes: string;
  created_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  habit_type: string;
  current_streak: number;
  longest_streak: number;
  last_logged_at: string;
  updated_at: string;
};

export type Provider = {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  location: string;
  bio: string;
  verified: boolean;
  rating: number;
  created_at: string;
};

export type TelehealthBooking = {
  id: string;
  user_id: string;
  provider_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
};

export type AnonymousChat = {
  id: string;
  room_id: string;
  user_alias: string;
  message: string;
  flagged: boolean;
  flag_reason?: string;
  created_at: string;
};

export type GuardianControl = {
  id: string;
  user_id: string;
  guardian_phone: string;
  activation_token: string;
  activated: boolean;
  activated_at?: string;
  created_at: string;
};

export type PanicAlert = {
  id: string;
  user_id: string;
  triggered_at: string;
  status: 'active' | 'resolved';
  coping_steps_completed: number;
  completed_at?: string;
};
