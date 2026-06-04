import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { AdminMetrics, Provider, AnonymousChat } from '@/lib/types'
import { DashboardClient } from '@/components/admin/DashboardClient'

export const dynamic = 'force-dynamic'

async function fetchAdminData() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: total_users },
    { count: panic_today },
    { count: active_streaks },
    { count: provider_queue },
    { count: flagged_messages },
    { data: avgStreakData },
    { data: activityData },
    { data: pendingProviders },
    { data: flaggedChatMessages },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('habit_logs').select('*', { count: 'exact', head: true }).eq('ai_intervention_triggered', true).gte('log_date', today),
    supabase.from('streaks').select('*', { count: 'exact', head: true }).gt('current_streak', 0),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('anonymous_chat').select('*', { count: 'exact', head: true }).eq('is_flagged', true).eq('is_deleted', false),
    supabase.from('streaks').select('current_streak').gt('current_streak', 0),
    supabase.from('habit_logs').select('log_date, ai_intervention_triggered').gte('log_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]).order('log_date', { ascending: true }),
    supabase.from('providers').select('*').eq('is_verified', false).order('created_at', { ascending: false }).limit(20),
    supabase.from('anonymous_chat').select('*').eq('is_flagged', true).eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
  ])

  const avg_streak = avgStreakData?.length
    ? Math.round(avgStreakData.reduce((a, b) => a + b.current_streak, 0) / avgStreakData.length)
    : 0

  const activityMap = new Map<string, { checkins: number; panic: number }>()
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    activityMap.set(d.toISOString().split('T')[0], { checkins: 0, panic: 0 })
  }
  activityData?.forEach((log: { log_date: string; ai_intervention_triggered: boolean }) => {
    const entry = activityMap.get(log.log_date)
    if (entry) {
      entry.checkins++
      if (log.ai_intervention_triggered) entry.panic++
    }
  })

  const metrics: AdminMetrics = {
    total_users: total_users || 0,
    panic_today: panic_today || 0,
    active_streaks: active_streaks || 0,
    provider_queue: provider_queue || 0,
    avg_streak,
    relapse_rate_7d: 0,
    chat_today: 0,
    flagged_messages: flagged_messages || 0,
    activity_30d: Array.from(activityMap.entries()).map(([date, val]) => ({
      date,
      checkins: val.checkins,
      panic: val.panic,
    })),
  }

  return {
    metrics,
    pendingProviders: (pendingProviders || []) as Provider[],
    flaggedMessages: (flaggedChatMessages || []) as AnonymousChat[],
  }
}

export default async function AdminDashboardPage() {
  const { metrics, pendingProviders, flaggedMessages } = await fetchAdminData()

  return (
    <DashboardClient
      metrics={metrics}
      pendingProviders={pendingProviders}
      flaggedMessages={flaggedMessages}
    />
  )
}
