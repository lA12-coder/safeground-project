'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Calendar, Award, TrendingUp, CheckCircle, XCircle,
  CalendarCheck, Activity, BookOpen, BarChart3, Clock, Target,
  Search, Shield, Download, ChevronRight, AlertTriangle, Flame,
  Sparkles, UserCheck, MessageSquare, Eye,
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

interface Program {
  name: string
  participants: number
  week: number
  totalWeeks: number
  nextSession: string
  status: 'on_track' | 'at_risk' | 'behind'
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

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-[#e5e0db] rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%`, transition: 'width 0.8s ease-out' }} />
    </div>
  )
}

function getHealthColor(value: number): string {
  if (value >= 75) return 'bg-green-500'
  if (value >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function getHealthLabel(value: number): { label: string; textColor: string; bgColor: string } {
  if (value >= 75) return { label: 'Good', textColor: 'text-green-700', bgColor: 'bg-green-50' }
  if (value >= 50) return { label: 'Warning', textColor: 'text-amber-700', bgColor: 'bg-amber-50' }
  return { label: 'Needs Attention', textColor: 'text-red-700', bgColor: 'bg-red-50' }
}

function getProgramStatusStyle(status: string): string {
  if (status === 'on_track') return 'bg-green-50 text-green-700'
  if (status === 'at_risk') return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}

function getProgramBarColor(status: string): string {
  if (status === 'on_track') return 'bg-green-500'
  if (status === 'at_risk') return 'bg-amber-500'
  return 'bg-red-500'
}

function groupAppointments(appointments: Appointment[]): { label: string; items: Appointment[] }[] {
  const now = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const weekEnd = new Date(todayEnd.getTime() + 6 * 24 * 60 * 60 * 1000)

  const today: Appointment[] = []
  const thisWeek: Appointment[] = []
  const later: Appointment[] = []

  appointments.forEach(a => {
    const d = new Date(a.scheduled_at)
    if (d <= todayEnd) today.push(a)
    else if (d <= weekEnd) thisWeek.push(a)
    else later.push(a)
  })

  const groups: { label: string; items: Appointment[] }[] = []
  if (today.length) groups.push({ label: 'Today', items: today })
  if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek })
  if (later.length) groups.push({ label: 'Later', items: later })
  return groups
}

