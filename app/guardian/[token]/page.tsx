'use client'

import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, Lock, ChevronLeft } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts'
import type { GuardianViewData } from '@/lib/types'

export default function GuardianViewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<GuardianViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [token])

  async function fetchData() {
    try {
      const res = await fetch(`/api/guardian/view/${token}`)
      if (!res.ok) { setError(true); return }
      setData(await res.json())
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
            <p className="text-8xl font-bold text-primary">{data.current_streak}</p>
            <p className="text-lg text-on-surface-variant mt-2">Days of Strength</p>
            <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-semibold">
              ✓ Safety Plan Active
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
              <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-semibold">
                {data.last_7_days_mood.some(d => d.mood > 5) ? 'IMPROVING' : 'STEADY'}
              </span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.last_7_days_mood}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="mood" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-on-surface-variant text-center mt-2">
              High points indicate times of calm and connection.
            </p>
          </motion.div>
        </div>

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
              { type: 'encourage', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-800 dark:text-pink-300', subtext: 'text-pink-600 dark:text-pink-400', quote: '"I am so proud of your progress today."', label: 'SEND TAP TO ENCOURAGE' },
              { type: 'calm', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-300', subtext: 'text-green-600 dark:text-green-400', quote: '"Take a deep breath. You are safe and loved."', label: 'SEND TAP TO CALM' },
              { type: 'faith', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-300', subtext: 'text-yellow-600 dark:text-yellow-400', quote: '"I am praying for your peace this evening."', label: 'SEND FAITH SUPPORT' },
            ].map(({ type, bg, border, text, subtext, quote, label }) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendEncouragement(type)}
                disabled={sending !== null}
                className={`${bg} ${border} rounded-xl p-6 text-center hover:shadow-md transition-all disabled:opacity-50 border`}
              >
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/5 rounded-2xl border border-primary/20 p-6 flex items-center"
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
