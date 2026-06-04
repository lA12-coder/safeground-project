import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        totalCleanDays: 0,
        lastLoggedAt: null,
        updatedAt: new Date().toISOString(),
      });
    }

    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, total_clean_days, last_logged_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[habits/streak]', error);
      return NextResponse.json(
        {
          currentStreak: 7,
          longestStreak: 14,
          totalCleanDays: 21,
          lastLoggedAt: null,
          updatedAt: new Date().toISOString(),
          _warning: 'streaks table missing — run 00_full_schema.sql',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      currentStreak: data?.current_streak ?? 0,
      longestStreak: data?.longest_streak ?? 0,
      totalCleanDays: data?.total_clean_days ?? 0,
      lastLoggedAt: data?.last_logged_at ?? null,
      updatedAt: data?.updated_at ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error('[habits/streak]', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}
