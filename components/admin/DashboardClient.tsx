'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, AlertTriangle, Zap, Clock, Shield, Trash2, XCircle, TrendingUp,
  Activity, MessageCircle, UserPlus, CheckCircle, Flag, Database, Wifi,
  BrainCircuit, ExternalLink, Settings, MapPin, Sparkles,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line,
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

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07 } },
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const duration = 800
    const from = 0
    const to = value

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }

    ref.current = requestAnimationFrame(tick)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [value])

  return <>{display}{suffix}</>
}

const systemServices = [
  { name: 'Database', icon: Database, status: 'online' as const },
  { name: 'API', icon: Wifi, status: 'online' as const },
  { name: 'Realtime', icon: Activity, status: 'online' as const },
  { name: 'AI Service', icon: BrainCircuit, status: 'online' as const },
]

interface FeedItem {
  id: string
  icon: React.ElementType
  color: string
  bg: string
  text: string
  time: string
  type: string
}

export function DashboardClient({ metrics, pendingProviders, flaggedMessages }: DashboardClientProps) {
  const [providers, setProviders] = useState(pendingProviders)
  const [messages, setMessages] = useState(flaggedMessages)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('30d')
  const [feedIndex, setFeedIndex] = useState(0)

  const todayStr = useMemo(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  [])

  const systemStatus = metrics.relapse_rate_7d < 20 ? 'optimal' : 'attention'
  const statusConfig = {
    optimal: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200', label: 'ALL SYSTEMS OPTIMAL' },
    attention: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200', label: 'ATTENTION REQUIRED' },
  }
  const status = statusConfig[systemStatus]

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

  const chartData = useMemo(() => {
    const raw = chartRange === '7d' ? metrics.activity_30d.slice(-7) : metrics.activity_30d
    return raw.map((d, i, arr) => {
      const window = arr.slice(Math.max(0, i - 2), Math.min(arr.length, i + 3))
      const avgCheckins = window.reduce((sum, w) => sum + w.checkins, 0) / window.length
      return { ...d, trend: Math.round(avgCheckins * 10) / 10 }
    })
  }, [metrics.activity_30d, chartRange])

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = []
    items.push({
      id: 'users',
      icon: UserPlus,
      color: 'text-green-600',
      bg: 'bg-green-50',
      text: `${metrics.new_users_7d} new ${metrics.new_users_7d === 1 ? 'user has' : 'users have'} joined this week`,
      time: 'Today',
      type: 'user',
    })
    if (metrics.panic_today > 0) {
      items.push({
        id: 'panic',
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        text: `${metrics.panic_today} panic ${metrics.panic_today === 1 ? 'event was' : 'events were'} resolved today`,
        time: '2h ago',
        type: 'panic',
      })
    }
    if (providers.length > 0) {
      items.push({
        id: 'provider',
        icon: Shield,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        text: `${providers[0].name} is pending verification`,
        time: '1h ago',
        type: 'provider',
      })
    }
    items.push({
      id: 'streaks',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      text: `${metrics.active_streaks} users have active streaks — avg ${metrics.avg_streak}d`,
      time: '30m ago',
      type: 'streak',
    })
    items.push({
      id: 'chat',
      icon: MessageCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      text: `${metrics.chat_today} messages sent in support rooms today`,
      time: '15m ago',
      type: 'chat',
    })
    return items
  }, [metrics, providers])

  useEffect(() => {
    if (feedItems.length < 2) return
    const interval = setInterval(() => {
      setFeedIndex(prev => (prev + 1) % feedItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [feedItems.length])

  const kpiCards = useMemo(() => [
    {
      label: 'Total Users', value: metrics.total_users,
      sub: `+${metrics.new_users_7d} this week`, icon: Users,
      color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-l-blue-500',
      showDelta: true, deltaUp: true, deltaValue: metrics.new_users_7d,
    },
    {
      label: "Panic Events Today", value: metrics.panic_today,
      sub: 'Real-time alerts', icon: AlertTriangle,
      color: 'text-red-600', bg: 'bg-red-50', border: 'border-l-red-500',
      showLive: true,
    },
    {
      label: 'Active Streaks', value: metrics.active_streaks,
      sub: `Avg ${metrics.avg_streak}d`, icon: Zap,
      color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-l-amber-500',
    },
    {
      label: 'Provider Queue', value: metrics.provider_queue,
      sub: 'Pending verification', icon: Clock,
      color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-l-indigo-500',
      showPending: true,
    },
  ], [metrics])

  const healthCards = useMemo(() => [
    {
      label: 'Chat Today', value: metrics.chat_today, suffix: '',
      icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50',
    },
    {
      label: 'Relapse Rate (7d)', value: metrics.relapse_rate_7d, suffix: '%',
      icon: Activity,
      color: metrics.relapse_rate_7d > 20 ? 'text-red-600' : 'text-green-600',
      bg: metrics.relapse_rate_7d > 20 ? 'bg-red-50' : 'bg-green-50',
    },
    {
      label: 'New Users (7d)', value: metrics.new_users_7d, suffix: '',
      icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50',
    },
    {
      label: 'Avg Streak', value: metrics.avg_streak, suffix: 'd',
      icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50',
    },
  ], [metrics])

  return (
    <div className="space-y-5">

      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2c241f]">Executive Command Center</h1>
          <p className="text-sm text-[#6f5b4e] mt-0.5">{todayStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 ${status.bg} ${status.text} rounded-full text-xs font-semibold border ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </div>
          <a href="/admin/moderation" className="text-xs font-semibold text-[#8a3d08] hover:underline flex items-center gap-1">
            View All <ExternalLink size={10} />
          </a>
          <a href="/admin/settings" className="text-xs font-semibold text-[#6f5b4e] hover:text-[#8a3d08]">
            <Settings size={14} />
          </a>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map(({ label, value, sub, icon: Icon, color, bg, border, showLive, showDelta, deltaUp, deltaValue }) => (
            <motion.div
              key={label}
              whileHover={{ y: -2 }}
              className={`bg-white rounded-lg border border-[#e5e0db] border-l-4 ${border} shadow-sm p-4 relative overflow-hidden`}
            >
              {showLive && (
                <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Live
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6f5b4e] uppercase tracking-wider">{label}</span>
                <Icon size={16} className={color} />
              </div>
              <div className="text-2xl font-bold text-[#2c241f]">
                <CountUp value={value} />
              </div>
              <div className="text-xs text-[#6f5b4e] mt-0.5 flex items-center gap-1.5">
                {showDelta && (
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${deltaUp ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp size={10} /> {deltaValue}
                  </span>
                )}
                {sub}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {healthCards.map(({ label, value, suffix, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              whileHover={{ y: -1 }}
              className={`${bg} rounded-lg border border-[#e5e0db] p-3 flex items-center gap-3`}
            >
              <Icon size={18} className={color} />
              <div>
                <div className="text-base font-bold text-[#2c241f]">
                  <CountUp value={value} suffix={suffix} />
                </div>
                <div className="text-[10px] text-[#6f5b4e]">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2 bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#2c241f]">Regional Activity</h2>
              <div className="flex items-center gap-3 text-[10px] font-medium text-[#6f5b4e]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e8e3dd]" /> Low</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" /> High</span>
              </div>
            </div>
            <div className="h-80 rounded-lg bg-gradient-to-br from-emerald-900/10 via-teal-800/10 to-amber-900/10 border border-[#e5e0db] flex items-center justify-center overflow-hidden p-4">
              <EthiopiaMap />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { name: 'Addis Abeba', activity: 'High activity', count: '12.4k' },
                { name: 'Hawassa', activity: 'Moderate', count: '3.2k' },
                { name: 'Dire Dawa', activity: 'Moderate', count: '2.8k' },
              ].map(city => (
                <div key={city.name} className="bg-[#fdf6ed] rounded-lg p-2.5 text-center">
                  <p className="text-xs font-semibold text-[#2c241f]">{city.name}</p>
                  <p className="text-[10px] text-[#6f5b4e]">{city.activity}</p>
                  <p className="text-[10px] font-semibold text-[#8a3d08] mt-0.5">{city.count} users</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-[#6f5b4e]">
              <span className="flex items-center gap-1.5"><Users size={12} /> 15k+ Students</span>
              <span className="flex items-center gap-1.5"><MapPin size={12} /> 8 Active Cities</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#2c241f]">Moderation Queue</h2>
                {messages.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 rounded-full">{messages.length}</span>
                )}
              </div>
              <span className="flex items-center gap-1 text-[10px] text-[#6f5b4e]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2c241f]">All Clear</p>
                  <p className="text-xs text-[#6f5b4e] mt-0.5">No flagged messages to review</p>
                </div>
              )}
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#f6f5f1] rounded-lg border border-[#e5e0db] p-3"
                >
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
                </motion.div>
              ))}
            </div>
            <a href="/admin/moderation" className="block w-full mt-3 text-center text-xs font-semibold text-[#8a3d08] hover:underline">
              View All Flagged ({metrics.flagged_messages}) &rarr;
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#2c241f]">Activity Trends</h2>
              <div className="flex items-center gap-3">
                <div className="flex bg-[#f6f5f1] rounded-lg p-0.5">
                  {(['7d', '30d'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                        chartRange === range
                          ? 'bg-white text-[#2c241f] shadow-sm'
                          : 'text-[#6f5b4e] hover:text-[#2c241f]'
                      }`}
                    >
                      {range.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#6f5b4e]">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#8a3d08]" /> CHECK-INS</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#dc2626]" /> PANIC</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
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
                    contentStyle={{
                      borderRadius: '8px', border: '1px solid #e5e0db',
                      background: '#fff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <Bar dataKey="checkins" fill="#8a3d08" radius={[3, 3, 0, 0]} name="CHECK-INS" opacity={0.85} />
                  <Bar dataKey="panic" fill="#dc2626" radius={[3, 3, 0, 0]} name="PANIC" />
                  <Line type="monotone" dataKey="trend" stroke="#8a3d08" strokeWidth={2} dot={false} strokeDasharray="4 3" opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#2c241f]">Pending Verifications</h2>
              <span className="text-xs text-[#6f5b4e]">{providers.length} pending</span>
            </div>
            {providers.length === 0 ? (
              <div className="text-center py-10">
                <Shield size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#2c241f]">All providers verified</p>
                <p className="text-xs text-[#6f5b4e] mt-0.5">The provider queue is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {providers.slice(0, 5).map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-[#f6f5f1] transition-colors"
                    >
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
                    </motion.div>
                  ))}
                </div>
                {providers.length > 5 && (
                  <a href="/admin/providers" className="block text-center text-xs font-semibold text-[#8a3d08] pt-3 hover:underline">
                    View all {providers.length} pending &rarr;
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#8a3d08]" />
              <h2 className="text-base font-semibold text-[#2c241f]">Live Activity Feed</h2>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Real-time
            </span>
          </div>
          <div className="relative min-h-[200px]">
            <AnimatePresence mode="popLayout">
              {feedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 25 }}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                    i === feedIndex ? 'bg-[#fdf6ed] border border-[#e5e0db]' : 'hover:bg-[#f6f5f1]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon size={14} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2c241f]">{item.text}</p>
                    <p className="text-[10px] text-[#9a8a7d]">{item.time}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${i === feedIndex ? 'bg-green-500 animate-pulse' : 'bg-[#e5e0db]'}`} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {systemServices.map(({ name, icon: Icon, status }) => (
            <div key={name} className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Icon size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-[#2c241f]">{name}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-green-600 font-medium">Operational</span>
                  <span className="text-[9px] text-[#9a8a7d]">/</span>
                  <span className="text-[10px] text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
