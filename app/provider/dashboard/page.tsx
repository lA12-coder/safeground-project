'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Users, Star, Video, CheckCircle, XCircle,
  CalendarClock, Stethoscope, ToggleLeft, Sun, Save,
} from 'lucide-react'

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
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-on-surface-variant',
  cancelled: 'bg-red-100 text-red-600',
}
const TYPE_STYLES: Record<string, string> = {
  initial: 'bg-blue-100 text-blue-700',
  follow_up: 'bg-purple-100 text-purple-700',
  crisis: 'bg-red-100 text-red-700',
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
        setOnline(data.provider.online)
        setInPerson(data.provider.in_person)
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e)
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
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchData()
    fetchAvailability()
  }, [fetchData, fetchAvailability])

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
    const res = await fetch(`/api/provider/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    })
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b))
      setToast({ message: 'Booking confirmed', type: 'success' })
    }
  }

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/provider/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    if (res.ok) {
      setBookings(prev => prev.filter(b => b.id !== id))
      setToast({ message: 'Booking cancelled', type: 'success' })
    }
  }

  const handleReschedule = async (id: string) => {
    const newDate = prompt('Enter new date/time (YYYY-MM-DD HH:MM):')
    if (!newDate) return
    const res = await fetch(`/api/provider/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at: new Date(newDate).toISOString() }),
    })
    if (res.ok) {
      fetchData()
      setToast({ message: 'Booking rescheduled', type: 'success' })
    }
  }

  const handleSaveNotes = async (bookingId: string) => {
    const res = await fetch('/api/provider/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, notes: notes[bookingId] || '' }),
    })
    if (res.ok) setToast({ message: 'Notes saved', type: 'success' })
  }

  const handleSaveAvailability = async () => {
    setSavingAvail(true)
    try {
      await fetch('/api/provider/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ online, in_person: inPerson, session_types: sessionTypes, availability_slots: availabilitySlots }),
      })
      setToast({ message: 'Availability updated', type: 'success' })
    } catch {
      setToast({ message: 'Failed to update availability', type: 'error' })
    } finally {
      setSavingAvail(false)
    }
  }

  const toggleSlot = (day: string, hour: number) => {
    setAvailabilitySlots(prev => {
      const slots = prev[day] || []
      const hourStr = `${hour.toString().padStart(2, '0')}:00`
      const updated = slots.includes(hourStr)
        ? slots.filter(s => s !== hourStr)
        : [...slots, hourStr].sort()
      return { ...prev, [day]: updated }
    })
  }

  const timeAgo = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-surface transition-colors duration-300">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">×</button>
          </motion.div>
        )}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative">

        {/* Provider Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {provider?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{provider?.name || 'Provider'}</h1>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Stethoscope size={14} />
                <span>{provider?.specialization || 'Addiction Psychiatry'}</span>
                {provider?.is_verified && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1 text-secondary font-medium">
                      <CheckCircle size={12} /> Verified
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { icon: Calendar, label: "Today's Appointments", value: stats.today },
            { icon: Clock, label: 'This Week', value: stats.week },
            { icon: Users, label: 'Total Sessions', value: stats.total },
            { icon: Star, label: 'Rating', value: stats.rating },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
              <Icon size={20} className="text-primary mb-2" />
              <p className="text-3xl font-bold text-on-surface">{value}</p>
              <p className="text-sm text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Today's Schedule — Timeline */}
          <div className="col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-4">Today&apos;s Schedule</h2>
            <div className="space-y-0.5">
              {HOURS.map(hour => {
                const slotBooking = todayBookings.find(b => {
                  const h = new Date(b.scheduled_at).getHours()
                  return h === hour
                })

                return (
                  <div
                    key={hour}
                    className={`flex items-center gap-4 py-2 px-3 rounded-lg transition-colors ${
                      slotBooking ? 'bg-primary/5' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="w-16 text-xs text-on-surface-variant font-medium shrink-0">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                    {slotBooking ? (
                      <div className="flex-1 flex items-center justify-between bg-surface-container-lowest rounded-lg px-4 py-2.5 border border-primary/30 shadow-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-on-surface text-sm truncate">{slotBooking.alias}</p>
                          <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[slotBooking.session_type] || 'bg-gray-100 text-on-surface-variant'}`}>
                              {slotBooking.session_type === 'follow_up' ? 'Follow-up' : slotBooking.session_type.charAt(0).toUpperCase() + slotBooking.session_type.slice(1)}
                            </span>
                            <span className="text-on-surface-variant">{slotBooking.duration_minutes || 50} min</span>
                            <span className={`px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[slotBooking.status] || 'bg-gray-100 text-on-surface-variant'}`}>
                              {slotBooking.status.charAt(0).toUpperCase() + slotBooking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBooking(slotBooking.id)
                            if (!notes[slotBooking.id] && slotBooking.notes) {
                              setNotes(prev => ({ ...prev, [slotBooking.id]: slotBooking.notes! }))
                            }
                            const link = slotBooking.meeting_link || `https://meet.safeground.app/${slotBooking.id}`
                            window.open(link, '_blank')
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-semibold hover:brightness-110 transition-colors shrink-0"
                        >
                          <Video size={13} />
                          Join Session
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 text-xs text-on-surface-variant/50 italic">— Available —</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-on-surface mb-4">Upcoming Appointments</h2>
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4">No upcoming appointments</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {upcomingBookings.slice(0, 10).map(b => (
                    <div key={b.id} className="p-3 bg-surface-container-low rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{b.alias}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {new Date(b.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_STYLES[b.session_type] || 'bg-gray-100 text-on-surface-variant'}`}>
                              {b.session_type === 'follow_up' ? 'Follow-up' : b.session_type.charAt(0).toUpperCase() + b.session_type.slice(1)}
                            </span>
                            <span className="text-[10px] text-on-surface-variant">{b.duration_minutes || 50}min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleConfirm(b.id)}
                              className="px-2 py-1 text-[10px] bg-secondary text-on-secondary rounded font-semibold hover:brightness-110"
                              title="Confirm"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => handleReschedule(b.id)}
                            className="px-2 py-1 text-[10px] bg-primary/10 text-primary rounded font-semibold hover:bg-primary/20"
                            title="Reschedule"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="px-2 py-1 text-[10px] bg-error/10 text-error rounded font-semibold hover:bg-error/20 transition-colors"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Notes */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-on-surface">Session Notes</h2>
                {selectedBooking && (
                  <span className="text-xs text-on-surface-variant bg-gray-100 px-2 py-0.5 rounded">
                    {bookings.find(b => b.id === selectedBooking)?.alias}
                  </span>
                )}
              </div>
              {!selectedBooking ? (
                <div className="text-center py-6">
                  <p className="text-sm text-on-surface-variant">Click a session to write notes</p>
                </div>
              ) : (
                <>
                  <textarea
                    placeholder="Write anonymous session notes... Patients are identified by alias only."
                    value={notes[selectedBooking] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, [selectedBooking!]: e.target.value }))}
                    className="w-full h-28 p-3 border border-outline-variant/30 rounded-lg text-sm resize-none placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    onClick={() => handleSaveNotes(selectedBooking)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-colors"
                  >
                    <Save size={14} />
                    Save Notes
                  </button>
                  <p className="text-xs text-on-surface-variant mt-2">
                    Notes are encrypted and linked to session only
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Availability Settings */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-on-surface">Availability Settings</h2>
            <button
              onClick={handleSaveAvailability}
              disabled={savingAvail}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              {savingAvail ? 'Saving...' : 'Save Availability'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Weekly Calendar Grid */}
            <div>
              <h3 className="text-sm font-semibold text-on-surface/80 mb-3">Weekly Schedule</h3>
              <div className="grid grid-cols-6 gap-1">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-on-surface-variant py-2">
                    {day}
                  </div>
                ))}
                {DAYS.map(day => (
                  <div key={`slots-${day}`} className="space-y-0.5">
                    {HOURS.map(hour => {
                      const isActive = (availabilitySlots[day] || []).includes(`${hour.toString().padStart(2, '0')}:00`)
                      return (
                        <button
                          key={`${day}-${hour}`}
                          onClick={() => toggleSlot(day, hour)}
                          className={`w-full py-1 rounded text-[10px] font-medium transition-colors ${
                            isActive
                              ? 'bg-secondary/10 text-secondary border border-secondary/30'
                              : 'bg-surface-container-low text-on-surface-variant/50 border border-surface-container-high hover:border-outline-variant'
                          }`}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary/10 border border-secondary/30" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-surface-container-low border border-surface-container-high" /> Unavailable</span>
              </div>
            </div>

            {/* Session Types & Mode */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-on-surface/80 mb-3">Session Types Offered</h3>
                <div className="space-y-2">
                  {SESSION_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sessionTypes.includes(t)}
                        onChange={e => {
                          setSessionTypes(prev =>
                            e.target.checked ? [...prev, t] : prev.filter(s => s !== t)
                          )
                        }}
                        className="rounded border-outline-variant/30 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-on-surface/80">
                        {t === 'initial' ? 'Initial Assessment' : t === 'follow_up' ? 'Follow-up Session' : 'Crisis Intervention'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-on-surface/80 mb-3">Session Mode</h3>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={online}
                      onChange={e => setOnline(e.target.checked)}
                      className="rounded border-outline-variant/30 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-on-surface/80">Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inPerson}
                      onChange={e => setInPerson(e.target.checked)}
                      className="rounded border-outline-variant/30 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-on-surface/80">In-person</span>
                  </label>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    online && inPerson ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    online ? 'bg-secondary/10 text-secondary' :
                    inPerson ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
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
