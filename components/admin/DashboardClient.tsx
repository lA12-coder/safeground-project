'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, AlertTriangle, Zap, Clock, Shield, Trash2, XCircle, TrendingUp, Activity, MessageCircle, UserPlus, CheckCircle, Flag,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { AdminMetrics, Provider, AnonymousChat } from '@/lib/types'

interface DashboardClientProps {
  metrics: AdminMetrics
  pendingProviders: Provider[]
  flaggedMessages: AnonymousChat[]
}

const typeBadge = (type: string) => {
  const map: Record<string, { label: string; class: string }> = {
    psychiatrist: { label: 'MEDICAL', class: 'bg-blue-50 text-blue-700' },
    counselor: { label: 'MEDICAL', class: 'bg-blue-50 text-blue-700' },
    healthcare: { label: 'MEDICAL', class: 'bg-blue-50 text-blue-700' },
    religious_org: { label: 'SPIRITUAL', class: 'bg-amber-50 text-amber-700' },
    religious_individual: { label: 'SPIRITUAL', class: 'bg-amber-50 text-amber-700' },
    ngo: { label: 'COMMUNITY', class: 'bg-green-50 text-green-700' },
    university: { label: 'COMMUNITY', class: 'bg-green-50 text-green-700' },
    community: { label: 'COMMUNITY', class: 'bg-green-50 text-green-700' },
  }
  return map[type] || { label: type.toUpperCase(), class: 'bg-gray-50 text-gray-600' }
}

const flagLabel = (reason?: string) => {
  const map: Record<string, string> = {
    aggressive: 'AGGRESSIVE',
    spam: 'SPAM',
    inappropriate: 'INAPPROPRIATE',
    reported: 'REPORTED',
  }
  return map[reason || 'reported'] || 'REPORTED'
}

