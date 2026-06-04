'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Users, Flag } from 'lucide-react'

interface CommunityStats {
  messages_today: number
  online_users: number
  flagged_messages: number
}

export default function AdminCommunityPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date().toISOString().split('T')[0]

        const [
          { count: messages_today },
          { count: active_today },
          { count: flagged_messages },
        ] = await Promise.all([
          supabase.from('anonymous_chat').select('*', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('habit_logs').select('*', { count: 'exact', head: true }).gte('log_date', today),
          supabase.from('anonymous_chat').select('*', { count: 'exact', head: true }).eq('is_flagged', true).eq('is_deleted', false),
        ])

        setStats({
          messages_today: messages_today || 0,
          online_users: active_today || 0,
          flagged_messages: flagged_messages || 0,
        })
      } catch (e) {
        console.error('Failed to fetch community stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const cards = [
    { label: 'Users Active Today', icon: Users, value: stats?.online_users, color: 'text-primary' },
    { label: 'Messages Today', icon: MessageCircle, value: stats?.messages_today, color: 'text-amber-700' },
    { label: 'Flagged Messages', icon: Flag, value: stats?.flagged_messages, color: 'text-error' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Community Overview</h1>
        <p className="text-on-surface-variant mt-1">Anonymous chat rooms, active users, and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
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

      {!loading && stats && stats.messages_today === 0 && stats.online_users === 0 && (
        <div className="text-center py-16 text-on-surface-variant">
          <p className="text-lg">No community activity yet</p>
          <p className="text-sm mt-1">Seed demo chat data or wait for users to engage.</p>
        </div>
      )}
    </div>
  )
}
