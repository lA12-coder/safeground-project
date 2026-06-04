'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface SeedButton {
  label: string
  type: string
  color: string
}

const seedButtons: SeedButton[] = [
  { label: '✅ Seed Auth Users (Admin/Student/Provider)', type: 'auth', color: 'bg-amber-700 hover:bg-amber-800' },
  { label: 'Seed Demo Users (25)', type: 'users', color: 'bg-primary hover:bg-primary/90' },
  { label: 'Seed 60-Day Habit Logs', type: 'logs', color: 'bg-green-700 hover:bg-green-800' },
  { label: 'Seed Provider Directory', type: 'providers', color: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'Seed Chat Messages', type: 'chat', color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Seed Guardian Links', type: 'guardians', color: 'bg-teal-600 hover:bg-teal-700' },
  { label: 'Seed Telehealth Bookings', type: 'bookings', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { label: 'Reset Demo Account', type: 'demo', color: 'bg-primary hover:bg-primary/90' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
    </motion.div>
  )
}

export default function AdminSeedPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics')
      if (res.ok) {
        const data = await res.json()
        setStats({
          users: data.total_users,
          panic: data.panic_today,
          streaks: data.active_streaks,
          flagged: data.flagged_messages,
          queue: data.provider_queue,
        })
      }
    } catch {}
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  async function handleSeed(type: string) {
    setLoading(type)
    setResults(prev => ({ ...prev, [type]: 'Processing...' }))

    try {
      const res = await fetch(`/api/admin/seed?type=${type}`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        const msg = data.message || data.users
          ? `${data.users || ''}${data.logs ? `, ${data.logs} logs` : ''}${data.providers ? `, ${data.providers} providers` : ''}${data.messages ? `, ${data.messages} messages` : ''}${data.guardians ? `, ${data.guardians} guardians` : ''}${data.bookings ? `, ${data.bookings} bookings` : ''}`
          : 'Success!'
        setResults(prev => ({ ...prev, [type]: `✅ ${msg}` }))
        setToast({ message: `${type} seeded successfully`, type: 'success' })
        fetchStats()
      } else {
        setResults(prev => ({ ...prev, [type]: `❌ ${data.error || 'Failed'}` }))
        setToast({ message: `Failed: ${data.error || 'Unknown error'}`, type: 'error' })
      }
    } catch {
      setResults(prev => ({ ...prev, [type]: '❌ Network error' }))
      setToast({ message: 'Network error', type: 'error' })
    } finally {
      setLoading(null)
    }
  }

  async function handleClearAll() {
    setLoading('clear')
    try {
      const res = await fetch('/api/admin/seed?type=clear', { method: 'POST' })
      if (res.ok) {
        setToast({ message: 'All data cleared', type: 'success' })
        setStats({})
        fetchStats()
      } else {
        setToast({ message: 'Failed to clear data', type: 'error' })
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' })
    } finally {
      setLoading(null)
      setShowClearConfirm(false)
    }
  }

  const handleSeedAll = async () => {
    for (const btn of seedButtons) {
      await handleSeed(btn.type)
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={28} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Seed Data Panel</h1>
            <p className="text-on-surface-variant mt-1">Generate demo data for presentations and testing</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchStats}
            disabled={loading !== null}
            className="px-5 py-2 bg-surface-container-highest text-on-surface rounded-lg text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {loading ? 'Running...' : 'Refresh Stats'}
          </motion.button>
        </div>
      </div>

      {/* Current Stats */}
      {Object.keys(stats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 text-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant/30 shadow-sm px-5 py-3 rounded-xl"
        >
          <span><strong className="text-on-surface">{stats.users}</strong> users</span>
          <span className="text-on-surface-variant/40">|</span>
          <span><strong className="text-on-surface">{stats.streaks}</strong> active streaks</span>
          <span className="text-on-surface-variant/40">|</span>
          <span><strong className="text-primary">{stats.queue}</strong> pending providers</span>
          <span className="text-on-surface-variant/40">|</span>
          <span><strong className="text-red-700">{stats.flagged}</strong> flagged messages</span>
          <span className="text-on-surface-variant/40">|</span>
          <span><strong className="text-red-700">{stats.panic}</strong> panic today</span>
        </motion.div>
      )}

      {/* Seed Button Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {seedButtons.map(({ label, type, color }) => (
          <motion.button
            key={type}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSeed(type)}
            disabled={loading !== null}
            className={`${color} text-white rounded-xl py-4 px-6 font-semibold text-sm disabled:opacity-50 transition-all hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span>{label}</span>
              {loading === type && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {results[type] && (
              <div className="mt-2 text-xs text-white/80 truncate">{results[type]}</div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Reset Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-primary">Demo Account</h3>
            <p className="text-sm text-primary/70 mt-0.5">
              Biruk-Eagle-28 · 28-day streak · Guardian linked · Booking tomorrow 10AM
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSeed('demo')}
            disabled={loading !== null}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {loading === 'demo' ? 'Resetting...' : 'Reset Demo Account'}
          </motion.button>
        </div>
        {results['demo'] && (
          <p className="text-xs text-primary mt-2">{results['demo']}</p>
        )}
      </motion.div>

      {/* Seed All button moved here */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSeedAll}
        disabled={loading !== null}
        className="w-full py-4 bg-surface-container-highest text-on-surface rounded-xl font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
            Running...
          </>
        ) : (
          'Seed All Data'
        )}
      </motion.button>

      {/* Clear All Data */}
      <div className="border-t border-outline-variant/30 pt-6">
        {!showClearConfirm ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-700 text-white rounded-xl font-semibold hover:bg-red-800 transition-all"
          >
            <AlertTriangle size={18} />
            ⚠ CLEAR ALL DATA
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <AlertTriangle size={20} />
              Are you sure? This will delete ALL data in the database.
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClearAll}
                disabled={loading === 'clear'}
                className="px-6 py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 disabled:opacity-50 transition-all"
              >
                {loading === 'clear' ? 'Clearing...' : 'Yes, Delete Everything'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowClearConfirm(false)}
                className="px-6 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg font-semibold hover:bg-surface-container-low transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
