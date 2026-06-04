'use client'

import { useState, useEffect, useCallback } from 'react'
import { Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface SeedButton {
  label: string
  type: string
  color: string
  icon?: string
}

const seedButtons: SeedButton[] = [
  { label: 'Seed Demo Users (25)', type: 'users', color: 'bg-[#92400E] hover:bg-[#78350F]' },
  { label: 'Seed 60-Day Habit Logs', type: 'logs', color: 'bg-[#166534] hover:bg-green-700' },
  { label: 'Seed Provider Directory', type: 'providers', color: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'Seed Chat Messages', type: 'chat', color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Seed Guardian Links', type: 'guardians', color: 'bg-teal-600 hover:bg-teal-700' },
  { label: 'Seed Telehealth Bookings', type: 'bookings', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { label: 'Reset Demo Account', type: 'demo', color: 'bg-[#92400E] hover:bg-[#78350F]' },
]

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={28} className="text-[#92400E]" />
          <div>
            <h1 className="text-3xl font-bold text-[#92400E]">Seed Data Panel</h1>
            <p className="text-[#64748B] mt-1">Generate demo data for presentations and testing</p>
          </div>
        </div>
        <button
          onClick={handleSeedAll}
          disabled={loading !== null}
          className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Running...' : 'Seed All Data'}
        </button>
      </div>

      {/* Current Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="flex items-center gap-4 text-sm text-[#64748B] bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm px-5 py-3">
          <span><strong className="text-[#1c1917]">{stats.users}</strong> users</span>
          <span className="text-gray-300">|</span>
          <span><strong className="text-[#1c1917]">{stats.streaks}</strong> active streaks</span>
          <span className="text-gray-300">|</span>
          <span><strong className="text-[#92400E]">{stats.queue}</strong> pending providers</span>
          <span className="text-gray-300">|</span>
          <span><strong className="text-[#B91C1C]">{stats.flagged}</strong> flagged messages</span>
          <span className="text-gray-300">|</span>
          <span><strong className="text-[#B91C1C]">{stats.panic}</strong> panic today</span>
        </div>
      )}

      {/* Seed Button Grid */}
      <div className="grid grid-cols-2 gap-3">
        {seedButtons.map(({ label, type, color }) => (
          <button
            key={type}
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
          </button>
        ))}
      </div>

      {/* Reset Demo */}
      <div className="bg-[#92400E]/5 border border-[#92400E]/20 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#92400E]">Demo Account</h3>
            <p className="text-sm text-[#92400E]/70 mt-0.5">
              Biruk-Eagle-28 · 28-day streak · Guardian linked · Booking tomorrow 10AM
            </p>
          </div>
          <button
            onClick={() => handleSeed('demo')}
            disabled={loading !== null}
            className="px-5 py-2 bg-[#92400E] text-white rounded-lg text-sm font-semibold hover:bg-[#78350F] disabled:opacity-50 transition-colors"
          >
            {loading === 'demo' ? 'Resetting...' : 'Reset Demo Account'}
          </button>
        </div>
        {results['demo'] && (
          <p className="text-xs text-[#92400E] mt-2">{results['demo']}</p>
        )}
      </div>

      {/* Clear All Data */}
      <div className="border-t border-[#d6d3d1]/30 pt-6">
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#B91C1C] text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            <AlertTriangle size={18} />
            ⚠ CLEAR ALL DATA
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#B91C1C] font-semibold">
              <AlertTriangle size={20} />
              Are you sure? This will delete ALL data in the database.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                disabled={loading === 'clear'}
                className="px-6 py-2 bg-[#B91C1C] text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {loading === 'clear' ? 'Clearing...' : 'Yes, Delete Everything'}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
