'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Video, XCircle, CheckCircle, AlertCircle, RefreshCw, User, ExternalLink, CalendarClock, Ban, MapPin } from 'lucide-react'
import type { TelehealthBooking } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
    </motion.div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Pending', icon: Clock },
  confirmed: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Confirmed', icon: CheckCircle },
  completed: { color: 'text-green-700', bg: 'bg-green-100', label: 'Completed', icon: CheckCircle },
  cancelled: { color: 'text-red-700', bg: 'bg-red-100', label: 'Cancelled', icon: XCircle },
  no_show: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'No-Show', icon: AlertCircle },
}

const sessionTypeColors: Record<string, string> = {
  initial: 'bg-blue-100 text-blue-700',
  follow_up: 'bg-purple-100 text-purple-700',
  crisis: 'bg-red-100 text-red-700',
  check_in: 'bg-green-100 text-green-700',
}

const sessionTypeLabels: Record<string, string> = {
  initial: 'Initial',
  follow_up: 'Follow-up',
  crisis: 'Crisis',
  check_in: 'Check-in',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<(TelehealthBooking & { user_alias?: string; provider_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<string>('upcoming')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('telehealth_bookings')
        .select('*')
        .order('scheduled_at', { ascending: false })
        .limit(100)

      if (!data) { setBookings([]); return }

      const providerIds = [...new Set(data.map(b => b.provider_id))]
      const userIds = [...new Set(data.map(b => b.user_id))]

      const [{ data: providers }, { data: profiles }] = await Promise.all([
        supabase.from('providers').select('id, name').in('id', providerIds),
        supabase.from('profiles').select('id, alias').in('id', userIds),
      ])

      const providerMap = new Map((providers || []).map(p => [p.id, p.name]))
      const profileMap = new Map((profiles || []).map(p => [p.id, p.alias]))

      setBookings(data.map(b => ({
        ...b,
        user_alias: profileMap.get(b.user_id) || 'Unknown',
        provider_name: providerMap.get(b.provider_id) || 'Unknown',
      })))
    } catch (e) {
      console.error('Failed to fetch bookings:', e)
    } finally {
      setLoading(false)
    }
  }

  function handleCancel(id: string) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b))
    setConfirmId(null)
    setToast({ message: 'Booking cancelled', type: 'error' })
  }

  function handleReschedule(id: string) {
    if (!newDate) return
    setBookings(prev => prev.map(b => b.id === id ? { ...b, scheduled_at: newDate } : b))
    setReschedulingId(null)
    setNewDate('')
    setToast({ message: 'Booking rescheduled', type: 'success' })
  }

  const metrics = {
    upcoming: bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    no_show: 0,
  }

  const filtered = bookings.filter(b => {
    if (tab === 'upcoming') return b.status === 'pending' || b.status === 'confirmed'
    if (tab === 'no_show') return false
    return b.status === tab
  })

  const tabs = ['upcoming', 'completed', 'cancelled', 'no_show']

  const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-on-surface-variant">{label}</p>
          <p className={`text-2xl font-bold text-on-surface`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color === 'amber-500' ? 'bg-amber-100 text-amber-700' : color === 'green-500' ? 'bg-green-100 text-green-700' : color === 'red-500' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header>
        <h1 className="text-3xl font-bold text-primary">Telehealth Management</h1>
        <p className="text-on-surface-variant mt-1">Monitor and manage all telehealth bookings</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Upcoming" value={metrics.upcoming} icon={CalendarClock} color="amber-500" />
        <StatCard label="Completed" value={metrics.completed} icon={CheckCircle} color="green-500" />
        <StatCard label="Cancelled" value={metrics.cancelled} icon={XCircle} color="red-500" />
        <StatCard label="No-Show" value={metrics.no_show} icon={AlertCircle} color="gray-500" />
      </div>

      <div className="inline-flex rounded-2xl bg-surface-container-high p-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`min-w-24 rounded-xl px-5 py-2.5 font-bold text-sm transition-colors capitalize ${
              tab === t ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}>
            {t.replace('_', ' ')} ({t === 'upcoming' ? metrics.upcoming : t === 'completed' ? metrics.completed : t === 'cancelled' ? metrics.cancelled : metrics.no_show})
          </button>
        ))}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={48} className="mx-auto text-on-surface-variant/40 mb-4" />
          <p className="text-on-surface-variant text-lg">No {tab} bookings</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map(b => {
            const StatusIcon = statusConfig[b.status]?.icon || Clock
            return (
              <motion.div key={b.id} variants={itemVariants}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-sm font-bold text-primary shrink-0">
                      <User size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-on-surface">{b.user_alias}</strong>
                        <span className="text-xs text-on-surface-variant">with {b.provider_name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sessionTypeColors[b.session_type] || 'bg-gray-100 text-gray-600'}`}>
                          {sessionTypeLabels[b.session_type] || b.session_type}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig[b.status]?.bg || 'bg-gray-100'} ${statusConfig[b.status]?.color || 'text-gray-600'}`}>
                          <StatusIcon size={10} className="inline mr-0.5" />
                          {statusConfig[b.status]?.label || b.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(b.scheduled_at)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(b.scheduled_at)}</span>
                        <span>{b.duration_minutes} min</span>
                        <span>{timeAgo(b.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {b.meeting_link && (
                      <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-on-secondary hover:brightness-110 transition-all">
                        <Video size={14} /> Join
                      </a>
                    )}
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <>
                        {reschedulingId === b.id ? (
                          <div className="flex items-center gap-2">
                            <input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)}
                              className="text-xs rounded-lg border border-outline-variant px-2 py-1.5 bg-surface-container-lowest" />
                            <button onClick={() => handleReschedule(b.id)}
                              className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-on-primary">Save</button>
                          </div>
                        ) : (
                          <button onClick={() => { setReschedulingId(b.id); setNewDate('') }}
                            className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-all">
                            <RefreshCw size={14} /> Reschedule
                          </button>
                        )}
                        {confirmId === b.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-error font-semibold">Confirm?</span>
                            <button onClick={() => handleCancel(b.id)}
                              className="rounded-lg bg-error px-2.5 py-1.5 text-xs font-semibold text-on-error">Yes</button>
                            <button onClick={() => setConfirmId(null)}
                              className="rounded-lg border border-outline-variant px-2.5 py-1.5 text-xs font-semibold">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(b.id)}
                            className="flex items-center gap-1 rounded-lg border border-error/30 px-3 py-2 text-xs font-semibold text-error hover:bg-error/5 transition-all">
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
