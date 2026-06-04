import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface HabitLogRequest {
  mood: number;
  stress: number;
  urge: string;
  khatUsed: boolean;
  khatHoursAgo: number | null;
  alcoholUsed: boolean;
  triggers: string[];
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: HabitLogRequest = await request.json();

    if (!body.mood || !body.urge) {
      return NextResponse.json(
        { error: 'Missing required fields: mood, urge' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        user_id: user?.id ?? null,
        log_type: body.khatUsed ? 'relapse' : 'daily',
        mood: body.mood,
        stress: body.stress,
        urge: body.urge,
        khat_used: body.khatUsed,
        khat_hours_ago: body.khatUsed ? body.khatHoursAgo : null,
        alcohol_used: body.alcoholUsed,
        triggers: body.triggers ?? [],
        notes: body.notes ?? '',
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[habits/log]', error);
      return NextResponse.json(
        {
          error:
            'Could not save habit log. Run supabase/migrations/00_full_schema.sql in the Supabase SQL Editor.',
        },
        { status: 503 }
      );
    }

    if (user?.id && !body.khatUsed) {
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
        last_logged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: data.id, createdAt: data.created_at },
        message: 'Habit log saved successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[habits/log]', error);
    return NextResponse.json({ error: 'Failed to save habit log' }, { status: 500 });
  }
}