const flagColors: Record<string, string> = {
  aggressive: 'bg-red-50 text-red-600 border-red-200',
  spam: 'bg-amber-50 text-amber-600 border-amber-200',
  inappropriate: 'bg-purple-50 text-purple-600 border-purple-200',
  reported: 'bg-gray-50 text-gray-600 border-gray-200',
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
    <svg viewBox="0 0 500 550" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="heatAddis" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heatHawassa" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8a3d08" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8a3d08" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heatDire" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8a3d08" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8a3d08" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M245 25 L270 28 L310 45 L340 65 L370 95 L395 130 L405 165 L400 195 L390 220 L375 245 L355 268 L335 290 L315 310 L295 330 L270 350 L250 365 L230 375 L210 380 L190 378 L170 370 L150 355 L130 335 L115 310 L105 285 L95 260 L88 235 L85 210 L87 185 L95 160 L108 138 L125 118 L145 100 L165 85 L185 72 L205 60 L225 48 L235 35 Z"
        fill="#e8e3dd" stroke="#d4c9be" strokeWidth="1.5" className="drop-shadow-sm"
      />
      <circle cx="245" cy="200" r="40" fill="url(#heatAddis)" />
      <circle cx="245" cy="200" r="8" fill="#dc2626" fillOpacity={0.5} className="animate-pulse" />
      <circle cx="170" cy="330" r="28" fill="url(#heatHawassa)" />
      <circle cx="170" cy="330" r="5" fill="#8a3d08" fillOpacity={0.6} />
      <circle cx="340" cy="270" r="28" fill="url(#heatDire)" />
      <circle cx="340" cy="270" r="5" fill="#8a3d08" fillOpacity={0.6} />
      <text x="245" y="155" textAnchor="middle" fill="#3d2e23" fontSize="11" fontWeight="bold">Addis Abeba</text>
      <text x="170" y="355" textAnchor="middle" fill="#6f5b4e" fontSize="10" fontWeight="600">Hawassa</text>
      <text x="340" y="295" textAnchor="middle" fill="#6f5b4e" fontSize="10" fontWeight="600">Dire Dawa</text>
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2c241f]">Dashboard</h1>
          <p className="text-sm text-[#6f5b4e] mt-0.5">System overview &amp; enterprise monitoring</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          ALL SYSTEMS OPTIMAL
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Users', value: metrics.total_users.toLocaleString(),
            sub: `+${metrics.new_users_7d} this week`, icon: Users,
            color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-l-blue-500',
          },
          {
            label: "Today's Panic Events", value: String(metrics.panic_today),
            sub: 'Real-time alerts', icon: AlertTriangle,
            color: 'text-red-600', bg: 'bg-red-50', border: 'border-l-red-500',
          },
          {
            label: 'Active Streaks', value: metrics.active_streaks.toLocaleString(),
            sub: `Avg ${metrics.avg_streak}d`, icon: Zap,
            color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-l-amber-500',
          },
          {
            label: 'Provider Queue', value: String(metrics.provider_queue),
            sub: 'Pending verification', icon: Clock,
            color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-l-indigo-500',
          },
        ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className={`bg-white rounded-lg border border-[#e5e0db] border-l-4 ${border} shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6f5b4e] uppercase tracking-wider">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <div className="text-2xl font-bold text-[#2c241f]">{value}</div>
            <div className="text-xs text-[#6f5b4e] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* System Health Row */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Chat Today', value: String(metrics.chat_today), icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Relapse Rate (7d)', value: `${metrics.relapse_rate_7d}%`, icon: Activity, color: metrics.relapse_rate_7d > 20 ? 'text-red-600' : 'text-green-600', bg: metrics.relapse_rate_7d > 20 ? 'bg-red-50' : 'bg-green-50' },
          { label: 'New Users (7d)', value: String(metrics.new_users_7d), icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg Streak', value: `${metrics.avg_streak}d`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-lg border border-[#e5e0db] p-3 flex items-center gap-3`}>
            <Icon size={18} className={color} />
            <div>
              <div className="text-base font-bold text-[#2c241f]">{value}</div>
              <div className="text-[10px] text-[#6f5b4e]">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Regional Map + Moderation Queue */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Map */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#2c241f]">Regional Activity</h2>
            <div className="flex items-center gap-3 text-[10px] font-medium text-[#6f5b4e]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e8e3dd]" /> Low</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" /> High</span>
            </div>
          </div>
          <div className="h-72 rounded-lg bg-gradient-to-br from-emerald-900/10 via-teal-800/10 to-amber-900/10 border border-[#e5e0db] flex items-center justify-center overflow-hidden p-4">
            <EthiopiaMap />
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#2c241f]">Moderation</h2>
              {messages.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 rounded-full">{messages.length}</span>
              )}
            </div>
            <span className="flex items-center gap-1 text-[10px] text-[#6f5b4e]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-[#6f5b4e]">No flagged messages</p>
                <p className="text-xs text-[#9a8a7d] mt-0.5">Community is doing well</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className="bg-[#f6f5f1] rounded-lg border border-[#e5e0db] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Flag size={11} className="text-red-500" />
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${flagColors[msg.flag_reason || 'reported']}`}>
                      {flagLabel(msg.flag_reason)}
                    </span>
                    <span className="text-[10px] text-[#9a8a7d]">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
                <p className="text-xs text-[#2c241f] mb-2 italic leading-relaxed line-clamp-2">
                  &ldquo;{msg.message.slice(0, 100)}{msg.message.length > 100 ? '...' : ''}&rdquo;
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleDelete(msg.id)} disabled={loadingId === msg.id}
                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                    <Trash2 size={10} /> Delete
                  </button>
                  <button onClick={() => handleIgnore(msg.id)} disabled={loadingId === msg.id}
                    className="px-2 py-1 border border-[#e5e0db] text-[#6f5b4e] rounded text-[10px] font-semibold hover:bg-[#f6f5f1] disabled:opacity-50 transition-colors flex items-center gap-1">
                    <XCircle size={10} /> Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
          <a href="/admin/moderation" className="block w-full mt-3 text-center text-xs font-semibold text-[#8a3d08] hover:underline">
            View all flagged ({metrics.flagged_messages}) →
          </a>
        </div>
      </div>

      {/* Chart + Provider Table */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* 30-Day Chart */}
        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#2c241f]">30-Day Activity</h2>
            <div className="flex items-center gap-4 text-[10px] text-[#6f5b4e]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#8a3d08]" /> CHECK-INS</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#dc2626]" /> PANIC</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.activity_30d} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9a8a7d' }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    if (d.getDate() === 1 || d.getDate() === 10 || d.getDate() === 20) return `${d.getMonth() + 1}/${d.getDate()}`
                    return ''
                  }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e0db', background: '#fff', fontSize: '12px' }}
                  labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <Bar dataKey="checkins" fill="#8a3d08" radius={[3, 3, 0, 0]} name="CHECK-INS" opacity={0.85} />
                <Bar dataKey="panic" fill="#dc2626" radius={[3, 3, 0, 0]} name="PANIC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Providers */}
        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#2c241f]">Pending Verifications</h2>
            <span className="text-xs text-[#6f5b4e]">{providers.length} pending</span>
          </div>
          {providers.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
              <p className="text-sm text-[#6f5b4e]">All providers verified</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {providers.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-[#f6f5f1] transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#f0ece7] flex items-center justify-center text-[11px] font-bold text-[#8a3d08] shrink-0">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2c241f] truncate">{p.name}</p>
                      <p className="text-[10px] text-[#6f5b4e] truncate">{p.org_name || p.specialization || p.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeBadge(p.type).class}`}>
                      {typeBadge(p.type).label}
                    </span>
                    <button onClick={() => handleVerify(p.id)} disabled={loadingId === p.id}
                      className="px-2.5 py-1 bg-[#8a3d08] text-white rounded text-[10px] font-semibold hover:bg-[#a04e14] disabled:opacity-50 transition-colors">
                      {loadingId === p.id ? '...' : 'Verify'}
                    </button>
                  </div>
                </div>
              ))}
              {providers.length > 5 && (
                <a href="/admin/providers" className="block text-center text-xs font-semibold text-[#8a3d08] pt-2 hover:underline">
                  View all {providers.length} pending →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
