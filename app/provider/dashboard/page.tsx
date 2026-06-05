'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Users, Star, Video, CheckCircle, XCircle,
  CalendarClock, Stethoscope, Save, TrendingUp, BarChart3, FileText,
  Search, ChevronDown, MoreHorizontal, Activity, Zap, PieChart,
  UserCheck, UserX, Clock3, CalendarRange, Sparkles,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface Booking {
  id: string
  alias: string
  scheduled_at: string
  session_type: string
  duration_minutes: number
  status: string
  notes?: string
  meeting_link?: string
}

interface ProviderProfile {
  name: string
  specialization: string
  online: boolean
  in_person: boolean
  is_verified: boolean
  rating: number
  session_types?: string[]
  availability_slots?: Record<string, string[]>
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8)
const SESSION_TYPES = ['initial', 'follow_up', 'crisis']
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

const AVAIL_PRESETS: { label: string; slots: Record<string, string[]> }[] = [
  {
    label: 'Standard 9-5',
    slots: Object.fromEntries(DAYS.map(d => [d, ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']])),
  },
  {
    label: 'Morning Only',
    slots: Object.fromEntries(DAYS.map(d => [d, ['09:00', '10:00', '11:00', '12:00']])),
  },
  {
    label: 'Full Day',
    slots: Object.fromEntries(DAYS.map(d => [d, HOURS.map(h => `${h.toString().padStart(2, '0')}:00`)])),
  },
]

function groupAppointments(bookings: Booking[]): { label: string; items: Booking[] }[] {
  const now = new Date()
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
  const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7)

  const tomorrowStr = tomorrow.toDateString()
  const todayStr = now.toDateString()

  const tomorrowItems = bookings.filter(b => new Date(b.scheduled_at).toDateString() === tomorrowStr)
  const thisWeekItems = bookings.filter(b => {
    const d = new Date(b.scheduled_at)
    const ds = d.toDateString()
    return ds !== todayStr && ds !== tomorrowStr && d >= now && d <= weekEnd
  })
  const laterItems = bookings.filter(b => new Date(b.scheduled_at) > weekEnd)

  const groups: { label: string; items: Booking[] }[] = []
  if (tomorrowItems.length) groups.push({ label: 'Tomorrow', items: tomorrowItems })
  if (thisWeekItems.length) groups.push({ label: 'This Week', items: thisWeekItems })
  if (laterItems.length) groups.push({ label: 'Later', items: laterItems })
  return groups
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const [online, setOnline] = useState(false)
  const [inPerson, setInPerson] = useState(true)
  const [sessionTypes, setSessionTypes] = useState<string[]>(SESSION_TYPES)
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, string[]>>({})
  const [savingAvail, setSavingAvail] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [chartView, setChartView] = useState<'monthly' | 'weekly'>('monthly')
  const [searchQuery, setSearchQuery] = useState('')
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null)
  const [showPresets, setShowPresets] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/provider/bookings')
      if (res.ok) {
        const data = await res.json()
        setProvider(data.provider)
        setBookings(data.bookings || [])
        setOnline(Boolean(data.provider?.online))
        setInPerson(Boolean(data.provider?.in_person))
      }
    } catch {
      setToast({ message: 'Could not load provider dashboard', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch('/api/provider/availability')
      if (res.ok) {
        const data = await res.json()
        setSessionTypes(data.session_types || SESSION_TYPES)
        setAvailabilitySlots(data.availability_slots || {})
        if (typeof data.online === 'boolean') setOnline(data.online)
        if (typeof data.in_person === 'boolean') setInPerson(data.in_person)
      }
    } catch {}
  }, [])

  useEffect(() => { fetchData(); fetchAvailability() }, [fetchData, fetchAvailability])

  useEffect(() => {
    if (bookings.length > 0 && !selectedBooking) {
      const upcomingSorted = [...bookings]
        .filter(b => b.status === 'pending' || b.status === 'confirmed')
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      if (upcomingSorted.length > 0) {
        setSelectedBooking(upcomingSorted[0].id)
        if (upcomingSorted[0].notes) setNotes(prev => ({ ...prev, [upcomingSorted[0].id]: upcomingSorted[0].notes! }))
      }
    }
  }, [bookings, selectedBooking])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const todayStr = new Date().toDateString()
  const todayBookings = bookings.filter(b => new Date(b.scheduled_at).toDateString() === todayStr)
  const upcomingBookings = bookings.filter(b => {
    const d = new Date(b.scheduled_at)
    return d > new Date() && d.toDateString() !== todayStr
  })
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekBookings = bookings.filter(b => new Date(b.scheduled_at) >= weekStart)

  const filteredUpcoming = upcomingBookings.filter(b =>
    b.alias.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingGroups = groupAppointments(filteredUpcoming)

  const stats = {
    today: todayBookings.length,
    week: weekBookings.length,
    total: bookings.length,
    rating: provider?.rating?.toFixed(1) || '4.9',
  }

  const totalSlots = DAYS.length * HOURS.length
  const filledSlots = Object.values(availabilitySlots).flat().length
  const availPercent = Math.round((filledSlots / totalSlots) * 100)

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length
  const completedCount = bookings.filter(b => b.status === 'completed').length
  const totalWithStatus = bookings.length
  const confirmationRate = totalWithStatus ? Math.round((confirmedCount / totalWithStatus) * 100) : 0
  const cancellationRate = totalWithStatus ? Math.round((cancelledCount / totalWithStatus) * 100) : 0
  const noShowRate = totalWithStatus ? Math.round(((totalWithStatus - confirmedCount - cancelledCount - completedCount) / totalWithStatus) * 100) : 0

  const initialCount = bookings.filter(b => b.session_type === 'initial').length
  const followUpCount = bookings.filter(b => b.session_type === 'follow_up').length
  const crisisCount = bookings.filter(b => b.session_type === 'crisis').length
  const totalType = initialCount + followUpCount + crisisCount || 1

  const chartData = useMemo(() => {
    if (chartView === 'monthly') {
      const months: Record<string, { sessions: number; completed: number }> = {}
      bookings.forEach(b => {
        const m = new Date(b.scheduled_at).toLocaleDateString('en-US', { month: 'short' })
        if (!months[m]) months[m] = { sessions: 0, completed: 0 }
        months[m].sessions++
        if (b.status === 'completed') months[m].completed++
      })
      return Object.entries(months).map(([month, data]) => ({ month, ...data }))
    }
    const days: Record<string, { sessions: number; completed: number }> = {}
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-US', { weekday: 'short' })
      days[key] = { sessions: 0, completed: 0 }
    }
    bookings.forEach(b => {
      const bd = new Date(b.scheduled_at)
      const diff = Math.round((now.getTime() - bd.getTime()) / 86400000)
      if (diff >= 0 && diff <= 6) {
        const key = bd.toLocaleDateString('en-US', { weekday: 'short' })
        if (days[key]) {
          days[key].sessions++
          if (b.status === 'completed') days[key].completed++
        }
      }
    })
    return Object.entries(days).map(([day, data]) => ({ month: day, ...data }))
  }, [bookings, chartView])

  const handleConfirm = async (id: string) => {
    const res = await fetch(`/api/provider/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) })
    if (res.ok) { setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b)); setToast({ message: 'Booking confirmed', type: 'success' }) }
  }

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/provider/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) })
    if (res.ok) { setBookings(prev => prev.filter(b => b.id !== id)); setToast({ message: 'Booking cancelled', type: 'success' }) }
  }

  const handleReschedule = async (id: string) => {
    const newDate = prompt('Enter new date/time (YYYY-MM-DD HH:MM):')
    if (!newDate) return
    const res = await fetch(`/api/provider/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduled_at: new Date(newDate).toISOString() }) })
    if (res.ok) { fetchData(); setToast({ message: 'Booking rescheduled', type: 'success' }) }
  }

  const handleSaveNotes = async (bookingId: string) => {
    const res = await fetch('/api/provider/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_id: bookingId, notes: notes[bookingId] || '' }) })
    if (res.ok) {
      setToast({ message: 'Notes saved', type: 'success' })
      setSavedNoteId(bookingId)
      setTimeout(() => setSavedNoteId(null), 2000)
    }
  }

  const handleSaveAvailability = async () => {
    setSavingAvail(true)
    try {
      await fetch('/api/provider/availability', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ online, in_person: inPerson, session_types: sessionTypes, availability_slots: availabilitySlots }) })
      setToast({ message: 'Availability updated', type: 'success' })
    } catch { setToast({ message: 'Failed to update availability', type: 'error' }) }
    finally { setSavingAvail(false) }
  }

  const toggleSlot = (day: string, hour: number) => {
    setAvailabilitySlots(prev => {
      const slots = prev[day] || []
      const hourStr = `${hour.toString().padStart(2, '0')}:00`
      const updated = slots.includes(hourStr) ? slots.filter(s => s !== hourStr) : [...slots, hourStr].sort()
      return { ...prev, [day]: updated }
    })
  }

  const applyPreset = (preset: typeof AVAIL_PRESETS[number]) => {
    setAvailabilitySlots(preset.slots)
    setShowPresets(false)
    setToast({ message: `Preset "${preset.label}" applied`, type: 'success' })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#92400E] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5"
        variants={fadeUp} initial="initial" animate="animate">

        {/* Profile Header */}
        <motion.div className="flex items-center gap-4 bg-white rounded-lg border border-[#e5e0db] shadow-sm p-4"
          variants={fadeUp}>
          <div className="w-12 h-12 rounded-full bg-[#f0ece7] flex items-center justify-center text-[#92400E] font-bold text-lg">
            {provider?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-[#2c241f]">{provider?.name || 'Provider Dashboard'}</h1>
              {provider?.is_verified && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6f5b4e] mt-0.5">
              <Stethoscope size={12} />
              <span>{provider?.specialization || 'Addiction Psychiatry'}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-medium text-[#92400E] bg-[#fdf6ed] px-2.5 py-1 rounded-full">
              Healthcare Management Portal
            </span>
            <span className="text-[10px] text-[#9a8a7d]">{formatDate(new Date())}</span>
          </div>
        </motion.div>

        {/* KPI Row */}
        <motion.div className="grid gap-3 grid-cols-2 sm:grid-cols-4" variants={fadeUp}>
          {[
            { icon: Calendar, label: "Today's Appointments", value: stats.today, accent: 'border-l-blue-500', bg: 'bg-blue-50', color: 'text-blue-600', trend: '+2 from last week' },
            { icon: CalendarRange, label: 'This Week', value: stats.week, accent: 'border-l-amber-500', bg: 'bg-amber-50', color: 'text-amber-600', trend: null },
            { icon: Users, label: 'Total Sessions', value: stats.total, accent: 'border-l-green-500', bg: 'bg-green-50', color: 'text-green-600', trend: null },
            { icon: Star, label: 'Rating', value: stats.rating, accent: 'border-l-purple-500', bg: 'bg-purple-50', color: 'text-purple-600', trend: null },
          ].map(({ icon: Icon, label, value, accent, bg, color, trend }) => (
            <div key={label} className={`bg-white rounded-lg border border-[#e5e0db] border-l-4 ${accent} shadow-sm p-4 hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-[#6f5b4e] uppercase tracking-wider">{label}</span>
                <div className={`${bg} p-1.5 rounded-md`}>
                  <Icon size={13} className={color} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-[#2c241f] font-mono">{value}</p>
                {trend && <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5"><TrendingUp size={10} />{trend}</span>}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid gap-5 xl:grid-cols-3">

          {/* Left Column */}
          <div className="xl:col-span-2 space-y-5">

            {/* Today's Schedule */}
            <motion.div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5" variants={fadeUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#2c241f]">Today&apos;s Schedule</h2>
                <div className="flex items-center gap-2 text-[10px] text-[#6f5b4e]">
                  <Clock3 size={12} />
                  <span>{todayBookings.length} appointment{todayBookings.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                {HOURS.map(hour => {
                  const slotBooking = todayBookings.find(b => new Date(b.scheduled_at).getHours() === hour)
                  return (
                    <div key={hour} className={`flex items-center gap-3 py-1.5 px-3 rounded-md transition-colors ${slotBooking ? 'bg-[#f0ece7]' : 'hover:bg-[#f6f5f1]'}`}>
                      <span className="w-14 text-[11px] text-[#6f5b4e] font-medium shrink-0">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                      {slotBooking ? (
                        <div className="flex-1 flex items-center justify-between bg-white rounded-md px-3 py-2 border border-[#e5e0db] shadow-sm">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                slotBooking.status === 'confirmed' ? 'bg-green-500' :
                                slotBooking.status === 'pending' ? 'bg-amber-500' :
                                slotBooking.status === 'completed' ? 'bg-gray-400' : 'bg-red-500'
                              }`} />
                              <p className="text-sm font-medium text-[#2c241f] truncate">{slotBooking.alias}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] mt-0.5 ml-3.5">
                              <span className={`px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[slotBooking.session_type] || 'bg-gray-50 text-gray-600'}`}>
                                {slotBooking.session_type === 'follow_up' ? 'Follow-up' : slotBooking.session_type.charAt(0).toUpperCase() + slotBooking.session_type.slice(1)}
                              </span>
                              <span className="text-[#6f5b4e]">{slotBooking.duration_minutes || 50}min</span>
                              <span className={`px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[slotBooking.status] || 'bg-gray-50 text-gray-600'}`}>
                                {slotBooking.status.charAt(0).toUpperCase() + slotBooking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {slotBooking.status === 'confirmed' && (
                              <button onClick={() => {
                                setSelectedBooking(slotBooking.id)
                                if (!notes[slotBooking.id] && slotBooking.notes) setNotes(prev => ({ ...prev, [slotBooking.id]: slotBooking.notes! }))
                                window.open(slotBooking.meeting_link || `https://meet.safeground.app/${slotBooking.id}`, '_blank')
                              }} className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-md text-[10px] font-semibold hover:bg-green-700 transition-colors">
                                <Video size={11} /> Start Session
                              </button>
                            )}
                            {slotBooking.status === 'pending' && (
                              <button onClick={() => handleConfirm(slotBooking.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#92400E] text-white rounded-md text-[10px] font-semibold hover:bg-[#a04e14] transition-colors">
                                <CheckCircle size={11} /> Confirm
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-[11px] text-[#9a8a7d]/50 italic">— Available —</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Booking Trends Chart */}
            <motion.div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5" variants={fadeUp}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#92400E]" />
                  <h2 className="text-sm font-semibold text-[#2c241f]">Booking Trends</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-[#f6f5f1] rounded-md p-0.5">
                    <button onClick={() => setChartView('monthly')}
                      className={`px-2 py-1 text-[10px] font-semibold rounded transition-colors ${chartView === 'monthly' ? 'bg-white text-[#92400E] shadow-sm' : 'text-[#6f5b4e] hover:text-[#2c241f]'}`}>
                      Monthly
                    </button>
                    <button onClick={() => setChartView('weekly')}
                      className={`px-2 py-1 text-[10px] font-semibold rounded transition-colors ${chartView === 'weekly' ? 'bg-white text-[#92400E] shadow-sm' : 'text-[#6f5b4e] hover:text-[#2c241f]'}`}>
                      7-Day
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3 text-[10px] text-[#6f5b4e]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#92400E]" /> Sessions</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#166534]" /> Completed</span>
                {totalWithStatus > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-green-700 font-medium">
                    <Sparkles size={11} /> {Math.round((completedCount / (totalWithStatus - cancelledCount || 1)) * 100)}% conversion rate
                  </span>
                )}
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9a8a7d' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e0db', background: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="sessions" fill="#92400E" radius={[3, 3, 0, 0]} opacity={0.8} />
                    <Bar dataKey="completed" fill="#166534" radius={[3, 3, 0, 0]} opacity={0.9} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>

          {/* Right Column */}
          <div className="space-y-5">

            {/* Upcoming Appointments */}
            <motion.div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5" variants={fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#2c241f]">Upcoming Appointments</h2>
                <span className="text-[10px] text-[#6f5b4e] bg-[#f6f5f1] px-2 py-0.5 rounded-full">{upcomingBookings.length}</span>
              </div>
              <div className="relative mb-3">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9a8a7d]" />
                <input type="text" placeholder="Search by alias..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 border border-[#e5e0db] rounded-md text-[11px] placeholder:text-[#9a8a7d] focus:outline-none focus:ring-2 focus:ring-[#92400E]/20 focus:border-[#92400E]" />
              </div>
              {filteredUpcoming.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarClock size={28} className="text-[#9a8a7d] mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-[#6f5b4e]">{searchQuery ? 'No matching appointments' : 'No upcoming appointments'}</p>
                  <p className="text-[10px] text-[#9a8a7d] mt-1">New bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                  {upcomingGroups.length === 0 && !searchQuery ? (
                    <p className="text-xs text-[#6f5b4e] text-center py-6">No upcoming appointments</p>
                  ) : (
                    upcomingGroups.map((group) => (
                      <div key={group.label}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold text-[#6f5b4e] uppercase tracking-wider">{group.label}</span>
                          <span className="text-[10px] text-[#9a8a7d] bg-[#f6f5f1] px-1.5 py-0.5 rounded-full">{group.items.length}</span>
                        </div>
                        <div className="space-y-1.5">
                          {group.items.slice(0, 5).map(b => (
                            <div key={b.id} className={`p-2.5 rounded-md cursor-pointer transition-colors ${selectedBooking === b.id ? 'bg-[#fdf6ed] border border-[#e5e0db]' : 'bg-[#f6f5f1] hover:bg-[#f0ece7]'}`}
                              onClick={() => {
                                setSelectedBooking(b.id)
                                if (!notes[b.id] && b.notes) setNotes(prev => ({ ...prev, [b.id]: b.notes! }))
                              }}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-[#2c241f] truncate">{b.alias}</p>
                                  <p className="text-[10px] text-[#6f5b4e] mt-0.5">
                                    {new Date(b.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_STYLES[b.session_type] || 'bg-gray-50 text-gray-600'}`}>
                                      {b.session_type === 'follow_up' ? 'Follow-up' : b.session_type.charAt(0).toUpperCase() + b.session_type.slice(1)}
                                    </span>
                                    <span className="text-[10px] text-[#6f5b4e]">{b.duration_minutes || 50}min</span>
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_STYLES[b.status] || 'bg-gray-50 text-gray-600'}`}>
                                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-1 shrink-0">
                                  {b.status === 'pending' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleConfirm(b.id) }}
                                      className="px-2 py-1 text-[10px] bg-green-600 text-white rounded font-semibold hover:bg-green-700">Confirm</button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); handleReschedule(b.id) }}
                                    className="px-2 py-1 text-[10px] bg-[#f0ece7] text-[#92400E] rounded font-semibold hover:bg-[#e5e0db]">Reschedule</button>
                                  {b.status !== 'confirmed' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleCancel(b.id) }}
                                      className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100">Cancel</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>

            {/* Session Notes */}
            <motion.div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5" variants={fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#2c241f]">Session Notes</h2>
                {selectedBooking && (
                  <span className="text-[10px] text-[#6f5b4e] bg-[#f6f5f1] px-2 py-0.5 rounded">{bookings.find(b => b.id === selectedBooking)?.alias}</span>
                )}
              </div>
              {!selectedBooking ? (
                <div className="text-center py-8">
                  <FileText size={24} className="text-[#9a8a7d] mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-[#6f5b4e]">Select an appointment to write notes</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {['SOAP Note', 'Progress Note', 'Crisis Note'].map(template => (
                      <button key={template} onClick={() => {
                        const templates: Record<string, string> = {
                          'SOAP Note': 'Subjective:\n- Patient reports\n\nObjective:\n- Observations\n\nAssessment:\n- Clinical impression\n\nPlan:\n- Next steps',
                          'Progress Note': 'Progress since last session:\n- \n\nCurrent concerns:\n- \n\nGoals for next session:\n- ',
                          'Crisis Note': 'Crisis type:\n- \n\nInterventions used:\n- \n\nOutcome:\n- \n\nFollow-up plan:\n- ',
                        }
                        if (bookings.find(b => b.id === selectedBooking)) setNotes(prev => ({ ...prev, [selectedBooking!]: templates[template] || '' }))
                      }} className="px-2 py-1 text-[10px] font-semibold bg-[#f6f5f1] text-[#6f5b4e] rounded-md hover:bg-[#e5e0db] transition-colors">{template}</button>
                    ))}
                  </div>
                  <textarea placeholder="Write anonymous session notes... Patients are identified by alias only."
                    value={notes[selectedBooking] || ''} onChange={e => setNotes(prev => ({ ...prev, [selectedBooking!]: e.target.value }))}
                    className="w-full h-28 p-3 border border-[#e5e0db] rounded-md text-xs resize-none placeholder:text-[#9a8a7d] focus:outline-none focus:ring-2 focus:ring-[#92400E]/20 focus:border-[#92400E]" />
                  <button onClick={() => handleSaveNotes(selectedBooking)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-[#92400E] text-white rounded-md text-xs font-semibold hover:bg-[#a04e14] transition-colors">
                    {savedNoteId === selectedBooking ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                        <CheckCircle size={12} /> Saved!
                      </motion.span>
                    ) : (
                      <span className="flex items-center gap-1"><Save size={12} /> Save Notes</span>
                    )}
                  </button>
                  <p className="text-[10px] text-[#6f5b4e] mt-2 flex items-center gap-1">
                    <FileText size={10} /> Notes are encrypted and linked to session only
                  </p>
                </motion.div>
              )}
            </motion.div>

          </div>
        </div>

        {/* Availability Settings */}
        <motion.div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5" variants={fadeUp}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#2c241f]">Availability Settings</h2>
              <p className="text-[10px] text-[#6f5b4e] mt-0.5">{filledSlots} of {totalSlots} time slots filled ({availPercent}%)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setShowPresets(!showPresets)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold bg-[#f6f5f1] text-[#6f5b4e] rounded-md hover:bg-[#e5e0db] transition-colors">
                  <Zap size={11} /> Presets
                </button>
                {showPresets && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#e5e0db] rounded-lg shadow-lg z-10 py-1 w-44">
                    {AVAIL_PRESETS.map(p => (
                      <button key={p.label} onClick={() => applyPreset(p)}
                        className="w-full text-left px-3 py-1.5 text-[11px] text-[#2c241f] hover:bg-[#fdf6ed] transition-colors">{p.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleSaveAvailability} disabled={savingAvail}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#92400E] text-white rounded-md text-xs font-semibold hover:bg-[#a04e14] disabled:opacity-50 transition-colors">
                <Save size={12} /> {savingAvail ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          <div className="w-full bg-[#f6f5f1] rounded-full h-1.5 mb-5">
            <motion.div className="bg-[#92400E] h-1.5 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${availPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-[#6f5b4e] mb-2 uppercase tracking-wider">Weekly Schedule</h3>
              <div className="grid grid-cols-6 gap-1">
                {DAYS.map(day => <div key={day} className="text-center text-[10px] font-semibold text-[#6f5b4e] py-1.5">{day}</div>)}
                {DAYS.map(day => (
                  <div key={`slots-${day}`} className="space-y-0.5">
                    {HOURS.map(hour => {
                      const isActive = (availabilitySlots[day] || []).includes(`${hour.toString().padStart(2, '0')}:00`)
                      return (
                        <button key={`${day}-${hour}`} onClick={() => toggleSlot(day, hour)}
                          className={`w-full py-1 rounded text-[10px] font-medium transition-colors ${
                            isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#f6f5f1] text-[#9a8a7d] border border-[#e5e0db] hover:border-[#d4c9be]'
                          }`}>
                          {hour.toString().padStart(2, '0')}:00
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-[#6f5b4e]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-50 border border-green-200" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#f6f5f1] border border-[#e5e0db]" /> Unavailable</span>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-[#6f5b4e] mb-2 uppercase tracking-wider">Session Types</h3>
                <div className="space-y-1.5">
                  {SESSION_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sessionTypes.includes(t)}
                        onChange={e => setSessionTypes(prev => e.target.checked ? [...prev, t] : prev.filter(s => s !== t))}
                        className="rounded border-[#d4c9be] text-[#92400E] focus:ring-[#92400E]" />
                      <span className="text-xs text-[#2c241f]">
                        {t === 'initial' ? 'Initial Assessment' : t === 'follow_up' ? 'Follow-up Session' : 'Crisis Intervention'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#6f5b4e] mb-2 uppercase tracking-wider">Session Mode</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)}
                      className="rounded border-[#d4c9be] text-[#92400E] focus:ring-[#92400E]" />
                    <span className="text-xs text-[#2c241f]">Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={inPerson} onChange={e => setInPerson(e.target.checked)}
                      className="rounded border-[#d4c9be] text-[#92400E] focus:ring-[#92400E]" />
                    <span className="text-xs text-[#2c241f]">In-person</span>
                  </label>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    online && inPerson ? 'bg-blue-50 text-blue-700' : online ? 'bg-green-50 text-green-700' : inPerson ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {online && inPerson ? 'Hybrid' : online ? 'Online Only' : inPerson ? 'In-Person' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Productivity Section */}
        <div className="grid gap-5 sm:grid-cols-2">

          {/* Booking Performance */}
          <motion.div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5" variants={fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-[#92400E]" />
              <h2 className="text-sm font-semibold text-[#2c241f]">Booking Performance</h2>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6f5b4e] flex items-center gap-1"><CheckCircle size={11} className="text-green-600" /> Confirmation Rate</span>
                  <span className="text-[11px] font-semibold text-[#2c241f] font-mono">{confirmationRate}%</span>
                </div>
                <div className="w-full bg-[#f6f5f1] rounded-full h-2">
                  <motion.div className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${confirmationRate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6f5b4e] flex items-center gap-1"><XCircle size={11} className="text-red-500" /> Cancellation Rate</span>
                  <span className="text-[11px] font-semibold text-[#2c241f] font-mono">{cancellationRate}%</span>
                </div>
                <div className="w-full bg-[#f6f5f1] rounded-full h-2">
                  <motion.div className="bg-red-400 h-2 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${cancellationRate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6f5b4e] flex items-center gap-1"><UserX size={11} className="text-amber-600" /> No-Show Rate</span>
                  <span className="text-[11px] font-semibold text-[#2c241f] font-mono">{noShowRate}%</span>
                </div>
                <div className="w-full bg-[#f6f5f1] rounded-full h-2">
                  <motion.div className="bg-amber-500 h-2 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${noShowRate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Patient Demographics */}
          <motion.div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5" variants={fadeUp}>
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={15} className="text-[#92400E]" />
              <h2 className="text-sm font-semibold text-[#2c241f]">Patient Demographics</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6f5b4e] flex items-center gap-1"><UserCheck size={11} className="text-blue-600" /> Initial Assessments</span>
                  <span className="text-[11px] font-semibold text-[#2c241f] font-mono">{initialCount} ({Math.round((initialCount / totalType) * 100)}%)</span>
                </div>
                <div className="w-full bg-[#f6f5f1] rounded-full h-2">
                  <motion.div className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${(initialCount / totalType) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6f5b4e] flex items-center gap-1"><UserCheck size={11} className="text-purple-600" /> Follow-up Sessions</span>
                  <span className="text-[11px] font-semibold text-[#2c241f] font-mono">{followUpCount} ({Math.round((followUpCount / totalType) * 100)}%)</span>
                </div>
                <div className="w-full bg-[#f6f5f1] rounded-full h-2">
                  <motion.div className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${(followUpCount / totalType) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6f5b4e] flex items-center gap-1"><UserCheck size={11} className="text-red-600" /> Crisis Interventions</span>
                  <span className="text-[11px] font-semibold text-[#2c241f] font-mono">{crisisCount} ({Math.round((crisisCount / totalType) * 100)}%)</span>
                </div>
                <div className="w-full bg-[#f6f5f1] rounded-full h-2">
                  <motion.div className="bg-red-500 h-2 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${(crisisCount / totalType) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
              <div className="w-full bg-[#f6f5f1] rounded-full h-3 flex overflow-hidden mt-2">
                <motion.div className="bg-blue-500 h-full transition-all"
                  initial={{ width: 0 }} animate={{ width: `${(initialCount / totalType) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
                <motion.div className="bg-purple-500 h-full transition-all"
                  initial={{ width: 0 }} animate={{ width: `${(followUpCount / totalType) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
                <motion.div className="bg-red-500 h-full transition-all"
                  initial={{ width: 0 }} animate={{ width: `${(crisisCount / totalType) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-[#6f5b4e]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Initial</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> Follow-up</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> Crisis</span>
              </div>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </div>
  )
}
