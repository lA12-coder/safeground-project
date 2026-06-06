'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react'

interface Booking {
  id: string
  user_id: string
  provider_id: string
  booking_type: string
  scheduled_at: string
  status: string
  profiles?: { alias: string }
  providers?: { display_name: string }
}

export default function AdminAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      const supabase = createClient()
      const { data } = await supabase
        .from('telehealth_bookings')
        .select('*, profiles(alias), providers(display_name)')
        .order('scheduled_at', { ascending: false })
        .limit(50)
      if (data) setBookings(data as Booking[])
      setLoading(false)
    }
    fetchBookings()
  }, [])

  const pending = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Appointments</h1>
        <p className="text-on-surface-variant mt-1">Manage all telehealth appointments across the platform</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-6">
          <Calendar className="w-5 h-5 text-primary mb-2" />
          <p className="text-3xl font-bold text-on-surface">{bookings.length}</p>
          <p className="text-sm text-on-surface-variant">Total Appointments</p>
        </div>
        <div className="card p-6">
          <Clock className="w-5 h-5 text-amber-700 mb-2" />
          <p className="text-3xl font-bold text-on-surface">{pending}</p>
          <p className="text-sm text-on-surface-variant">Pending</p>
        </div>
        <div className="card p-6">
          <Users className="w-5 h-5 text-green-700 mb-2" />
          <p className="text-3xl font-bold text-on-surface">{confirmed}</p>
          <p className="text-sm text-on-surface-variant">Confirmed</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-on-surface mb-4">All Appointments</h2>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface-container-high rounded" />)}
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-on-surface-variant text-sm">No appointments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Alias</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Provider</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                    <td className="py-3 px-4 font-medium text-on-surface">
                      {(b.profiles as { alias?: string })?.alias || 'Anonymous'}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {(b.providers as { display_name?: string })?.display_name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                        {b.booking_type === 'online' ? 'Online' : 'In-person'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {new Date(b.scheduled_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {b.status === 'confirmed' ? (
                        <span className="flex items-center gap-1 text-green-700 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      ) : b.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-amber-700 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> {b.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
