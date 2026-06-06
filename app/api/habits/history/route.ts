import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { normalizeHabitLogRow } from '@/lib/supabase/habit-logs';
import { isMissingSupabaseColumn, isMissingSupabaseTable } from '@/lib/supabase/schema-errors';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    let { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDateStr)
      .order('log_date', { ascending: true });

    if (error && isMissingSupabaseColumn(error)) {
      const fallback = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      if (isMissingSupabaseTable(error)) {
        return NextResponse.json([], {
          headers: { 'X-SafeGround-Setup': 'habit_logs' },
        });
      }
      throw error;
    }

    const normalized = (data || []).map((row) => normalizeHabitLogRow(row as Record<string, unknown>));
    return NextResponse.json(normalized);
  } catch (error) {
    if (isMissingSupabaseTable(error)) {
      return NextResponse.json([]);
    }
    console.error('[habits/history] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
