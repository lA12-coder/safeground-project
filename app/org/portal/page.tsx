'use client'

import { useEffect, useState } from 'react'
import {
  Users, Calendar, Award, TrendingUp, CheckCircle, XCircle,
  CalendarCheck, Activity, BookOpen, BarChart3, Clock, Target,
} from 'lucide-react'

interface OrgMetrics {
  total_participants: number
  active_participants: number
  total_appointments: number
  upcoming_appointments: number
  completion_rate: number
  attendance_rate: number
  programs: number
}

interface Appointment {
  id: string
  alias: string
  scheduled_at: string
  session_type: string
  status: string
  program_name?: string
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-gray-50 text-gray-500',
  cancelled: 'bg-red-50 text-red-600',
}

const TYPE_STYLES: Record<string, string> = {
  initial: 'bg-blue-50 text-blue-700',
  follow_up: 'bg-purple-50 text-purple-700',
  crisis: 'bg-red-50 text-red-700',
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-[#e5e0db] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%`, transition: 'width 0.8s ease-out' }} />
    </div>
  )
}

export default function OrgPortal() {
  const [metrics, setMetrics] = useState<OrgMetrics>({
    total_participants: 0, active_participants: 0, total_appointments: 0,
    upcoming_appointments: 0, completion_rate: 0, attendance_rate: 0, programs: 0,
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/org/portal')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setMetrics(data.metrics || metrics)
          setAppointments(data.appointments || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#92400E] border-t-transparent rounded-full" />
    </div>
  )

  const healthBars = [
    { label: 'Completion Rate', value: metrics.completion_rate, icon: Target, color: 'bg-[#92400E]' },
    { label: 'Attendance Rate', value: metrics.attendance_rate, icon: Activity, color: 'bg-green-600' },
    { label: 'Engagement', value: Math.round(metrics.active_participants / (metrics.total_participants || 1) * 100), icon: TrendingUp, color: 'bg-blue-600' },
  ]

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5">

        <div className="flex items-center gap-3 bg-white rounded-lg border border-[#e5e0db] shadow-sm p-4">
          <div className="w-10 h-10 rounded-lg bg-[#f0ece7] flex items-center justify-center">
            <BookOpen size={18} className="text-[#92400E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2c241f]">Wellness Portal</h1>
            <p className="text-xs text-[#6f5b4e]">Program & participant overview</p>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {[
            { icon: Users, label: 'Participants', value: metrics.total_participants, sub: `${metrics.active_participants} active`, accent: 'border-l-amber-500' },
            { icon: CalendarCheck, label: 'Appointments', value: metrics.total_appointments, sub: `${metrics.upcoming_appointments} upcoming`, accent: 'border-l-blue-500' },
            { icon: Award, label: 'Programs', value: metrics.programs, sub: 'Active', accent: 'border-l-green-500' },
            { icon: BarChart3, label: 'Engagement', value: `${Math.round(metrics.active_participants / (metrics.total_participants || 1) * 100)}%`, sub: 'Participation rate', accent: 'border-l-purple-500' },
          ].map(({ icon: Icon, label, value, sub, accent }) => (
            <div key={label} className={`bg-white rounded-lg border border-[#e5e0db] border-l-4 ${accent} shadow-sm p-4`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-[#6f5b4e] uppercase tracking-wider">{label}</span>
                <Icon size={14} className="text-[#2c241f] opacity-50" />
              </div>
              <p className="text-2xl font-bold text-[#2c241f]">{value}</p>
              <p className="text-[10px] text-[#6f5b4e] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[#92400E]" />
            <h2 className="text-sm font-semibold text-[#2c241f]">Platform Health</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {healthBars.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-3 bg-[#f6f5f1] rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#2c241f]">{label}</span>
                  <Icon size={13} className="text-[#6f5b4e]" />
                </div>
                <ProgressBar value={value} color={color} />
                <p className="text-right text-xs font-bold text-[#2c241f] mt-1">{value}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#92400E]" />
                <h2 className="text-sm font-semibold text-[#2c241f]">Upcoming Appointments</h2>
              </div>
              {appointments.length > 0 && (
                <span className="text-[10px] text-[#6f5b4e] bg-[#f6f5f1] px-2 py-0.5 rounded-full">{appointments.length}</span>
              )}
            </div>
            {appointments.length === 0 ? (
              <div className="text-center py-10">
                <CalendarCheck size={24} className="text-[#9a8a7d] mx-auto mb-2 opacity-40" />
                <p className="text-xs text-[#6f5b4e]">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 bg-[#f6f5f1] rounded-md">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2c241f] truncate">{a.alias}</p>
                      <div className="flex items-center gap-2 text-[10px] mt-0.5 text-[#6f5b4e]">
                        <Clock size={10} />
                        <span>{new Date(a.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_STYLES[a.session_type] || 'bg-gray-50 text-gray-600'}`}>
                        {a.session_type === 'follow_up' ? 'Follow-up' : a.session_type?.charAt(0).toUpperCase() + a.session_type?.slice(1)}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_STYLES[a.status] || 'bg-gray-50 text-gray-600'}`}>
                        {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={15} className="text-[#92400E]" />
              <h2 className="text-sm font-semibold text-[#2c241f]">Program Schedule</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Restoration Fellowship', participants: 8, week: 4, totalWeeks: 12, color: 'bg-[#92400E]' },
                { name: 'New Beginnings', participants: 5, week: 2, totalWeeks: 8, color: 'bg-green-600' },
                { name: 'Family Support Circle', participants: 12, week: 6, totalWeeks: 10, color: 'bg-blue-600' },
              ].map(program => {
                const pct = Math.round((program.week / program.totalWeeks) * 100)
                return (
                  <div key={program.name} className="p-3 bg-[#f6f5f1] rounded-md">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-[#2c241f]">{program.name}</p>
                      <span className="text-[10px] text-[#6f5b4e]">{program.week}/{program.totalWeeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#6f5b4e] shrink-0 flex items-center gap-1">
                        <Users size={10} /> {program.participants}
                      </span>
                      <ProgressBar value={pct} color={program.color} />
                      <span className="text-[10px] font-semibold text-[#2c241f]">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#2c241f] mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Add Participant', icon: Users, href: '/org/portal/participants' },
              { label: 'Schedule Session', icon: Calendar, href: '/org/portal/schedule' },
              { label: 'View Reports', icon: BarChart3, href: '/org/portal/reports' },
              { label: 'Program Settings', icon: Target, href: '/org/portal/programs' },
            ].map(({ label, icon: Icon, href }) => (
              <a key={label} href={href}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f6f5f1] rounded-md text-xs font-medium text-[#2c241f] hover:bg-[#e5e0db] hover:text-[#92400E] transition-colors">
                <Icon size={12} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
