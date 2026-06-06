import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeHabitLogRow } from '@/lib/supabase/habit-logs';
import { isMissingSupabaseColumn, isMissingSupabaseTable } from '@/lib/supabase/schema-errors';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    const startIso = startDate.toISOString();

    let usedCreatedAtFallback = false;

    let { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', startDateStr)
      .order('log_date', { ascending: true });

    if (error && isMissingSupabaseColumn(error)) {
      usedCreatedAtFallback = true;
      const fallback = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startIso)
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

    let undatedRows: Record<string, unknown>[] = [];
    if (!usedCreatedAtFallback) {
      const undatedResult = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .is('log_date', null)
        .gte('created_at', startIso)
        .order('created_at', { ascending: true });
      if (!undatedResult.error) {
        undatedRows = (undatedResult.data ?? []) as Record<string, unknown>[];
      }
    }

    const merged = new Map<string, Record<string, unknown>>();
    for (const row of data ?? []) {
      merged.set(String((row as { id: string }).id), row as Record<string, unknown>);
    }
    for (const row of undatedRows ?? []) {
      merged.set(String((row as { id: string }).id), row as Record<string, unknown>);
    }

    const normalized = Array.from(merged.values())
      .map((row) => normalizeHabitLogRow(row))
      .sort((a, b) => a.log_date.localeCompare(b.log_date));

    return NextResponse.json(normalized);
  } catch (error) {
    if (isMissingSupabaseTable(error)) {
      return NextResponse.json([]);
    }
    console.error('[habits/history] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
