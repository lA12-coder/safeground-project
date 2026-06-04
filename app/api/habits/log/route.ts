import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const URGE_TO_SCORE: Record<string, number> = {
  None: 1,
  Low: 3,
  Medium: 6,
  High: 9,
};

function urgeToScore(urge: unknown): number {
  if (typeof urge === 'number') return urge;
  if (typeof urge === 'string' && urge in URGE_TO_SCORE) return URGE_TO_SCORE[urge];
  return 5;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mood_score = body.mood_score ?? body.mood;
    const stress_level = body.stress_level ?? body.stress ?? 5;
    const urge_intensity = body.urge_intensity ?? urgeToScore(body.urge);
    const khat_used_today = body.khat_used_today ?? body.khatUsed ?? false;
    const khat_hours_ago = body.khat_hours_ago ?? body.khatHoursAgo ?? null;
    const alcohol_used_today = body.alcohol_used_today ?? body.alcoholUsed ?? false;
    const trigger_tags = body.trigger_tags ?? body.triggers ?? [];
    const log_date = body.log_date || new Date().toISOString().split('T')[0];

    if (mood_score == null) {
      return NextResponse.json({ error: 'Missing required field: mood' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        user_id: user.id,
        log_date,
        mood_score,
        stress_level,
        urge_intensity,
        relapsed: khat_used_today,
        khat_used_today,
        khat_hours_ago: khat_used_today ? khat_hours_ago : null,
        alcohol_used_today,
        trigger_tags,
        ai_intervention_triggered: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[habits/log]', error);
      return NextResponse.json({ error: 'Failed to save habit log' }, { status: 500 });
    }

    if (!khat_used_today) {
      const { data: streak } = await supabase
        .from('streaks')
        .select('current_streak, longest_streak, total_clean_days')
        .eq('user_id', user.id)
        .maybeSingle();

      const current = (streak?.current_streak ?? 0) + 1;
      const longest = Math.max(streak?.longest_streak ?? 0, current);
      const total = (streak?.total_clean_days ?? 0) + 1;

      await supabase.from('streaks').upsert({
        user_id: user.id,
        current_streak: current,
        longest_streak: longest,
        total_clean_days: total,
        last_clean_date: log_date,
        last_logged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        log_id: data.id,
        streak_updated: !khat_used_today,
        data: { id: data.id },
        message: 'Habit log saved successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[habits/log]', error);
    return NextResponse.json({ error: 'Failed to save habit log' }, { status: 500 });
  }
}
