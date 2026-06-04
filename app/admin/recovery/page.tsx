'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Zap, TrendingUp, ClipboardCheck } from 'lucide-react'

interface RecoveryStats {
  total_users: number
  active_streaks: number
  avg_streak_length: number
  recent_logs: number
}

export default function AdminRecoveryPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<RecoveryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

        const [
          { count: total_users },
          { count: active_streaks },
          { data: streakData },
          { count: recent_logs },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('streaks').select('*', { count: 'exact', head: true }).gt('current_streak', 0),
          supabase.from('streaks').select('current_streak').gt('current_streak', 0),
          supabase.from('habit_logs').select('*', { count: 'exact', head: true }).gte('log_date', thirtyDaysAgo),
        ])

        const avg_streak_length = streakData?.length
          ? Math.round(streakData.reduce((a, b) => a + b.current_streak, 0) / streakData.length)
          : 0

        setStats({
          total_users: total_users || 0,
          active_streaks: active_streaks || 0,
          avg_streak_length,
          recent_logs: recent_logs || 0,
        })
      } catch (e) {
        console.error('Failed to fetch recovery stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const cards = [
    { label: 'Total Users', icon: Heart, value: stats?.total_users, color: 'text-primary' },
    { label: 'Active Streaks', icon: Zap, value: stats?.active_streaks, color: 'text-amber-700' },
    { label: 'Avg Streak Length', icon: TrendingUp, value: stats?.avg_streak_length, color: 'text-green-700' },
    { label: 'Logs (30d)', icon: ClipboardCheck, value: stats?.recent_logs, color: 'text-blue-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Recovery Analytics</h1>
        <p className="text-on-surface-variant mt-1">Aggregate recovery metrics and program outcomes.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {cards.map(({ label, icon: Icon, value, color }) => (
          <div key={label} className="card p-6">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-3xl font-bold text-on-surface">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-surface-container-high rounded animate-pulse" />
              ) : value !== undefined ? (
                value
              ) : (
                '—'
              )}
            </p>
            <p className="text-sm text-on-surface-variant">{label}</p>
          </div>
        ))}
      </div>

      {!loading && stats && stats.total_users === 0 && (
        <div className="text-center py-16 text-on-surface-variant">
          <p className="text-lg">No recovery data yet</p>
          <p className="text-sm mt-1">Seed demo data or wait for users to start their recovery journey.</p>
        </div>
      )}
    </div>
  )
}
