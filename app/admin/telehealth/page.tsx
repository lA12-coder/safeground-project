'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

interface TelehealthStats {
  total: number
  pending: number
  confirmed: number
}

export default function AdminTelehealthPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<TelehealthStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { count: total } = await supabase
          .from('telehealth_bookings')
          .select('*', { count: 'exact', head: true })

        const { count: pending } = await supabase
          .from('telehealth_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        const { count: confirmed } = await supabase
          .from('telehealth_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'confirmed')

        setStats({
          total: total || 0,
          pending: pending || 0,
          confirmed: confirmed || 0,
        })
      } catch (e) {
        console.error('Failed to fetch telehealth stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const cards = [
    { label: 'Total Bookings', icon: Calendar, value: stats?.total, color: 'text-primary' },
    { label: 'Pending', icon: Clock, value: stats?.pending, color: 'text-amber-700' },
    { label: 'Confirmed', icon: CheckCircle, value: stats?.confirmed, color: 'text-green-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Telehealth</h1>
        <p className="text-on-surface-variant mt-1">Provider bookings, session completions, and availability.</p>
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

      {!loading && stats && stats.total === 0 && (
        <div className="text-center py-16 text-on-surface-variant">
          <p className="text-lg">No telehealth bookings yet</p>
          <p className="text-sm mt-1">Seed booking data or wait for users to schedule sessions.</p>
        </div>
      )}
    </div>
  )
}
