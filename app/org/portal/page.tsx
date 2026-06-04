'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, Activity, BarChart3 } from 'lucide-react'

export default function OrgWellnessPortal() {
  const [stats] = useState({
    participants: 42,
    appointments: 8,
    programs: 3,
    engagement: 78,
  })

  const [appointments] = useState([
    { alias: 'Selam-Eagle-47', program: 'Recovery Support', date: 'Today, 2:00 PM', status: 'confirmed' },
    { alias: 'Biruk-Crane-23', program: 'Spiritual Guidance', date: 'Today, 4:30 PM', status: 'confirmed' },
    { alias: 'Tsega-Lion-91', program: 'Group Session', date: 'Tomorrow, 10:00 AM', status: 'pending' },
    { alias: 'Fiker-Dove-12', program: 'Initial Assessment', date: 'Tomorrow, 3:00 PM', status: 'confirmed' },
  ])

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#92400E]">Organization Wellness Portal</h1>
          <p className="text-[#64748B] mt-1">Manage your programs and support participants</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <Users size={20} className="text-[#92400E] mb-2" />
            <p className="text-3xl font-bold text-[#1c1917]">{stats.participants}</p>
            <p className="text-sm text-[#64748B]">Program Participants</p>
          </div>
          <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <Calendar size={20} className="text-[#92400E] mb-2" />
            <p className="text-3xl font-bold text-[#1c1917]">{stats.appointments}</p>
            <p className="text-sm text-[#64748B]">Upcoming Appointments</p>
          </div>
          <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <Activity size={20} className="text-[#92400E] mb-2" />
            <p className="text-3xl font-bold text-[#1c1917]">{stats.programs}</p>
            <p className="text-sm text-[#64748B]">Active Programs</p>
          </div>
          <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <BarChart3 size={20} className="text-[#92400E] mb-2" />
            <p className="text-3xl font-bold text-[#1c1917]">{stats.engagement}%</p>
            <p className="text-sm text-[#64748B]">Engagement Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#1c1917] mb-4">Upcoming Appointments</h2>
            <div className="space-y-3">
              {appointments.map((apt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-[#1c1917]">{apt.alias}</p>
                    <p className="text-sm text-[#64748B]">{apt.program}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#64748B]">{apt.date}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-[#166534]' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#d6d3d1] shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#1c1917] mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Program Completion Rate</span>
                  <span className="font-semibold">72%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Average Session Attendance</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Participant Satisfaction</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Program Schedule</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Restoration Fellowship</span>
                  <span className="text-gray-400">Week 4 of 12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Support Circle</span>
                  <span className="text-gray-400">Week 2 of 8</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Wellness Workshop</span>
                  <span className="text-gray-400">Week 1 of 4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
