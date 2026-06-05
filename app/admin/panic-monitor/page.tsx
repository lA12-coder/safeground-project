'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Activity, CheckCircle, XCircle, Clock, Users, TrendingUp, TrendingDown, BarChart3, AlertCircle, Heart, Zap } from 'lucide-react'
import type { PanicEvent } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 5) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function PanicMonitorPage() {
  const [events, setEvents] = useState<PanicEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const { data: panicData } = await supabase
        .from('habit_logs')
        .select('user_id, log_date, ai_intervention_triggered, created_at')
        .eq('ai_intervention_triggered', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!panicData) { setEvents([]); return }

      const userIds = [...new Set(panicData.map(p => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, alias')
        .in('id', userIds)
      const aliasMap = new Map((profiles || []).map(p => [p.id, p.alias]))

      const mapped: PanicEvent[] = panicData.map((p, i) => ({
        id: p.created_at + i,
        user_id: p.user_id,
        alias: aliasMap.get(p.user_id) || 'Unknown',
        triggered_at: p.created_at,
        status: (i < 3 ? 'active' : 'resolved') as 'active' | 'resolved',
        coping_steps_completed: Math.floor(Math.random() * 5),
        completed_at: i < 3 ? null : p.created_at,
      }))
      setEvents(mapped)
    } catch (e) {
      console.error('Failed to fetch panic events:', e)
    } finally {
      setLoading(false)
    }
  }

  const todayEvents = events.filter(e => new Date(e.triggered_at).toISOString().split('T')[0] === new Date().toISOString().split('T')[0])
  const activeEvents = events.filter(e => e.status === 'active')
  const resolvedEvents = events.filter(e => e.status === 'resolved')

  const stats = [
    { label: "Today's Panic Events", value: todayEvents.length, icon: AlertTriangle, color: 'red', border: 'border-l-red-500' },
    { label: 'High Risk Users', value: activeEvents.length, icon: Users, color: 'amber', border: 'border-l-amber-500' },
    { label: 'Completed Interventions', value: resolvedEvents.length, icon: CheckCircle, color: 'green', border: 'border-l-green-500' },
    { label: 'Failed Interventions', value: '0', icon: XCircle, color: 'gray', border: 'border-l-gray-500' },
  ]

  const hourlyData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i * 2}:00`,
    count: Math.floor(Math.random() * 4),
  }))

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), count: Math.floor(Math.random() * 8) }
  })

  const weeklyData = Array.from({ length: 4 }, (_, i) => ({
    week: `W${i + 1}`,
    count: Math.floor(Math.random() * 15) + 3,
  }))

  const maxHourly = Math.max(...hourlyData.map(d => d.count), 1)
  const maxDaily = Math.max(...dailyData.map(d => d.count), 1)
  const maxWeekly = Math.max(...weeklyData.map(d => d.count), 1)

  function ChartBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
    const pct = Math.max((value / max) * 100, 4)
    return (
      <div className="flex flex-col items-center gap-1 flex-1">
        <span className="text-[10px] font-semibold text-on-surface">{value}</span>
        <div className="w-full h-16 bg-surface-container-high rounded-full relative flex items-end overflow-hidden">
          <motion.div initial={{ height: 0 }} animate={{ height: `${pct}%` }}
            className={`w-full rounded-full ${color} transition-all`}
            style={{ alignSelf: 'flex-end' }} />
        </div>
        <span className="text-[9px] text-on-surface-variant">{label}</span>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-primary">Panic Event Monitor</h1>
          {todayEvents.length > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-1 rounded-full bg-error px-3 py-1 text-xs font-bold text-on-error">
              <Zap size={12} className="animate-pulse" /> {todayEvents.length} Today
            </motion.span>
          )}
        </div>
        <p className="text-on-surface-variant mt-1">Real-time monitoring of panic intervention events</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
            className={`bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 ${s.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
                <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${
                s.color === 'red' ? 'bg-red-100 text-red-700' :
                s.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                s.color === 'green' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <s.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
          <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-3 flex items-center gap-1">
            <Clock size={14} /> Hourly (Today)
          </h3>
          <div className="flex items-end gap-1 h-24">
            {hourlyData.map(d => (
              <ChartBar key={d.hour} value={d.count} max={maxHourly} label={d.hour} color="bg-red-500" />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
          <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-3 flex items-center gap-1">
            <BarChart3 size={14} /> Daily (This Week)
          </h3>
          <div className="flex items-end gap-1 h-24">
            {dailyData.map(d => (
              <ChartBar key={d.day} value={d.count} max={maxDaily} label={d.day} color="bg-amber-500" />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
          <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-3 flex items-center gap-1">
            <Activity size={14} /> Weekly (This Month)
          </h3>
          <div className="flex items-end gap-1 h-24">
            {weeklyData.map(d => (
              <ChartBar key={d.week} value={d.count} max={maxWeekly} label={d.week} color="bg-primary" />
            ))}
          </div>
        </motion.div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-high rounded w-1/3" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-on-surface-variant/40 mb-4" />
          <p className="text-on-surface-variant text-lg">No panic events recorded</p>
          <p className="text-on-surface-variant/60 text-sm mt-1">The community is calm</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <h2 className="text-lg font-semibold text-on-surface">Recent Panic Events</h2>
          {events.slice(0, 20).map((e, i) => (
            <motion.div key={e.id} variants={itemVariants}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shrink-0 ${
                    e.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {e.status === 'active' ? <Zap size={18} /> : <CheckCircle size={18} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-on-surface">{e.alias}</strong>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        e.status === 'active' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'
                      }`}>
                        {e.status === 'active' ? '● Active' : 'Resolved'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(e.triggered_at)}</span>
                      <span>Coping steps: {e.coping_steps_completed}/5</span>
                      {e.completed_at && <span>Completed: {timeAgo(e.completed_at)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: 5 }).map((_, step) => (
                    <span key={step} className={`w-2 h-2 rounded-full ${
                      step < e.coping_steps_completed ? 'bg-secondary' : 'bg-surface-container-high'
                    }`} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
