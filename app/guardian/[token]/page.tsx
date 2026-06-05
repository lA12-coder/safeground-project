'use client'

import { useEffect, useState, use, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Shield, Lock, ChevronLeft, Trophy, Star, TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, Target, Calendar, FileDown, Inbox, AlertTriangle } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis, AreaChart, Area, BarChart, Bar, Tooltip } from 'recharts'
import type { GuardianViewData } from '@/lib/types'

const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365]

const encouragementHistory = [
  { type: 'encourage', message: 'I sent a word of encouragement', time: '2h ago' },
  { type: 'calm', message: 'I sent a calming thought', time: '1d ago' },
  { type: 'faith', message: 'I sent faith support', time: '3d ago' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

function getRecoveryPhase(streak: number): { label: string; color: string } {
  if (streak >= 90) return { label: 'Sustained Recovery', color: 'text-green-600 bg-green-50 border-green-200' }
  if (streak >= 30) return { label: 'Strong Progress', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  if (streak >= 7) return { label: 'Building Momentum', color: 'text-amber-700 bg-amber-50 border-amber-200' }
  return { label: 'Early Recovery', color: 'text-blue-600 bg-blue-50 border-blue-200' }
}

function getMoodTrend(moods: { mood: number }[]): { label: string; color: string; icon: typeof TrendingUp } {
  if (moods.length < 2) return { label: 'Stable', color: 'text-amber-700 bg-amber-50', icon: Minus }
  const recent = moods.slice(-3).reduce((a, b) => a + b.mood, 0) / 3
  const earlier = moods.slice(0, 3).reduce((a, b) => a + b.mood, 0) / 3
  if (recent > earlier + 0.5) return { label: 'Improving', color: 'text-green-600 bg-green-50', icon: TrendingUp }
  if (recent < earlier - 0.5) return { label: 'Declining', color: 'text-red-600 bg-red-50', icon: TrendingDown }
  return { label: 'Stable', color: 'text-amber-700 bg-amber-50', icon: Minus }
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getAlertIcon(type: string) {
  switch (type) {
    case 'panic_alert': return AlertTriangle
    case 'milestone': return Trophy
    case 'relapse': return AlertTriangle
    default: return Inbox
  }
}

function getAlertColor(type: string) {
  switch (type) {
    case 'panic_alert': return 'text-red-500 bg-red-50'
    case 'milestone': return 'text-amber-600 bg-amber-50'
    case 'relapse': return 'text-orange-600 bg-orange-50'
    default: return 'text-blue-500 bg-blue-50'
  }
}

export default function GuardianViewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<GuardianViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [sentHistory, setSentHistory] = useState<typeof encouragementHistory>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [language, setLanguage] = useState<'en' | 'am'>('en')

  const t = (en: string, am: string) => language === 'am' ? am : en

  const moodScores = useMemo(() => data?.last_7_days_mood.map(d => d.mood) || [], [data])
  const avgMood = moodScores.length ? (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1) : '0'
  const maxMood = moodScores.length ? Math.max(...moodScores) : 0
  const minMood = moodScores.length ? Math.min(...moodScores) : 0

  const phase = data ? getRecoveryPhase(data.current_streak) : { label: '', color: '' }
  const trend = data ? getMoodTrend(data.last_7_days_mood) : { label: '', color: '', icon: Minus }

  const encouragementCounts = useMemo(() => {
    const counts: Record<string, number> = { encourage: 0, calm: 0, faith: 0 }
    sentHistory.forEach(h => { counts[h.type] = (counts[h.type] || 0) + 1 })
    return counts
  }, [sentHistory])

  useEffect(() => {
    fetchData()
  }, [token])

  async function fetchData() {
    try {
      const res = await fetch(`/api/guardian/view/${token}`)
      if (!res.ok) { setError(true); return }
      const result = await res.json()
      setData(result)
      const milestones = MILESTONES
      if (milestones.includes(result.current_streak)) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 5000)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function sendEncouragement(type: string) {
    setSending(type)
    try {
      await fetch('/api/guardian/encourage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message_type: type }),
      })
      const labels: Record<string, string> = {
        encourage: 'I sent a word of encouragement',
        calm: 'I sent a calming thought',
        faith: 'I sent faith support',
      }
      setSentHistory(prev => [{ type, message: labels[type] || 'Sent encouragement', time: 'Just now' }, ...prev])
    } catch {}
    setTimeout(() => setSending(null), 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-outline-variant/30 rounded w-48 mx-auto" />
            <div className="h-6 bg-outline-variant/20 rounded w-64 mx-auto" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-64 bg-outline-variant/20 rounded-2xl" />
              <div className="h-64 bg-outline-variant/20 rounded-2xl" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="h-40 bg-outline-variant/20 rounded-xl" />
              <div className="h-40 bg-outline-variant/20 rounded-xl" />
              <div className="h-40 bg-outline-variant/20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-container-lowest rounded-2xl shadow-sm p-12 max-w-md text-center border border-outline-variant/30"
        >
          <Shield size={48} className="text-on-surface-variant mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-on-surface mb-2">Link Not Active</h1>
          <p className="text-on-surface-variant">This guardian link is no longer active or has expired.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <nav className="bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronLeft size={20} className="text-on-surface-variant" />
            <span className="text-xl font-bold text-primary">SafeGround</span>
            <span className="text-xs text-on-surface-variant hidden sm:inline">/</span>
            <span className="text-xs text-on-surface-variant hidden sm:inline">Guardian</span>
            <span className="text-xs text-on-surface-variant hidden sm:inline">/</span>
            <span className="text-xs text-primary font-medium hidden sm:inline">{data.alias}</span>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as 'en' | 'am')}
              className="text-sm border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-low text-on-surface"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
            </select>
            <button className="px-4 py-1.5 bg-error text-on-error rounded-full font-bold text-sm hover:opacity-90 transition-opacity">PANIC</button>
            <div className="w-8 h-8 rounded-full bg-surface-container-high" />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 relative">
        {/* Milestone Celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-8 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Trophy className="w-16 h-16 text-amber-600 mx-auto mb-2" />
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-800">Milestone Reached!</h3>
              <p className="text-amber-700 mt-1">{data.alias} has reached {data.current_streak} days</p>
              <button
                onClick={() => setShowCelebration(false)}
                className="mt-3 text-xs text-amber-600 underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero */}
        <motion.div {...fadeUp} className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${phase.color}`}>
              {phase.label}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-on-surface mb-2">
            {t('Supporting', 'እየደገፍኩ')} <span className="text-primary">{data.alias}</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            {t(
              'Your presence is their strength. Today, they are choosing recovery one step at a time.',
              'መገኘትህ ጥንካሬያቸው ነው። ዛሬ፣ ወደ ማገገም እየመረጡ ነው።'
            )}
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* LEFT: Streak Display */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 text-center">
            <motion.p
              animate={showCelebration ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: showCelebration ? Infinity : 0, duration: 2 }}
              className="text-8xl font-bold text-primary font-mono tabular-nums"
            >
              {data.current_streak}
            </motion.p>
            <p className="text-lg text-on-surface-variant mt-2">
              {t('Days of Strength', 'የጥንካሬ ቀናት')}
            </p>
            <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold">
              <CheckCircle2 size={13} />
              {t('Safety Plan Active', 'የደህንነት እቅድ ንቁ')}
            </div>

            {/* Goal Progress */}
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                <span className="flex items-center gap-1">
                  <Target size={12} />
                  {t('Goal Progress', 'የግብ እድገት')}
                </span>
                <span className="font-semibold text-primary">{data.current_streak} / {data.longest_streak || data.current_streak}d</span>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-primary">
                      {t('Current', 'አሁን')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold inline-block text-on-surface-variant">
                      {t('Best', 'ምርጥ')}: {data.longest_streak}d
                    </span>
                  </div>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((data.current_streak / Math.max(data.longest_streak, 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Progress to next milestone */}
            <div className="mt-3 pt-3 border-t border-outline-variant/30">
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                <span>{t('Progress to next milestone', 'እስከ ሚልስቶን ድረስ ያለው እድገት')}</span>
                <span className="font-semibold text-primary">
                  {(() => {
                    const next = MILESTONES.find(m => m > data.current_streak) || MILESTONES[MILESTONES.length - 1]
                    return `${Math.round((data.current_streak / next) * 100)}%`
                  })()}
                </span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data.current_streak / (MILESTONES.find(m => m > data.current_streak) || MILESTONES[MILESTONES.length - 1])) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                />
              </div>
            </div>

            {/* Milestone Badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {MILESTONES.map(m => {
                const reached = data.current_streak >= m
                return (
                  <div
                    key={m}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      reached
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : 'bg-surface-container-high text-on-surface-variant/50 border border-outline-variant/30'
                    }`}
                    title={`${m} days${reached ? ' - Reached!' : ''}`}
                  >
                    {reached ? <CheckCircle2 size={14} className="text-amber-600" /> : `${m}`}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* RIGHT: Mood Flow */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface">{t('7-Day Mood Flow', 'የ7 ቀን ስሜት ፍሰት')}</h3>
              <div className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${trend.color}`}>
                <trend.icon size={11} />
                {trend.label}
              </div>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.last_7_days_mood}>
                  <defs>
                    <linearGradient id="guardianMoodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="mood" stroke="var(--color-primary)" strokeWidth={2} fill="url(#guardianMoodGrad)" dot={{ fill: 'var(--color-primary)', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Mini Mood Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-surface-container-low rounded-lg p-3 text-center">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t('Highest', 'ከፍተኛ')}</p>
                <p className="text-xl font-bold text-green-600 font-mono">{maxMood}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3 text-center">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t('Lowest', 'ዝቅተኛ')}</p>
                <p className="text-xl font-bold text-red-500 font-mono">{minMood}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3 text-center">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t('Average', 'አማካይ')}</p>
                <p className="text-xl font-bold text-primary font-mono">{avgMood}</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant text-center mt-4">
              {t('High points indicate times of calm and connection.', 'ከፍተኛ ነጥቦች የመረጋጋት እና የግንኙነት ጊዜዎችን ያመለክታሉ።')}
            </p>
          </motion.div>
        </div>

        {/* Encouragement + Recent Activity */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">
          {/* Encouragement Cards - 3 cols */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="md:col-span-3">
            <h2 className="text-xl font-semibold text-on-surface text-center mb-6">
              {t('Send Encouragement', 'ማበረታቻ ላክ')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'encourage', icon: Heart, bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-800 dark:text-pink-300', subtext: 'text-pink-600 dark:text-pink-400', quote: t('"I am so proud of your progress today."', '"ዛሬ ባሳየኸው እድገት በጣም እኮራለሁ።"'), label: t('SEND ENCOURAGEMENT', 'ማበረታቻ ላክ') },
                { type: 'calm', icon: Shield, bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-300', subtext: 'text-green-600 dark:text-green-400', quote: t('"Take a deep breath. You are safe and loved."', '"ጥልቅ ትንፋሽ ውሰድ። ደህና ነህ እና ተወዳጅ ነህ።"'), label: t('SEND CALM', 'መረጋጋት ላክ') },
                { type: 'faith', icon: Star, bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-300', subtext: 'text-yellow-600 dark:text-yellow-400', quote: t('"I am praying for your peace this evening."', '"ለሰላምህ ዛሬ ማታ እጸልያለሁ።"'), label: t('SEND FAITH SUPPORT', 'የእምነት ድጋፍ ላክ') },
              ].map(({ type, icon: Icon, bg, border, text, subtext, quote, label }) => {
                const count = encouragementCounts[type] || 0
                return (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendEncouragement(type)}
                    disabled={sending !== null}
                    className={`${bg} ${border} rounded-xl p-6 text-center hover:shadow-md transition-all disabled:opacity-50 border relative`}
                  >
                    <Icon className={`w-6 h-6 ${text} mx-auto mb-2`} />
                    <p className={`text-sm ${text} italic mb-3`}>{quote}</p>
                    <span className={`text-xs font-semibold ${subtext}`}>
                      {sending === type ? t('Sent!', 'ተልኳል!') : label}
                    </span>
                    {count > 0 && (
                      <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${text.replace('text-', 'bg-').replace('800', '200').replace('300', '200')} text-[10px] font-bold flex items-center justify-center border ${border}`}>
                        {count}
                      </span>
                    )}
                    {sending === type && (
                      <div className="mt-2">
                        <div className="w-full bg-surface-container-high rounded-full h-1 overflow-hidden">
                          <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: 0 }}
                            transition={{ duration: 1.5, ease: 'linear' }}
                            className="h-full bg-current rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Sent History Feed */}
            {sentHistory.length > 0 && (
              <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 mt-6">
                <h3 className="font-semibold text-on-surface mb-3 text-sm flex items-center gap-2">
                  <Heart size={14} className="text-error" />
                  {t('Recent Encouragement Sent', 'የቅርብ ጊዜ ማበረታቻ ተልኳል')}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {sentHistory.slice(0, 10).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between text-sm bg-surface-container-low rounded-lg px-4 py-2.5"
                    >
                      <span className="text-on-surface">{item.message}</span>
                      <span className="text-xs text-on-surface-variant">{item.time}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Recent Activity - 2 cols */}
          <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="md:col-span-2">
            <h3 className="font-semibold text-on-surface mb-4 text-sm flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              {t('Recent Activity', 'የቅርብ ጊዜ እንቅስቃሴ')}
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5">
              {data.recent_alerts.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_alerts.map((alert, i) => {
                    const Icon = getAlertIcon(alert.type)
                    const color = getAlertColor(alert.type)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface font-medium truncate">
                            {alert.type === 'panic_alert' ? t('Panic event', 'የአስቸኳይ ክስተት') :
                             alert.type === 'milestone' ? t('Milestone reached', 'ምዕራፍ ላይ ደርሰዋል') :
                             t('Alert', 'ማስጠንቀቂያ')}
                          </p>
                          <p className="text-xs text-on-surface-variant">{formatRelativeDate(alert.date)}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <Shield size={20} className="text-green-500" />
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    {t('No recent alerts.', 'ምንም የቅርብ ጊዜ ማስጠንቀቂያ የለም።')}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {t('{alias} is doing well.', '{alias} ጥሩ እየሰሩ ነው።').replace('{alias}', data.alias)}
                  </p>
                </div>
              )}

              {/* Last Panic Event */}
              {data.last_panic_event_date && (
                <div className="mt-4 pt-4 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <AlertTriangle size={12} />
                    <span>
                      {t('Last panic event:', 'የመጨረሻው የአስቸኳይ ክስተት:')} {formatRelativeDate(data.last_panic_event_date)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Learning Resources + Support Impact */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* LEFT: Learning + Weekly Summary */}
          <motion.div {...fadeUp} transition={{ delay: 0.45 }}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6 mb-6">
              <h3 className="font-semibold text-on-surface mb-3">
                {t('Learning to Support', 'ለመደገፍ መማር')}
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                  <p className="text-sm font-medium text-on-surface">{t('Understanding Khat Recovery', 'የቃት ማገገምን መረዳት')}</p>
                  <p className="text-xs text-on-surface-variant">{t('5-min guide', 'የ5 ደቂቃ መመሪያ')}</p>
                </button>
                <button className="w-full text-left p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                  <p className="text-sm font-medium text-on-surface">{t('Guardian Support Group', 'የአሳዳጊ ድጋፍ ቡድን')}</p>
                  <p className="text-xs text-on-surface-variant">{t('Weekly sessions', 'ሳምንታዊ ክፍለ ጊዜዎች')}</p>
                </button>
                <button className="w-full text-left p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                  <p className="text-sm font-medium text-on-surface">{t('How to Talk About Relapse', 'ስለ መልሶ መውደቅ እንዴት መነጋገር እንደሚቻል')}</p>
                  <p className="text-xs text-on-surface-variant">{t('Compassionate communication', 'ርህሩህ ግንኙነት')}</p>
                </button>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6">
              <h3 className="font-semibold text-on-surface mb-3 flex items-center gap-2">
                <Calendar size={14} className="text-primary" />
                {t('Weekly Summary', 'ሳምንታዊ ማጠቃለያ')}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-surface-container-low rounded-lg">
                  <p className="text-xs text-on-surface-variant">{t('Days Since Panic', 'ከድንጋጤ ቀናት')}</p>
                  <p className="text-xl font-bold text-green-600 font-mono">
                    {data.last_panic_event_date
                      ? Math.floor((Date.now() - new Date(data.last_panic_event_date).getTime()) / (1000 * 60 * 60 * 24))
                      : '—'}
                  </p>
                </div>
                <div className="text-center p-3 bg-surface-container-low rounded-lg">
                  <p className="text-xs text-on-surface-variant">{t('Encouragement Sent', 'ማበረታቻ ተልኳል')}</p>
                  <p className="text-xl font-bold text-primary font-mono">{sentHistory.length}</p>
                </div>
                <div className="text-center p-3 bg-surface-container-low rounded-lg">
                  <p className="text-xs text-on-surface-variant">{t('Goal Progress', 'የግብ እድገት')}</p>
                  <p className="text-xl font-bold text-amber-600 font-mono">
                    {data.longest_streak > 0 ? `${Math.round((data.current_streak / data.longest_streak) * 100)}%` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Quote + Support Impact */}
          <motion.div {...fadeUp} transition={{ delay: 0.55 }}>
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-6 mb-6">
              <div>
                <p className="text-lg italic text-primary mb-2 font-serif">
                  &ldquo;{t('The greatest gift you can give is your quiet presence.', 'ልትሰጠው የምትችለው ታላቁ ስጦታ ዝምታህ ነው።')}&rdquo;
                </p>
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Heart size={14} />
                  <span>{t('Your support matters more than you know', 'ድጋፍህ ከምታስበው በላይ ጠቃሚ ነው')}</span>
                </div>
              </div>
            </div>

            {/* Your Support Impact */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6">
              <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
                <Star size={14} className="text-amber-500" />
                {t('Your Support Impact', 'የእርስዎ ድጋፍ ተጽእኖ')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-surface-container-low rounded-lg p-3">
                  <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                    <Heart size={16} className="text-pink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {t('You\'ve sent {N} encouragements', '{N} ማበረታቻዎችን ልከዋል').replace('{N}', String(sentHistory.length))}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {sentHistory.length === 0
                        ? t('Send your first encouragement today', 'የመጀመሪያ ማበረታቻህን ዛሬ ላክ')
                        : t('Keep supporting consistently', 'በቋሚነት መደገፍህን ቀጥል')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-surface-container-low rounded-lg p-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {t('Current streak: {N} days', 'አሁን ያለው ተከታታይ: {N} ቀናት').replace('{N}', String(data.current_streak))}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {t('Longest streak', 'ረጅሙ ተከታታይ')}: {data.longest_streak}d
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-outline-variant/30 pt-8 pb-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-on-surface-variant">
              <span>© 2024 SafeGround</span>
              <span>{t('Privacy Policy', 'የግላዊነት ፖሊሲ')}</span>
              <span>{t('Terms', 'ውሎች')}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 bg-surface-container-low text-on-surface-variant border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5">
                <FileDown size={13} />
                {t('Download Weekly Report', 'ሳምንታዊ ሪፖርት አውርድ')}
              </button>
              <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:brightness-110 transition-all">
                {t('Emergency Support', 'የአስቸኳይ ድጋፍ')}
              </button>
              <Shield size={16} className="text-on-surface-variant" />
              <Lock size={16} className="text-on-surface-variant" />
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
