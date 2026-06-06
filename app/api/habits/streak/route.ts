import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMissingSupabaseTable } from '@/lib/supabase/schema-errors';

const emptyStreak = {
  currentStreak: 0,
  longestStreak: 0,
  totalCleanDays: 0,
  lastLoggedAt: null,
  current_streak: 0,
  longest_streak: 0,
  total_clean_days: 0,
  last_clean_date: null,
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(emptyStreak);
    }

    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, total_clean_days, last_clean_date, last_logged_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (!isMissingSupabaseTable(error)) {
        console.error('[habits/streak]', error);
      }
      return NextResponse.json(emptyStreak);
    }

    const current = data?.current_streak ?? 0;
    const longest = data?.longest_streak ?? 0;
    const total = data?.total_clean_days ?? 0;
    const lastDate = data?.last_clean_date ?? null;
    const lastLogged = data?.last_logged_at ?? null;

    return NextResponse.json({
      currentStreak: current,
      longestStreak: longest,
      totalCleanDays: total,
      lastLoggedAt: lastLogged,
      updatedAt: data?.updated_at ?? new Date().toISOString(),
      current_streak: current,
      longest_streak: longest,
      total_clean_days: total,
      last_clean_date: lastDate,
    });
  } catch (error) {
    console.error('[habits/streak]', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}
