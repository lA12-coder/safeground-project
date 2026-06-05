'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Users, Star, Video, CheckCircle, XCircle,
  CalendarClock, Stethoscope, Save, TrendingUp, BarChart3, FileText,
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

  const todayStr = new Date().toDateString()
  const todayBookings = bookings.filter(b => new Date(b.scheduled_at).toDateString() === todayStr)
  const upcomingBookings = bookings.filter(b => {
    const d = new Date(b.scheduled_at)
    return d > new Date() && d.toDateString() !== todayStr
  })
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekBookings = bookings.filter(b => new Date(b.scheduled_at) >= weekStart)

  const stats = {
    today: todayBookings.length,
    week: weekBookings.length,
    total: bookings.length,
    rating: provider?.rating?.toFixed(1) || '4.9',
  }

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
    if (res.ok) setToast({ message: 'Notes saved', type: 'success' })
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

      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5">

        {/* Profile Header */}
        <div className="flex items-center gap-4 bg-white rounded-lg border border-[#e5e0db] shadow-sm p-4">
          <div className="w-12 h-12 rounded-full bg-[#f0ece7] flex items-center justify-center text-[#92400E] font-bold text-lg">
            {provider?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2c241f]">{provider?.name || 'Provider Dashboard'}</h1>
            <div className="flex items-center gap-2 text-xs text-[#6f5b4e] mt-0.5">
              <Stethoscope size={12} />
              <span>{provider?.specialization || 'Addiction Psychiatry'}</span>
              {provider?.is_verified && (
                <><span className="w-1 h-1 rounded-full bg-[#d4c9be]" /><span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={11} /> Verified</span></>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {[
            { icon: Calendar, label: "Today's Appointments", value: stats.today, accent: 'border-l-blue-500', bg: 'bg-blue-50', color: 'text-blue-600' },
            { icon: Clock, label: 'This Week', value: stats.week, accent: 'border-l-amber-500', bg: 'bg-amber-50', color: 'text-amber-600' },
            { icon: Users, label: 'Total Sessions', value: stats.total, accent: 'border-l-green-500', bg: 'bg-green-50', color: 'text-green-600' },
            { icon: Star, label: 'Rating', value: stats.rating, accent: 'border-l-purple-500', bg: 'bg-purple-50', color: 'text-purple-600' },
          ].map(({ icon: Icon, label, value, accent, bg, color }) => (
            <div key={label} className={`bg-white rounded-lg border border-[#e5e0db] border-l-4 ${accent} shadow-sm p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-[#6f5b4e] uppercase tracking-wider">{label}</span>
                <Icon size={14} className={color} />
              </div>
              <p className="text-2xl font-bold text-[#2c241f]">{value}</p>
            </div>
          ))}
        </div>

        {/* Booking Trends Chart */}
        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#92400E]" />
              <h2 className="text-sm font-semibold text-[#2c241f]">Monthly Booking Trends</h2>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#6f5b4e]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#92400E]" /> Sessions</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#166534]" /> Completed</span>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(() => {
                const months: Record<string, { sessions: number; completed: number }> = {}
                bookings.forEach(b => {
                  const m = new Date(b.scheduled_at).toLocaleDateString('en-US', { month: 'short' })
                  if (!months[m]) months[m] = { sessions: 0, completed: 0 }
                  months[m].sessions++
                  if (b.status === 'completed') months[m].completed++
                })
                return Object.entries(months).map(([month, data]) => ({ month, ...data }))
              })()} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9a8a7d' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e5e0db', background: '#fff', fontSize: '12px' }} />
                <Bar dataKey="sessions" fill="#92400E" radius={[3, 3, 0, 0]} opacity={0.8} />
                <Bar dataKey="completed" fill="#166534" radius={[3, 3, 0, 0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule + Notes */}
        <div className="grid gap-5 xl:grid-cols-3">
          {/* Today's Schedule */}
          <div className="xl:col-span-2 bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#2c241f] mb-4">Today&apos;s Schedule</h2>
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
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#2c241f] truncate">{slotBooking.alias}</p>
                          <div className="flex items-center gap-2 text-[10px] mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[slotBooking.session_type] || 'bg-gray-50 text-gray-600'}`}>
                              {slotBooking.session_type === 'follow_up' ? 'Follow-up' : slotBooking.session_type.charAt(0).toUpperCase() + slotBooking.session_type.slice(1)}
                            </span>
                            <span className="text-[#6f5b4e]">{slotBooking.duration_minutes || 50}min</span>
                            <span className={`px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[slotBooking.status] || 'bg-gray-50 text-gray-600'}`}>
                              {slotBooking.status.charAt(0).toUpperCase() + slotBooking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => {
                          setSelectedBooking(slotBooking.id)
                          if (!notes[slotBooking.id] && slotBooking.notes) setNotes(prev => ({ ...prev, [slotBooking.id]: slotBooking.notes! }))
                          window.open(slotBooking.meeting_link || `https://meet.safeground.app/${slotBooking.id}`, '_blank')
                        }} className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-md text-[10px] font-semibold hover:bg-green-700 transition-colors shrink-0">
                          <Video size={11} /> Join
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 text-[11px] text-[#9a8a7d]/50 italic">— Available —</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Upcoming */}
            <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[#2c241f] mb-4">Upcoming Appointments</h2>
              {upcomingBookings.length === 0 ? (
                <p className="text-xs text-[#6f5b4e] text-center py-6">No upcoming appointments</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                  {upcomingBookings.slice(0, 10).map(b => (
                    <div key={b.id} className="p-2.5 bg-[#f6f5f1] rounded-md">
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
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 shrink-0">
                          {b.status === 'pending' && (
                            <button onClick={() => handleConfirm(b.id)} className="px-2 py-1 text-[10px] bg-green-600 text-white rounded font-semibold hover:bg-green-700">Confirm</button>
                          )}
                          <button onClick={() => handleReschedule(b.id)} className="px-2 py-1 text-[10px] bg-[#f0ece7] text-[#92400E] rounded font-semibold hover:bg-[#e5e0db]">Reschedule</button>
                          <button onClick={() => handleCancel(b.id)} className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100">Cancel</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Notes */}
            <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#2c241f]">Session Notes</h2>
                {selectedBooking && (
                  <span className="text-[10px] text-[#6f5b4e] bg-[#f6f5f1] px-2 py-0.5 rounded">{bookings.find(b => b.id === selectedBooking)?.alias}</span>
                )}
              </div>
              {!selectedBooking ? (
                <div className="text-center py-8">
                  <FileText size={24} className="text-[#9a8a7d] mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-[#6f5b4e]">Click a session to write notes</p>
                </div>
              ) : (
                <>
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
                  <button onClick={() => handleSaveNotes(selectedBooking)} className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-[#92400E] text-white rounded-md text-xs font-semibold hover:bg-[#a04e14] transition-colors">
                    <Save size={12} /> Save Notes
                  </button>
                  <p className="text-[10px] text-[#6f5b4e] mt-2 flex items-center gap-1">
                    <FileText size={10} /> Notes are encrypted and linked to session only
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Availability Settings */}
        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-[#2c241f]">Availability Settings</h2>
            <button onClick={handleSaveAvailability} disabled={savingAvail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#92400E] text-white rounded-md text-xs font-semibold hover:bg-[#a04e14] disabled:opacity-50 transition-colors">
              <Save size={12} /> {savingAvail ? 'Saving...' : 'Save'}
            </button>
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
        </div>
      </div>
    </div>
  )
}
