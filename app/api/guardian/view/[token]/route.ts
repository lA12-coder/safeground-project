import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { GuardianViewData } from '@/lib/types'

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: guardian, error } = await supabase
      .from('guardian_controls')
      .select('user_id, guardian_alias, monitoring_level')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (error || !guardian) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    }

    const [streakResult, logsResult, panicResult, alertsResult] = await Promise.all([
      supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', guardian.user_id).single(),
      supabase.from('habit_logs').select('mood_score, log_date').eq('user_id', guardian.user_id).order('log_date', { ascending: false }).limit(7),
      supabase.from('habit_logs').select('log_date').eq('user_id', guardian.user_id).eq('ai_intervention_triggered', true).order('log_date', { ascending: false }).limit(1),
      supabase.from('notification_logs').select('type, created_at').eq('user_id', guardian.user_id).eq('type', 'panic_alert').order('created_at', { ascending: false }).limit(5),
    ])

    const streak = streakResult.data
    const logs = logsResult.data || []
    const panic = panicResult.data
    const alerts = alertsResult.data || []

    const last_7_days_mood: { day: string; mood: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().split('T')[0]
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
      const log = logs.find(l => l.log_date === dayStr)
      last_7_days_mood.push({ day: dayName, mood: log?.mood_score ?? 0 })
    }

    await supabase
      .from('guardian_controls')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('token', token)

    const data: GuardianViewData = {
      alias: guardian.guardian_alias,
      current_streak: streak?.current_streak || 0,
      longest_streak: streak?.longest_streak || 0,
      last_7_days_mood,
      last_panic_event_date: panic?.[0]?.log_date || null,
      recent_alerts: alerts.map(a => ({ type: a.type, date: a.created_at })),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[guardian/view] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch guardian data' }, { status: 500 })
  }
}
