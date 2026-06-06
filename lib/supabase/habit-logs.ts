import type { SupabaseClient } from '@supabase/supabase-js';
import { isMissingSupabaseColumn } from '@/lib/supabase/schema-errors';

export type HabitLogInput = {
  user_id: string;
  log_date?: string;
  mood_score?: number;
  stress_level?: number;
  urge_intensity?: number;
  relapsed?: boolean;
  khat_used_today?: boolean;
  khat_hours_ago?: number | null;
  alcohol_used_today?: boolean;
  trigger_tags?: string[] | unknown;
  ai_intervention_triggered?: boolean;
  log_type?: 'daily' | 'panic' | 'relapse';
};

type HabitLogRow = Record<string, unknown>;

function toMoodSmall(score: number | undefined): number | undefined {
  if (score == null) return undefined;
  return Math.max(1, Math.min(5, Math.round(score / 2)));
}

function urgeLabel(intensity: number | undefined): string | undefined {
  if (intensity == null) return undefined;
  if (intensity <= 2) return 'None';
  if (intensity <= 4) return 'Low';
  if (intensity <= 7) return 'Medium';
  return 'High';
}

/** Normalize rows from either schema into the shape the dashboard expects. */
export function normalizeHabitLogRow(row: HabitLogRow) {
  const createdAt = typeof row.created_at === 'string' ? row.created_at : undefined;
  const logDate =
    (typeof row.log_date === 'string' && row.log_date) ||
    (createdAt ? createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);

  const moodScore =
    typeof row.mood_score === 'number'
      ? row.mood_score
      : typeof row.mood === 'number'
        ? row.mood * 2
        : 5;

  const stressLevel =
    typeof row.stress_level === 'number'
      ? row.stress_level
      : typeof row.stress === 'number'
        ? row.stress * 2
        : 5;

  let urgeIntensity = typeof row.urge_intensity === 'number' ? row.urge_intensity : undefined;
  if (urgeIntensity == null && typeof row.intensity === 'number') {
    urgeIntensity = row.intensity;
  }
  if (urgeIntensity == null && typeof row.urge === 'string') {
    const map: Record<string, number> = { None: 1, Low: 3, Medium: 6, High: 9 };
    urgeIntensity = map[row.urge] ?? 5;
  }
  if (urgeIntensity == null) urgeIntensity = 5;

  const khatUsed =
    typeof row.khat_used_today === 'boolean'
      ? row.khat_used_today
      : typeof row.khat_used === 'boolean'
        ? row.khat_used
        : false;

  const relapsed =
    typeof row.relapsed === 'boolean'
      ? row.relapsed
      : row.log_type === 'relapse' || khatUsed;

  return {
    ...row,
    log_date: logDate,
    mood_score: moodScore,
    stress_level: stressLevel,
    urge_intensity: urgeIntensity,
    khat_used_today: khatUsed,
    khat_hours_ago: row.khat_hours_ago ?? null,
    alcohol_used_today:
      typeof row.alcohol_used_today === 'boolean'
        ? row.alcohol_used_today
        : typeof row.alcohol_used === 'boolean'
          ? row.alcohol_used
          : false,
    relapsed,
    ai_intervention_triggered: Boolean(row.ai_intervention_triggered),
  };
}

function modernInsert(input: HabitLogInput) {
  const log_date = input.log_date ?? new Date().toISOString().split('T')[0];
  return {
    user_id: input.user_id,
    log_date,
    mood_score: input.mood_score ?? 5,
    stress_level: input.stress_level ?? 5,
    urge_intensity: input.urge_intensity ?? 5,
    relapsed: input.relapsed ?? input.khat_used_today ?? false,
    khat_used_today: input.khat_used_today ?? false,
    khat_hours_ago: input.khat_hours_ago ?? null,
    alcohol_used_today: input.alcohol_used_today ?? false,
    trigger_tags: Array.isArray(input.trigger_tags) ? input.trigger_tags : [],
    ai_intervention_triggered: input.ai_intervention_triggered ?? false,
  };
}

