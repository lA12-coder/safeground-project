'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldOff, Bell, BellOff, User, Heart, Activity, Eye, RefreshCw, CheckCircle, XCircle, BarChart3, Users, ToggleLeft, ToggleRight, FileText } from 'lucide-react'
import type { GuardianControl, GuardianMetrics } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
    </motion.div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const monitoringColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
}

const relationshipColors: Record<string, string> = {
  parent: 'bg-blue-100 text-blue-700',
  sibling: 'bg-purple-100 text-purple-700',
  spouse: 'bg-pink-100 text-pink-700',
  friend: 'bg-green-100 text-green-700',
  counselor: 'bg-amber-100 text-amber-700',
  religious: 'bg-indigo-100 text-indigo-700',
}

export default function AdminGuardiansPage() {
  const [guardians, setGuardians] = useState<GuardianControl[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { fetchGuardians() }, [])

  async function fetchGuardians() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('guardian_controls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setGuardians(data || [])
    } catch (e) {
      console.error('Failed to fetch guardians:', e)
    } finally {
      setLoading(false)
    }
  }

  function toggleActive(id: string) {
    setGuardians(prev => prev.map(g => g.id === id ? { ...g, is_active: !g.is_active } : g))
    setToast({ message: 'Guardian link status updated', type: 'success' })
  }

  function toggleNotifyPanic(id: string) {
    setGuardians(prev => prev.map(g => g.id === id ? { ...g, notify_on_panic: !g.notify_on_panic } : g))
  }

  function toggleNotifyRelapse(id: string) {
    setGuardians(prev => prev.map(g => g.id === id ? { ...g, notify_on_relapse: !g.notify_on_relapse } : g))
  }

  const activeGuardians = guardians.filter(g => g.is_active)
  const metrics: GuardianMetrics = {
    active_links: activeGuardians.length,
    guardian_types: Object.entries(
      guardians.reduce((acc, g) => {
        const r = g.relationship || 'other'
        acc[r] = (acc[r] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([type, count]) => ({ type, count })),
    monitoring_levels: Object.entries(
      guardians.reduce((acc, g) => {
        const l = g.monitoring_level || 'medium'
        acc[l] = (acc[l] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([level, count]) => ({ level, count })),
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header>
        <h1 className="text-3xl font-bold text-primary">Guardian Management</h1>
        <p className="text-on-surface-variant mt-1">Monitor and manage guardian-link connections</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-on-surface-variant">Active Links</p>
              <p className="text-2xl font-bold text-on-surface">{metrics.active_links}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-100 text-green-700"><Shield size={20} /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-on-surface-variant">Total Links</p>
              <p className="text-2xl font-bold text-on-surface">{guardians.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><Users size={20} /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-on-surface-variant">High Monitoring</p>
              <p className="text-2xl font-bold text-on-surface">{metrics.monitoring_levels.find(l => l.level === 'high')?.count || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><Activity size={20} /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-on-surface-variant">Relationships</p>
              <p className="text-2xl font-bold text-on-surface">{metrics.guardian_types.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><Heart size={20} /></div>
          </div>
        </motion.div>
      </div>

      {metrics.monitoring_levels.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
          <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-3 flex items-center gap-1">
            <BarChart3 size={14} /> Monitoring Level Distribution
          </h3>
          <div className="flex gap-4">
            {metrics.monitoring_levels.map(l => {
              const total = metrics.monitoring_levels.reduce((a, b) => a + b.count, 0)
              const pct = total > 0 ? Math.round((l.count / total) * 100) : 0
              return (
                <div key={l.level} className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-on-surface font-medium">{l.level}</span>
                    <span className="text-on-surface-variant">{l.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${l.level === 'high' ? 'bg-error' : l.level === 'medium' ? 'bg-amber-500' : 'bg-secondary'}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-high rounded w-1/3" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : guardians.length === 0 ? (
        <div className="text-center py-16">
          <ShieldOff size={48} className="mx-auto text-on-surface-variant/40 mb-4" />
          <p className="text-on-surface-variant text-lg">No guardian links found</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {guardians.map(g => (
            <motion.div key={g.id} variants={itemVariants}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-sm font-bold text-primary shrink-0">
                    {g.guardian_alias?.charAt(0).toUpperCase() || 'G'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-on-surface">{g.guardian_alias || 'Unnamed Guardian'}</strong>
                      {g.relationship && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${relationshipColors[g.relationship] || 'bg-gray-100 text-gray-600'}`}>
                          {g.relationship}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${monitoringColors[g.monitoring_level] || 'bg-gray-100 text-gray-600'}`}>
                        {g.monitoring_level?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {g.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><User size={11} /> User: {g.user_id?.slice(0, 8)}...</span>
                      {g.last_accessed_at && <span>Last access: {timeAgo(g.last_accessed_at)}</span>}
                      <span>Created: {new Date(g.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleNotifyPanic(g.id)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      g.notify_on_panic ? 'bg-red-100 text-red-700' : 'bg-surface-container-low text-on-surface-variant'
                    }`}
                    title={g.notify_on_panic ? 'Panic notifications ON' : 'Panic notifications OFF'}>
                    {g.notify_on_panic ? <Bell size={14} /> : <BellOff size={14} />}
                    Panic
                  </button>
                  <button onClick={() => toggleNotifyRelapse(g.id)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      g.notify_on_relapse ? 'bg-amber-100 text-amber-700' : 'bg-surface-container-low text-on-surface-variant'
                    }`}
                    title={g.notify_on_relapse ? 'Relapse notifications ON' : 'Relapse notifications OFF'}>
                    {g.notify_on_relapse ? <Bell size={14} /> : <BellOff size={14} />}
                    Relapse
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-all">
                    <Eye size={14} /> Reports
                  </button>
                  <button onClick={() => toggleActive(g.id)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      g.is_active
                        ? 'border border-error/30 text-error hover:bg-error/5'
                        : 'bg-secondary text-on-secondary hover:brightness-110'
                    }`}>
                    {g.is_active ? <ShieldOff size={14} /> : <Shield size={14} />}
                    {g.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
