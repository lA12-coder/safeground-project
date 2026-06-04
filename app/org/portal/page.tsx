'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Calendar, Activity, BarChart3 } from 'lucide-react'

interface Booking {
  id: string
  scheduled_at: string
  status: string
  profiles: { alias: string } | null
}

interface OrgMetrics {
  participants: number
  appointments: number
  programs: number
  engagement: number
  bookings: Booking[]
  enrollments: string[]
}

export default function OrgWellnessPortal() {
  const supabase = createClient()
  const [stats, setStats] = useState<OrgMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const { data: provider } = await supabase
          .from('providers')
          .select('*')
          .eq('id', user.id)
          .single()

        const providerId = provider?.id || user.id

        const [
          { data: bookings },
          { count: participants },
          { data: enrollments },
        ] = await Promise.all([
          supabase
            .from('telehealth_bookings')
            .select('*, profiles(alias)')
            .eq('provider_id', providerId)
            .order('scheduled_at', { ascending: true })
            .limit(20),
          supabase
            .from('telehealth_bookings')
            .select('user_id', { count: 'exact', head: true })
            .eq('provider_id', providerId),
          supabase
            .from('notification_logs')
            .select('message')
            .eq('type', 'program_enrollment')
            .limit(20),
        ])

        const upcoming = (bookings || []).filter(
          b => b.status === 'pending' || b.status === 'confirmed'
        )

        setStats({
          participants: participants || 0,
          appointments: upcoming.length,
          programs: new Set((enrollments || []).map(e => e.message.split(' — ')[0])).size,
          engagement: (bookings || []).length > 0
            ? Math.round((bookings!.filter(b => b.status === 'completed').length / bookings!.length) * 100)
            : 0,
          bookings: (bookings || []) as Booking[],
          enrollments: (enrollments || []).map(e => e.message),
        })
      } catch (e) {
        console.error('Failed to fetch org data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const metricCards = [
    { label: 'Program Participants', icon: Users, value: stats?.participants, color: 'text-primary' },
    { label: 'Upcoming Appointments', icon: Calendar, value: stats?.appointments, color: 'text-amber-700' },
    { label: 'Active Programs', icon: Activity, value: stats?.programs, color: 'text-green-700' },
    { label: 'Engagement Rate', icon: BarChart3, value: stats?.engagement !== undefined ? `${stats.engagement}%` : null, color: 'text-blue-700' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Organization Wellness Portal</h1>
          <p className="text-on-surface-variant mt-1">Manage your programs and support participants</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {metricCards.map(({ label, icon: Icon, value, color }) => (
            <div key={label} className="card p-6">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-3xl font-bold text-on-surface">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-surface-container-high rounded animate-pulse" />
                ) : value !== null && value !== undefined ? (
                  value
                ) : (
                  '—'
                )}
              </p>
              <p className="text-sm text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-4">Upcoming Appointments</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-surface-container-high rounded-lg animate-pulse" />
                ))}
              </div>
            ) : stats && stats.bookings.length > 0 ? (
              <div className="space-y-3">
                {stats.bookings.filter(b => b.status !== 'cancelled').slice(0, 6).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <div>
                      <p className="font-medium text-on-surface">{apt.profiles?.alias || 'Anonymous'}</p>
                      <p className="text-sm text-on-surface-variant">
                        {new Date(apt.scheduled_at).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        apt.status === 'confirmed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm text-center py-8">No appointments yet.</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-4">Platform Health</h2>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-surface-container-high rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Engagement Rate</span>
                    <span className="font-semibold text-on-surface">{stats?.engagement || 0}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${stats?.engagement || 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Appointment Fill Rate</span>
                    <span className="font-semibold text-on-surface">
                      {stats && stats.bookings.length > 0
                        ? Math.round((stats.bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length / stats.bookings.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{
                      width: `${stats && stats.bookings.length > 0
                        ? Math.round((stats.bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length / stats.bookings.length) * 100)
                        : 0}%`
                    }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Program Participation</span>
                    <span className="font-semibold text-on-surface">{stats?.programs || 0} programs</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((stats?.programs || 0) * 25, 100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            {stats && stats.enrollments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-outline-variant/30">
                <h3 className="text-sm font-semibold text-on-surface mb-2">Program Schedule</h3>
                <div className="space-y-2">
                  {stats.enrollments.slice(0, 5).map((msg, i) => {
                    const [program, week] = msg.split(' — ')
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-on-surface-variant">{program}</span>
                        <span className="text-on-surface-variant/60">{week}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {!loading && (!stats || (stats.bookings.length === 0 && stats.enrollments.length === 0)) && (
              <p className="text-on-surface-variant text-sm text-center py-8">No platform data yet. Seed demo data to populate metrics.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