function legacyInsert(input: HabitLogInput) {
  const log_date = input.log_date ?? new Date().toISOString().split('T')[0];
  const logType = input.log_type ?? (input.ai_intervention_triggered ? 'panic' : 'daily');
  const triggers = Array.isArray(input.trigger_tags) ? input.trigger_tags : [];

  return {
    user_id: input.user_id,
    log_date,
    mood_score: input.mood_score ?? 5,
    stress_level: input.stress_level ?? 5,
    urge_intensity: input.urge_intensity ?? 5,
    relapsed: input.relapsed ?? input.khat_used_today ?? false,
    khat_used_today: input.khat_used_today ?? false,
    khat_hours_ago: input.khat_hours_ago ?? null,
    alcohol_used_today: input.alcohol_used_today ?? false,
    trigger_tags: triggers,
    log_type: logType,
    mood: toMoodSmall(input.mood_score),
    stress: toMoodSmall(input.stress_level),
    urge: urgeLabel(input.urge_intensity),
    intensity: input.urge_intensity,
    khat_used: input.khat_used_today ?? false,
    alcohol_used: input.alcohol_used_today ?? false,
    triggers,
    context_tags: triggers,
    ai_intervention_triggered: input.ai_intervention_triggered ?? false,
    status: logType === 'panic' ? 'active' : null,
  };
}

async function tryInsert(
  supabase: SupabaseClient,
  row: Record<string, unknown>
): Promise<{ data: { id: string } | null; error: unknown }> {
  const { data, error } = await supabase.from('habit_logs').insert(row).select('id').single();
  return { data, error };
}

export async function insertHabitLog(
  supabase: SupabaseClient,
  input: HabitLogInput
): Promise<{ data: { id: string } | null; error: unknown }> {
  // Legacy schema (00_full_schema) is the common deployed shape — try it first.
  const legacy = legacyInsert(input);
  let result = await tryInsert(supabase, legacy);
  if (!result.error) return result;

  if (!isMissingSupabaseColumn(result.error)) {
    return result;
  }

  const modern = modernInsert(input);
  result = await tryInsert(supabase, modern);
  if (!result.error) return result;

  if (isMissingSupabaseColumn(result.error)) {
    const log_date = input.log_date ?? new Date().toISOString().split('T')[0];
    const minimal = {
      user_id: input.user_id,
      log_date,
      log_type: input.log_type ?? (input.ai_intervention_triggered ? 'panic' : 'daily'),
      mood: toMoodSmall(input.mood_score),
      mood_score: input.mood_score ?? 5,
      ai_intervention_triggered: input.ai_intervention_triggered ?? false,
    };
    return tryInsert(supabase, minimal);
  }

  return result;
}

export async function upsertStreak(
  supabase: SupabaseClient,
  payload: {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    total_clean_days: number;
    last_clean_date?: string;
    last_logged_at: string;
  }
) {
  const withDate = {
    user_id: payload.user_id,
    current_streak: payload.current_streak,
    longest_streak: payload.longest_streak,
    total_clean_days: payload.total_clean_days,
    last_clean_date: payload.last_clean_date,
    last_logged_at: payload.last_logged_at,
    updated_at: payload.last_logged_at,
  };

  const { error } = await supabase.from('streaks').upsert(withDate);
  if (!error || !isMissingSupabaseColumn(error)) return error;

  const withoutDate = {
    user_id: payload.user_id,
    current_streak: payload.current_streak,
    longest_streak: payload.longest_streak,
    total_clean_days: payload.total_clean_days,
    last_logged_at: payload.last_logged_at,
    updated_at: payload.last_logged_at,
  };

  const retry = await supabase.from('streaks').upsert(withoutDate);
  return retry.error;
}
