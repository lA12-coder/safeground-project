'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, AlertTriangle, Zap, Clock, Shield, Trash2, XCircle, TrendingUp, Activity, MessageCircle, UserPlus, CheckCircle, Flag,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area,
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
    psychiatrist: { label: 'MEDICAL', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    counselor: { label: 'MEDICAL', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    healthcare: { label: 'MEDICAL', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    religious_org: { label: 'SPIRITUAL', class: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
    religious_individual: { label: 'SPIRITUAL', class: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
    ngo: { label: 'COMMUNITY', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    university: { label: 'COMMUNITY', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    community: { label: 'COMMUNITY', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  }
  return map[type] || { label: type.toUpperCase(), class: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' }
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

const flagColors: Record<string, string> = {
  aggressive: 'bg-error/10 text-error border-error/20',
  spam: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  inappropriate: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  reported: 'bg-surface-container-high text-on-surface-variant',
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
        fill="var(--color-surface-container-high)"
        stroke="var(--color-primary-container)"
        strokeWidth="2"
      />
      <circle cx="220" cy="200" r="28" fill="var(--color-error)" fillOpacity={0.25} className="animate-pulse" />
      <circle cx="220" cy="200" r="10" fill="var(--color-error)" fillOpacity={0.8} />
      <circle cx="160" cy="310" r="14" fill="var(--color-primary)" fillOpacity={0.2} />
      <circle cx="160" cy="310" r="5" fill="var(--color-primary)" fillOpacity={0.7} />
      <circle cx="310" cy="250" r="14" fill="var(--color-primary)" fillOpacity={0.2} />
      <circle cx="310" cy="250" r="5" fill="var(--color-primary)" fillOpacity={0.7} />
      <text x="220" y="160" textAnchor="middle" fill="var(--color-on-surface)" className="text-[10px] font-bold">Addis Abeba</text>
      <text x="160" y="340" textAnchor="middle" fill="var(--color-on-surface-variant)" className="text-[9px] font-semibold">Hawassa</text>
      <text x="310" y="280" textAnchor="middle" fill="var(--color-on-surface-variant)" className="text-[9px] font-semibold">Dire Dawa</text>
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
    <div className="space-y-8 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-serif text-5xl font-bold text-primary">System Overview</h1>
          <p className="mt-2 text-on-surface-variant">Admin Portal &amp; Enterprise Monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-semibold border border-secondary/20">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-glow" />
          LIVE STATUS: OPTIMAL
        </div>
      </motion.div>

      {/* Metric Cards Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 animate-scale-in"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-on-surface-variant">Total Users</span>
            <Users size={20} className="text-on-surface-variant" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-on-surface">{metrics.total_users.toLocaleString()}</span>
            <span className="text-sm font-semibold text-secondary">+{metrics.new_users_7d} new this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-surface-container-lowest rounded-xl border border-error/30 shadow-sm p-6 animate-scale-in"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-on-surface-variant">Today&apos;s Panic Events</span>
            <AlertTriangle size={20} className="text-error" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-error">{metrics.panic_today}</span>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20">Real-time</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 animate-scale-in"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-on-surface-variant">Active Streaks</span>
            <Zap size={20} className="text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-on-surface">{metrics.active_streaks.toLocaleString()}</span>
            <span className="text-sm font-semibold text-primary">Avg {metrics.avg_streak}d</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-surface-container-lowest rounded-xl border border-primary-container/30 shadow-sm p-6 animate-scale-in"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-on-surface-variant">Provider Queue</span>
            <Clock size={20} className="text-primary" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-on-surface">{metrics.provider_queue}</span>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Pending</span>
          </div>
        </motion.div>
      </div>

      {/* System Health Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="grid gap-4 grid-cols-2 md:grid-cols-4"
      >
        {[
          { label: 'Chat Today', value: metrics.chat_today, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Relapse Rate (7d)', value: `${metrics.relapse_rate_7d}%`, icon: Activity, color: metrics.relapse_rate_7d > 20 ? 'text-error' : 'text-secondary', bg: metrics.relapse_rate_7d > 20 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-green-50 dark:bg-green-950/30' },
          { label: 'New Users (7d)', value: metrics.new_users_7d, icon: UserPlus, color: 'text-secondary', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Avg Streak', value: `${metrics.avg_streak}d`, icon: TrendingUp, color: 'text-primary', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className={`${bg} rounded-xl border border-outline-variant/30 p-4 flex items-center gap-3`}>
            <Icon className={`w-8 h-8 ${color}`} />
            <div>
              <p className="text-lg font-bold text-on-surface">{value}</p>
              <p className="text-xs text-on-surface-variant">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Regional Activity + Moderation Queue */}
      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="xl:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-8 transition-colors duration-300"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-on-surface">Regional Activity Heatmap</h2>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-surface-container-high" /> Low</span>
              <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-primary" /> High</span>
            </div>
          </div>
          <div className="relative h-[24rem] rounded-lg bg-gradient-to-br from-[#1f3b3f] via-[#425f5e] to-[#d4c79c] dark:from-[#0d1b1e] dark:via-[#1a2f2e] dark:to-[#5c4f2e] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full p-4">
              <EthiopiaMap />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-on-surface">Moderation Queue</h2>
              {messages.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-error/10 text-error rounded-full">{messages.length}</span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
              Live
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-secondary mx-auto mb-2 opacity-50" />
                <p className="text-sm text-on-surface-variant">No flagged messages</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">Community is doing well</p>
              </div>
            )}
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-surface-container-lowest rounded-lg border border-error/20 shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flag size={12} className="text-error" />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${flagColors[msg.flag_reason || 'reported']}`}>
                      {flagLabel(msg.flag_reason)}
                    </span>
                    <span className="text-xs text-on-surface-variant">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface mb-3 italic leading-relaxed">
                  &ldquo;{msg.message.slice(0, 120)}{msg.message.length > 120 ? '...' : ''}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={loadingId === msg.id}
                    className="px-3 py-1.5 bg-error text-on-error rounded-lg text-xs font-semibold hover:bg-error/80 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    DELETE
                  </button>
                  <button
                    onClick={() => handleIgnore(msg.id)}
                    disabled={loadingId === msg.id}
                    className="px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <XCircle size={12} />
                    IGNORE
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <a
            href="/admin/moderation"
            className="block w-full mt-4 text-center text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            View All Flagged ({metrics.flagged_messages}) →
          </a>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
      {/* 30-Day Activity Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        whileHover={{ scale: 1.01 }}
        className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-8 transition-colors duration-300"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface">30-Day Activity Trends</h2>
          <div className="flex items-center gap-5 text-xs text-on-surface-variant">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary" /> CHECK-INS</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-error" /> PANIC</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.activity_30d} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v)
                  const day = d.getDate()
                  if (day === 1 || day === 10 || day === 20) return `${d.getMonth() + 1}/${day}`
                  if (day === new Date().getDate()) return 'Today'
                  return ''
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)' }}
                labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <Bar dataKey="checkins" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="CHECK-INS" opacity={0.85} />
              <Bar dataKey="panic" fill="var(--color-error)" radius={[4, 4, 0, 0]} name="PANIC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pending Provider Verifications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-8 transition-colors duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-on-surface">Pending Provider Verifications</h2>
          <span className="text-xs text-on-surface-variant">{providers.length} pending</span>
        </div>

        {providers.length === 0 ? (
          <div className="text-center py-12 text-sm text-on-surface-variant">
            <CheckCircle className="w-10 h-10 text-secondary mx-auto mb-3" />
            No pending provider verifications
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Entity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Type</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{p.name}</p>
                          <p className="text-xs text-on-surface-variant">{p.org_name || p.specialization || p.city}</p>
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
                        className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
                      >
                        {loadingId === p.id ? '...' : 'VERIFY'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  )
}
