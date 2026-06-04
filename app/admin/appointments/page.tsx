'use client'

import { Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react'

const appointments = [
  { alias: 'Selam-Eagle-47', provider: 'Dr. Hiwot Bekele', type: 'Follow-up', date: 'Today, 2:00 PM', status: 'confirmed' },
  { alias: 'Biruk-Crane-23', provider: 'Meron Gizaw', type: 'Initial', date: 'Today, 4:30 PM', status: 'pending' },
  { alias: 'Tsega-Lion-91', provider: 'Dr. Yonas Alemu', type: 'Crisis', date: 'Tomorrow, 10:00 AM', status: 'confirmed' },
  { alias: 'Fiker-Dove-12', provider: 'Dawit Hailu', type: 'Follow-up', date: 'Tomorrow, 3:00 PM', status: 'confirmed' },
  { alias: 'Abenezer-Crane-68', provider: 'Dr. Selam Tesfaye', type: 'Initial', date: 'Jun 6, 9:00 AM', status: 'pending' },
]

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#92400E]">Appointments</h1>
        <p className="text-[#64748B] mt-1">Manage all telehealth appointments across the platform</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
          <Calendar size={20} className="text-[#92400E] mb-2" />
          <p className="text-3xl font-bold text-[#1c1917]">{appointments.length}</p>
          <p className="text-sm text-[#64748B]">Total Appointments</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
          <Clock size={20} className="text-[#92400E] mb-2" />
          <p className="text-3xl font-bold text-[#1c1917]">{appointments.filter(a => a.status === 'pending').length}</p>
          <p className="text-sm text-[#64748B]">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
          <Users size={20} className="text-[#92400E] mb-2" />
          <p className="text-3xl font-bold text-[#1c1917]">{appointments.filter(a => a.status === 'confirmed').length}</p>
          <p className="text-sm text-[#64748B]">Confirmed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#1c1917] mb-4">All Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d6d3d1]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Alias</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Provider</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, i) => (
                <tr key={i} className="border-b border-[#d6d3d1]/10 hover:bg-[#f5f5f4] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#1c1917]">{apt.alias}</td>
                  <td className="py-3 px-4 text-[#64748B]">{apt.provider}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      apt.type === 'Crisis' ? 'bg-red-100 text-[#B91C1C]' :
                      apt.type === 'Initial' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {apt.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{apt.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-[#166534]' : 'bg-amber-100 text-[#92400E]'
                    }`}>
                      {apt.status === 'confirmed' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
