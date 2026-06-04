import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const milestoneDays = [3, 7, 14, 30, 60, 90];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, completed_steps } = await request.json();

    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .maybeSingle();

    const current = streak?.current_streak ?? 0;
    const newMilestones: number[] = [];

    for (const day of milestoneDays) {
      if (current >= day) {
        const { data: existing } = await supabase
          .from('milestones')
          .select('id')
          .eq('user_id', user.id)
          .eq('days', day)
          .maybeSingle();

        if (!existing) {
          await supabase.from('milestones').insert({
            user_id: user.id,
            days: day,
            achieved_at: new Date().toISOString(),
          });
          newMilestones.push(day);
        }
      }
    }

    if (session_id && !String(session_id).startsWith('session_')) {
      await supabase
        .from('habit_logs')
        .update({
          notes: `Completed steps: ${completed_steps ?? 0}`,
        })
        .eq('id', session_id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Streak protected and milestone logged',
      streak_protected: true,
      current_streak: current,
      new_milestones: newMilestones,
    });
  } catch (error) {
    console.error('[panic/complete] Error:', error);
    return NextResponse.json({ error: 'Failed to complete panic session' }, { status: 500 });
  }
}
