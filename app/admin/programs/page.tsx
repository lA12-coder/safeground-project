'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Users, TrendingUp } from 'lucide-react'

interface Enrollment {
  id: string
  user_id: string
  type: string
  message: string
  created_at: string
}

interface ProgramStats {
  active_programs: number
  participants: number
  enrollments: Enrollment[]
}

export default function AdminProgramsPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<ProgramStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: enrollments } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('type', 'program_enrollment')
          .order('created_at', { ascending: false })
          .limit(50)

        const uniquePrograms = new Set(
          (enrollments || []).map(e => e.message.split(' — ')[0] || e.message)
        )
        const uniqueUsers = new Set((enrollments || []).map(e => e.user_id))

        setStats({
          active_programs: uniquePrograms.size,
          participants: uniqueUsers.size,
          enrollments: (enrollments || []) as Enrollment[],
        })
      } catch (e) {
        console.error('Failed to fetch program data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const cards = [
    { label: 'Active Programs', icon: BookOpen, value: stats?.active_programs, color: 'text-primary' },
    { label: 'Participants', icon: Users, value: stats?.participants, color: 'text-amber-700' },
    { label: 'Enrollments', icon: TrendingUp, value: stats?.enrollments.length, color: 'text-green-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Programs</h1>
        <p className="text-on-surface-variant mt-1">Faith-based and clinical program management.</p>
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

      {!loading && stats && stats.enrollments.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4">Program Enrollments</h2>
          <div className="space-y-3">
            {stats.enrollments.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div>
                  <p className="font-medium text-on-surface text-sm">{e.message}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    User: {e.user_id.slice(0, 8)}... &middot;{' '}
                    {new Date(e.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && stats && stats.enrollments.length === 0 && (
        <div className="text-center py-16 text-on-surface-variant">
          <p className="text-lg">No programs yet</p>
          <p className="text-sm mt-1">Seed program enrollment data to see metrics here.</p>
        </div>
      )}
    </div>
  )
}
