import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { AdminMetrics } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date().toISOString().split('T')[0]

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    const [{ count: total_users }, { count: new_users_7d }, { count: panic_today }, { count: active_streaks }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoStr),
      supabase.from('habit_logs').select('*', { count: 'exact', head: true }).eq('ai_intervention_triggered', true).gte('log_date', today),
      supabase.from('streaks').select('*', { count: 'exact', head: true }).gt('current_streak', 0),
    ])

    const { count: chat_today } = await supabase
      .from('anonymous_chat').select('*', { count: 'exact', head: true }).gte('sent_at', today)

    const { count: relapse_last_7 } = await supabase
      .from('habit_logs').select('*', { count: 'exact', head: true }).eq('relapsed', true).gte('log_date', sevenDaysAgoStr)

    const { count: total_last_7 } = await supabase
      .from('habit_logs').select('*', { count: 'exact', head: true }).gte('log_date', sevenDaysAgoStr)

    const relapse_rate_7d = total_last_7 && total_last_7 > 0
      ? Math.round(((relapse_last_7 || 0) / total_last_7) * 100)
      : 0

    const { count: provider_queue } = await supabase
      .from('providers').select('*', { count: 'exact', head: true }).eq('is_verified', false)

    const { count: flagged_messages } = await supabase
      .from('anonymous_chat').select('*', { count: 'exact', head: true }).eq('is_flagged', true)

    const { data: avgStreakData } = await supabase
      .from('streaks').select('current_streak').gt('current_streak', 0)

    const avg_streak = avgStreakData?.length
      ? Math.round(avgStreakData.reduce((a, b) => a + b.current_streak, 0) / avgStreakData.length)
      : 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]

    const { data: activityData } = await supabase
      .from('habit_logs')
      .select('log_date, ai_intervention_triggered')
      .gte('log_date', startDate)
      .order('log_date', { ascending: true })

    const activityMap = new Map<string, { checkins: number; panic: number }>()
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const key = d.toISOString().split('T')[0]
      activityMap.set(key, { checkins: 0, panic: 0 })
    }

    activityData?.forEach(log => {
      const entry = activityMap.get(log.log_date)
      if (entry) {
        entry.checkins++
        if (log.ai_intervention_triggered) entry.panic++
      }
    })

    const activity_30d = Array.from(activityMap.entries()).map(([date, val]) => ({
      date,
      checkins: val.checkins,
      panic: val.panic,
    }))

    const metrics: AdminMetrics = {
      total_users: total_users || 0,
      new_users_7d: new_users_7d || 0,
      panic_today: panic_today || 0,
      active_streaks: active_streaks || 0,
      provider_queue: provider_queue || 0,
      avg_streak,
      relapse_rate_7d,
      chat_today: chat_today || 0,
      flagged_messages: flagged_messages || 0,
      activity_30d,
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('[admin/metrics] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
