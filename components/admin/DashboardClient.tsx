'use client'

import { useState } from 'react'
import {
  Users, AlertTriangle, Zap, Clock, Shield, Trash2, XCircle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { AdminMetrics, Provider, AnonymousChat } from '@/lib/types'

// Using CSS variables from globals.ts for design token consistency

interface DashboardClientProps {
  metrics: AdminMetrics
  pendingProviders: Provider[]
  flaggedMessages: AnonymousChat[]
}

const typeBadge = (type: string) => {
  const map: Record<string, { label: string; class: string }> = {
    psychiatrist: { label: 'MEDICAL', class: 'bg-blue-100 text-blue-700' },
    counselor: { label: 'MEDICAL', class: 'bg-blue-100 text-blue-700' },
    healthcare: { label: 'MEDICAL', class: 'bg-blue-100 text-blue-700' },
    religious_org: { label: 'SPIRITUAL', class: 'bg-amber-100 text-amber-700' },
    religious_individual: { label: 'SPIRITUAL', class: 'bg-amber-100 text-amber-700' },
    ngo: { label: 'COMMUNITY', class: 'bg-green-100 text-green-700' },
    university: { label: 'COMMUNITY', class: 'bg-green-100 text-green-700' },
    community: { label: 'COMMUNITY', class: 'bg-green-100 text-green-700' },
  }
  return map[type] || { label: type.toUpperCase(), class: 'bg-gray-100 text-gray-700' }
}

const flagLabel = (reason?: string) => {
  const map: Record<string, string> = {
    aggressive: 'AGGRESSIVE LANGUAGE',
    spam: 'SPAM',
    inappropriate: 'INAPPROPRIATE',
    reported: 'REPORTED',
  }
  return map[reason || 'reported'] || 'REPORTED'
}

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function EthiopiaMap() {
  return (
    <svg viewBox="0 0 400 460" className="w-full h-full">
      <path
        d="M200 30 Q250 25 300 50 Q350 80 370 130 Q385 170 365 210 Q375 250 355 290 Q335 330 295 370 Q255 410 200 435 Q145 425 105 385 Q65 345 50 295 Q35 245 45 195 Q40 145 65 105 Q90 65 135 45 Q165 32 200 30 Z"
        fill="#fef3c7"
        stroke="#b45309"
        strokeWidth="2"
        className="shadow-sm"
      />
      <circle cx="220" cy="200" r="28" fill="rgba(220,38,38,0.35)" className="animate-pulse" />
      <circle cx="220" cy="200" r="10" fill="#dc2626" opacity={0.8} />
      <circle cx="160" cy="310" r="14" fill="rgba(217,119,6,0.3)" />
      <circle cx="160" cy="310" r="5" fill="#d97706" opacity={0.7} />
      <circle cx="310" cy="250" r="14" fill="rgba(217,119,6,0.3)" />
      <circle cx="310" cy="250" r="5" fill="#d97706" opacity={0.7} />
      <text x="220" y="160" textAnchor="middle" className="text-[10px] font-bold fill-amber-800">Addis Abeba</text>
      <text x="160" y="340" textAnchor="middle" className="text-[9px] font-semibold fill-amber-800">Hawassa</text>
      <text x="310" y="280" textAnchor="middle" className="text-[9px] font-semibold fill-amber-800">Dire Dawa</text>
    </svg>
  )
}

export function DashboardClient({ metrics, pendingProviders, flaggedMessages }: DashboardClientProps) {
  const [providers, setProviders] = useState(pendingProviders)
  const [messages, setMessages] = useState(flaggedMessages)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleVerify = async (id: string) => {
    setLoadingId(id)
    try {
      await fetch(`/api/admin/providers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      })
      setProviders(prev => prev.filter(p => p.id !== id))
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setLoadingId(id)
    try {
      await fetch(`/api/admin/chat/${id}/delete`, { method: 'DELETE' })
      setMessages(prev => prev.filter(m => m.id !== id))
    } finally {
      setLoadingId(null)
    }
  }

  const handleIgnore = async (id: string) => {
    setLoadingId(id)
    try {
      const supabase = createClient()
      await supabase.from('anonymous_chat').update({ is_flagged: false, flag_reason: null }).eq('id', id)
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== id))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl font-bold text-[#92400E]">System Overview</h1>
          <p className="mt-2 text-[#3b2418]">Admin Portal &amp; Enterprise Monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-[#166534] rounded-full text-sm font-semibold border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          LIVE STATUS: OPTIMAL
        </div>
      </div>

      {/* Metric Cards Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#64748B]">Total Users</span>
            <Users size={20} className="text-[#64748B]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[#1c1917]">{metrics.total_users.toLocaleString()}</span>
            <span className="text-sm font-semibold text-[#166534]">+12% ↑</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#B91C1C]/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#64748B]">Today&apos;s Panic Events</span>
            <AlertTriangle size={20} className="text-[#B91C1C]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[#B91C1C]">{metrics.panic_today}</span>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-[#B91C1C] border border-red-200">Real-time</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#64748B]">Active Streaks</span>
            <Zap size={20} className="text-[#92400E]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[#1c1917]">{metrics.active_streaks.toLocaleString()}</span>
            <span className="text-sm font-semibold text-[#92400E]">Avg {metrics.avg_streak}d</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-300 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#64748B]">Provider Queue</span>
            <Clock size={20} className="text-blue-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-[#1c1917]">{metrics.provider_queue}</span>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Pending</span>
          </div>
        </div>
      </div>

      {/* Regional Activity + Moderation Queue */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1c1917]">Regional Activity Heatmap</h2>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-[#eadbc8]" /> Low</span>
              <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-[#9a4f00]" /> High</span>
            </div>
          </div>
          <div className="relative h-[24rem] rounded-lg bg-gradient-to-br from-[#1f3b3f] via-[#425f5e] to-[#d4c79c] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full p-4">
              <EthiopiaMap />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1c1917]">Moderation Queue</h2>
            <span className="text-xs text-[#64748B]">Real-time</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-sm text-[#64748B] text-center py-8">No flagged messages</p>
            )}
            {messages.map(msg => (
              <div key={msg.id} className="bg-white rounded-lg border border-red-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-[#B91C1C]">
                      {flagLabel(msg.flag_reason)}
                    </span>
                    <span className="text-xs text-[#64748B]">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-[#1c1917] mb-3 italic">
                  &ldquo;{msg.message.slice(0, 120)}{msg.message.length > 120 ? '...' : ''}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={loadingId === msg.id}
                    className="px-3 py-1.5 bg-[#B91C1C] text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    DELETE
                  </button>
                  <button
                    onClick={() => handleIgnore(msg.id)}
                    disabled={loadingId === msg.id}
                    className="px-3 py-1.5 border border-[#d6d3d1] text-[#64748B] rounded-lg text-xs font-semibold hover:bg-[#f5f5f4] disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <XCircle size={12} />
                    IGNORE
                  </button>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/admin/moderation"
            className="block w-full mt-4 text-center text-sm text-[#92400E] font-semibold hover:text-[#78350F] transition-colors"
          >
            View All Flagged ({metrics.flagged_messages}) →
          </a>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
      {/* 30-Day Activity Trends */}
      <div className="bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1c1917]">30-Day Activity Trends</h2>
          <div className="flex items-center gap-5 text-xs text-[#3b2418]">
            <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-[#9a4f00]" /> CHECK-INS</span>
            <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-[#ef4444]" /> PANIC</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.activity_30d}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee7df" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#3b2418' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v)
                  const day = d.getDate()
                  if (day === 1 || day === 10 || day === 20) return `DAY ${day}`
                  if (day === new Date().getDate()) return 'TODAY'
                  return ''
                }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #d6d3d1' }}
                labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <Bar dataKey="checkins" fill="#eee7df" stroke="#9a4f00" strokeWidth={3} radius={[4, 4, 0, 0]} name="CHECK-INS" />
              <Bar dataKey="panic" fill="#ef4444" radius={[4, 4, 0, 0]} name="PANIC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Provider Verifications Table */}
      <div className="bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1c1917]">Pending Provider Verifications</h2>
          <span className="text-xs text-[#64748B]">{providers.length} pending</span>
        </div>

        {providers.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#64748B]">
            No pending provider verifications
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d6d3d1]/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Entity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Type</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(p => (
                  <tr key={p.id} className="border-b border-[#d6d3d1]/10 hover:bg-[#f5f5f4] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-[#92400E] font-bold text-sm shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1c1917]">{p.name}</p>
                          <p className="text-xs text-[#64748B]">{p.org_name || p.specialization || p.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadge(p.type).class}`}>
                        {typeBadge(p.type).label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleVerify(p.id)}
                        disabled={loadingId === p.id}
                        className="px-4 py-1.5 bg-[#92400E] text-white rounded-lg text-xs font-semibold hover:bg-[#78350F] disabled:opacity-50 transition-colors"
                      >
                        {loadingId === p.id ? '...' : 'VERIFY'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