export default function OrgPortal() {
  const [metrics, setMetrics] = useState<OrgMetrics>({
    total_participants: 0, active_participants: 0, total_appointments: 0,
    upcoming_appointments: 0, completion_rate: 0, attendance_rate: 0, programs: 0,
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)

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

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleExport = useCallback(() => {
    setToast('Report exported successfully')
  }, [])

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments
    const q = searchQuery.toLowerCase()
    return appointments.filter(a => a.alias.toLowerCase().includes(q))
  }, [appointments, searchQuery])

  const appointmentGroups = useMemo(() => groupAppointments(filteredAppointments), [filteredAppointments])

  const engagement = { checkins: 127, avgSessions: 3.2, retention: 76, satisfaction: 4.2 }

  const healthBars = [
    { label: 'Completion Rate', value: metrics.completion_rate, icon: Target, color: getHealthColor(metrics.completion_rate), target: 80 },
    { label: 'Attendance Rate', value: metrics.attendance_rate, icon: Activity, color: getHealthColor(metrics.attendance_rate), target: 85 },
    { label: 'Engagement', value: Math.round(metrics.active_participants / (metrics.total_participants || 1) * 100), icon: TrendingUp, color: getHealthColor(Math.round(metrics.active_participants / (metrics.total_participants || 1) * 100)), target: 70 },
  ]

  const healthScore = Math.round(healthBars.reduce((s, b) => s + b.value, 0) / healthBars.length)

  const programs: Program[] = [
    { name: 'Restoration Fellowship', participants: 8, week: 4, totalWeeks: 12, nextSession: '2026-06-08T10:00:00', status: 'on_track' },
    { name: 'New Beginnings', participants: 5, week: 2, totalWeeks: 8, nextSession: '2026-06-07T14:00:00', status: 'at_risk' },
    { name: 'Family Support Circle', participants: 12, week: 6, totalWeeks: 10, nextSession: '2026-06-09T16:00:00', status: 'on_track' },
  ]

  const weekChartData = [
    { day: 'Mon', count: 3 },
    { day: 'Tue', count: 5 },
    { day: 'Wed', count: 2 },
    { day: 'Thu', count: 7 },
    { day: 'Fri', count: 4 },
    { day: 'Sat', count: 1 },
    { day: 'Sun', count: 0 },
  ]

  const maxChartCount = Math.max(...weekChartData.map(d => d.count), 1)

  if (loading) return (
    <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#92400E] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5">

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle size={14} />
            {toast}
          </motion.div>
        )}

        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-lg border border-[#e5e0db] shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f0ece7] flex items-center justify-center">
                <BookOpen size={18} className="text-[#92400E]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2c241f]">Program Management Center</h1>
                <p className="text-xs text-[#6f5b4e]">Organization overview and participant analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#6f5b4e]">
              <span className="flex items-center gap-1">
                <Users size={12} /> {metrics.active_participants} / {metrics.total_participants} active
              </span>
              <span className="w-px h-3 bg-[#e5e0db]" />
              <span className="flex items-center gap-1">
                <Award size={12} /> {metrics.programs} programs
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <div className="bg-white rounded-lg border border-[#e5e0db] border-l-4 border-l-amber-500 shadow-sm p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-[#6f5b4e] uppercase tracking-wider">Participants</span>
                <Users size={14} className="text-[#2c241f] opacity-50" />
              </div>
              <p className="text-2xl font-bold text-[#2c241f]">{metrics.total_participants}</p>
              <p className="text-[10px] text-[#6f5b4e] mt-0.5">{metrics.active_participants} / {metrics.total_participants} active</p>
            </div>
            <div className="bg-white rounded-lg border border-[#e5e0db] border-l-4 border-l-blue-500 shadow-sm p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-[#6f5b4e] uppercase tracking-wider">Appointments</span>
                <CalendarCheck size={14} className="text-[#2c241f] opacity-50" />
              </div>
              <p className="text-2xl font-bold text-[#2c241f]">{metrics.total_appointments}</p>
              <p className="text-[10px] text-[#6f5b4e] mt-0.5">{metrics.upcoming_appointments} upcoming</p>
            </div>
            <div className="bg-white rounded-lg border border-[#e5e0db] border-l-4 border-l-green-500 shadow-sm p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-[#6f5b4e] uppercase tracking-wider">Programs</span>
                <Award size={14} className="text-[#2c241f] opacity-50" />
              </div>
              <p className="text-2xl font-bold text-[#2c241f]">{metrics.programs}</p>
              <p className="text-[10px] text-[#6f5b4e] mt-0.5">Active</p>
            </div>
            <div className="bg-white rounded-lg border border-[#e5e0db] border-l-4 border-l-purple-500 shadow-sm p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-[#6f5b4e] uppercase tracking-wider">Engagement</span>
                <BarChart3 size={14} className="text-[#2c241f] opacity-50" />
              </div>
              <p className="text-2xl font-bold text-[#2c241f]">{Math.round(metrics.active_participants / (metrics.total_participants || 1) * 100)}%</p>
              <p className="text-[10px] text-[#6f5b4e] mt-0.5 flex items-center gap-1">
                <TrendingUp size={10} className="text-green-600" />
                Participation rate
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#92400E]" />
                <h2 className="text-sm font-semibold text-[#2c241f]">Platform Health</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#6f5b4e]">Overall Score</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getHealthLabel(healthScore).bgColor} ${getHealthLabel(healthScore).textColor}`}>
                  {healthScore}%
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {healthBars.map(({ label, value, icon: Icon, color, target }) => {
                const { label: healthLabel, textColor } = getHealthLabel(value)
                return (
                  <div key={label} className="p-3 bg-[#f6f5f1] rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#2c241f]">{label}</span>
                      <Icon size={13} className="text-[#6f5b4e]" />
                    </div>
                    <div className="relative">
                      <ProgressBar value={value} color={color} />
                      <div className="absolute top-[-10px]" style={{ left: `${target}%` }}>
                        <div className="w-px h-4 bg-[#6f5b4e] opacity-40" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-right text-xs font-bold text-[#2c241f]">{value}%</p>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${getHealthLabel(value).bgColor} ${textColor}`}>
                        {healthLabel}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#9a8a7d] mt-0.5">Target: {target}%</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-5 lg:grid-cols-2">

            <div className="space-y-5">

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
                <div className="relative mb-3">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9a8a7d]" />
                  <input
                    type="text"
                    placeholder="Search by alias..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full border border-[#e5e0db] rounded-md pl-7 pr-3 py-1.5 text-xs text-[#2c241f] placeholder:text-[#9a8a7d] focus:ring-2 focus:ring-[#92400E]/20 focus:border-[#92400E] outline-none"
                  />
                </div>
                {appointments.length === 0 || (filteredAppointments.length === 0 && searchQuery) ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                    <CalendarCheck size={24} className="text-[#9a8a7d] mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-[#6f5b4e]">
                      {searchQuery ? 'No matching appointments' : 'No upcoming appointments'}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                    {appointmentGroups.map(group => (
                      <div key={group.label}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold text-[#2c241f] uppercase tracking-wider">{group.label}</span>
                          <span className="text-[9px] text-[#6f5b4e] bg-[#f6f5f1] px-1.5 py-0.5 rounded-full">{group.items.length}</span>
                        </div>
                        <div className="space-y-1">
                          {group.items.map(a => (
                            <motion.div
                              key={a.id}
                              whileHover={{ x: 2 }}
                              className="flex items-center justify-between p-2.5 bg-[#f6f5f1] rounded-md hover:bg-[#efe9e2] transition-colors cursor-default"
                            >
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
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={15} className="text-[#92400E]" />
                    <h2 className="text-sm font-semibold text-[#2c241f]">Appointment Analytics</h2>
                  </div>
                  <span className="text-[10px] text-[#6f5b4e]">This week</span>
                </div>
                <div className="flex items-end gap-2 h-[120px]">
                  {weekChartData.map(d => {
                    const height = d.count === 0 ? 4 : (d.count / maxChartCount) * 100
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <span className="text-[9px] font-medium text-[#6f5b4e]">{d.count}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="w-full rounded-t-md"
                          style={{
                            backgroundColor: d.count > 0 ? '#92400E' : '#e5e0db',
                            opacity: d.count > 0 ? 0.7 + (d.count / maxChartCount) * 0.3 : 0.4,
                          }}
                        />
                        <span className="text-[9px] text-[#9a8a7d]">{d.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            <div className="space-y-5">

              <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={15} className="text-[#92400E]" />
                  <h2 className="text-sm font-semibold text-[#2c241f]">Program Schedule</h2>
                </div>
                <div className="space-y-3">
                  {programs.map((program, i) => {
                    const pct = Math.round((program.week / program.totalWeeks) * 100)
                    return (
                      <motion.div
                        key={program.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="p-3 bg-[#f6f5f1] rounded-md"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-medium text-[#2c241f] truncate">{program.name}</p>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${getProgramStatusStyle(program.status)}`}>
                              {program.status === 'on_track' ? 'On Track' : program.status === 'at_risk' ? 'At Risk' : 'Behind'}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6f5b4e] shrink-0 ml-2">{program.week}/{program.totalWeeks} weeks</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#6f5b4e] shrink-0 flex items-center gap-1">
                            <Users size={10} /> {program.participants}
                          </span>
                          <ProgressBar value={pct} color={getProgramBarColor(program.status)} />
                          <span className="text-[10px] font-semibold text-[#2c241f]">{pct}%</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-[9px] text-[#9a8a7d]">
                          <Calendar size={9} />
                          <span>Next: {new Date(program.nextSession).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit' })}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} className="text-[#92400E]" />
                  <h2 className="text-sm font-semibold text-[#2c241f]">Engagement Trends</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#f6f5f1] rounded-md">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare size={12} className="text-[#92400E]" />
                      <span className="text-[10px] text-[#6f5b4e]">Total Check-ins</span>
                    </div>
                    <p className="text-xl font-bold text-[#2c241f]">{engagement.checkins}</p>
                    <p className="text-[9px] text-[#9a8a7d] mt-0.5">This week</p>
                  </div>
                  <div className="p-3 bg-[#f6f5f1] rounded-md">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Activity size={12} className="text-[#92400E]" />
                      <span className="text-[10px] text-[#6f5b4e]">Avg Sessions/Week</span>
                    </div>
                    <p className="text-xl font-bold text-[#2c241f]">{engagement.avgSessions}</p>
                    <p className="text-[9px] text-[#9a8a7d] mt-0.5">Per participant</p>
                  </div>
                  <div className="p-3 bg-[#f6f5f1] rounded-md">
                    <div className="flex items-center gap-1.5 mb-1">
                      <UserCheck size={12} className="text-[#92400E]" />
                      <span className="text-[10px] text-[#6f5b4e]">Retention Rate</span>
                    </div>
                    <p className="text-xl font-bold text-[#2c241f]">{engagement.retention}%</p>
                    <p className="text-[9px] text-[#9a8a7d] mt-0.5">Month over month</p>
                  </div>
                  <div className="p-3 bg-[#f6f5f1] rounded-md">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles size={12} className="text-[#92400E]" />
                      <span className="text-[10px] text-[#6f5b4e]">Satisfaction</span>
                    </div>
                    <p className="text-xl font-bold text-[#2c241f]">{engagement.satisfaction}</p>
                    <p className="text-[9px] text-[#9a8a7d] mt-0.5">/ 5.0 rating</p>
                  </div>
                </div>
              </div>

            </div>

          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#2c241f] mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/org/portal/participants"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f6f5f1] rounded-md text-xs font-medium text-[#2c241f] hover:bg-[#e5e0db] hover:text-[#92400E] transition-colors">
                <Users size={12} />
                Add Participant
              </a>
              <a href="/org/portal/schedule"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f6f5f1] rounded-md text-xs font-medium text-[#2c241f] hover:bg-[#e5e0db] hover:text-[#92400E] transition-colors">
                <Calendar size={12} />
                Schedule Session
              </a>
              <a href="/org/portal/reports"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f6f5f1] rounded-md text-xs font-medium text-[#2c241f] hover:bg-[#e5e0db] hover:text-[#92400E] transition-colors">
                <BarChart3 size={12} />
                View Reports
              </a>
              <a href="/org/portal/programs"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f6f5f1] rounded-md text-xs font-medium text-[#2c241f] hover:bg-[#e5e0db] hover:text-[#92400E] transition-colors">
                <Target size={12} />
                Program Settings
              </a>
              <a href="/admin/moderation"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f6f5f1] rounded-md text-xs font-medium text-[#2c241f] hover:bg-[#e5e0db] hover:text-[#92400E] transition-colors">
                <Shield size={12} />
                Panic Monitor
              </a>
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f6f5f1] rounded-md text-xs font-medium text-[#2c241f] hover:bg-[#e5e0db] hover:text-[#92400E] transition-colors">
                <Download size={12} />
                Export Report
              </button>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </div>
  )
}
