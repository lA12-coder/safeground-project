'use client'

import { useEffect, useState, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Shield, Lock, ChevronLeft, Sparkles, Trophy, Award, Star, TrendingUp } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis, AreaChart, Area } from 'recharts'
import type { GuardianViewData } from '@/lib/types'

const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365]

const encouragementHistory = [
  { type: 'encourage', message: 'I sent a word of encouragement', time: '2h ago' },
  { type: 'calm', message: 'I sent a calming thought', time: '1d ago' },
  { type: 'faith', message: 'I sent faith support', time: '3d ago' },
]

export default function GuardianViewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<GuardianViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [sentHistory, setSentHistory] = useState<typeof encouragementHistory>([])
  const [showCelebration, setShowCelebration] = useState(false)

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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
          </div>
          <div className="flex items-center gap-4">
            <select className="text-sm border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-low text-on-surface">
              <option>English</option>
              <option>አማርኛ</option>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-on-surface mb-2">
            Supporting <span className="text-primary">{data.alias}</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            Your presence is their strength. Today, they are choosing recovery one step at a time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 text-center"
          >
            <motion.p
              animate={showCelebration ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: showCelebration ? Infinity : 0, duration: 2 }}
              className="text-8xl font-bold text-primary"
            >
              {data.current_streak}
            </motion.p>
            <p className="text-lg text-on-surface-variant mt-2">Days of Strength</p>
            <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold">
              ✓ Safety Plan Active
            </div>
            {/* Mini milestone progress */}
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                <span>Progress to next milestone</span>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface">7-Day Mood Flow</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  data.last_7_days_mood.some(d => d.mood > 5)
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {data.last_7_days_mood.some(d => d.mood > 5) ? 'IMPROVING' : 'STEADY'}
                  <TrendingUp size={11} />
                </span>
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
            <p className="text-xs text-on-surface-variant text-center mt-2">
              High points indicate times of calm and connection.
            </p>
          </motion.div>
        </div>

        {/* Encouragement History Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          {sentHistory.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 mb-8">
              <h3 className="font-semibold text-on-surface mb-3 text-sm flex items-center gap-2">
                <Heart size={14} className="text-error" />
                Recent Encouragement Sent
              </h3>
              <div className="space-y-2">
                {sentHistory.slice(0, 5).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between text-sm bg-surface-container-low rounded-lg px-4 py-2.5"
                  >
                    <span className="text-on-surface">{item.message}</span>
                    <span className="text-xs text-on-surface-variant">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-on-surface text-center mb-6">
            Send Encouragement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'encourage', icon: Heart, bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-800 dark:text-pink-300', subtext: 'text-pink-600 dark:text-pink-400', quote: '"I am so proud of your progress today."', label: 'SEND ENCOURAGEMENT' },
              { type: 'calm', icon: Shield, bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-300', subtext: 'text-green-600 dark:text-green-400', quote: '"Take a deep breath. You are safe and loved."', label: 'SEND CALM' },
              { type: 'faith', icon: Star, bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-300', subtext: 'text-yellow-600 dark:text-yellow-400', quote: '"I am praying for your peace this evening."', label: 'SEND FAITH SUPPORT' },
            ].map(({ type, icon: Icon, bg, border, text, subtext, quote, label }) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendEncouragement(type)}
                disabled={sending !== null}
                className={`${bg} ${border} rounded-xl p-6 text-center hover:shadow-md transition-all disabled:opacity-50 border`}
              >
                <Icon className={`w-6 h-6 ${text} mx-auto mb-2`} />
                <p className={`text-sm ${text} italic mb-3`}>{quote}</p>
                <span className={`text-xs font-semibold ${subtext}`}>
                  {sending === type ? 'Sent!' : label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6"
          >
            <h3 className="font-semibold text-on-surface mb-3">Learning to Support</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                <p className="text-sm font-medium text-on-surface">Understanding Khat Recovery</p>
                <p className="text-xs text-on-surface-variant">5-min guide</p>
              </button>
              <button className="w-full text-left p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                <p className="text-sm font-medium text-on-surface">Guardian Support Group</p>
                <p className="text-xs text-on-surface-variant">Weekly sessions</p>
              </button>
              <button className="w-full text-left p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
                <p className="text-sm font-medium text-on-surface">How to Talk About Relapse</p>
                <p className="text-xs text-on-surface-variant">Compassionate communication</p>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-6 flex items-center"
          >
            <div>
              <p className="text-lg italic text-primary mb-2">
                &ldquo;The greatest gift you can give is your quiet presence.&rdquo;
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <Heart size={14} />
                <span>Your support matters more than you know</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border-t border-outline-variant/30 pt-8 pb-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-on-surface-variant">
              <span>© 2024 SafeGround</span>
              <span>Privacy Policy</span>
              <span>Terms</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:brightness-110 transition-all">
                Emergency Support
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
