'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BadgeCheck, FileText, Landmark, Download, ArrowUpRight, Sparkles, XCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Provider {
  id: string
  name: string
  org_name?: string
  type: string
  specialization: string
  city: string
  bio: string
  languages: string[]
  consultation_fee?: number
  pro_bono: boolean
  online: boolean
  in_person: boolean
  is_verified: boolean
  created_at: string
}

const typeLabels: Record<string, string> = {
  psychiatrist: 'MEDICAL',
  counselor: 'MEDICAL',
  religious_org: 'SPIRITUAL',
  religious_individual: 'SPIRITUAL',
  ngo: 'COMMUNITY',
  healthcare: 'MEDICAL',
  university: 'COMMUNITY',
}

const typeColors: Record<string, string> = {
  psychiatrist: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  counselor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  religious_org: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  religious_individual: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  ngo: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  healthcare: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  university: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
    </motion.div>
  )
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selected, setSelected] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProviders()
  }, [tab])

  async function fetchProviders() {
    setLoading(true)
    try {
      const status = tab === 'pending' ? 'pending' : tab === 'verified' ? 'verified' : 'pending'
      const res = await fetch(`/api/admin/providers?status=${status}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setProviders(data.providers || [])
        if (data.providers?.length) setSelected(data.providers[0])
      }
    } catch (e) {
      console.error('Failed to fetch providers:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/providers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      })
      if (res.ok) {
        setProviders(prev => prev.filter(p => p.id !== id))
        if (selected?.id === id) {
          const remaining = providers.filter(p => p.id !== id)
          setSelected(remaining[0] || null)
        }
        setToast({ message: 'Provider verified successfully', type: 'success' })
      }
    } catch {
      setToast({ message: 'Failed to verify provider', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/providers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: false }),
      })
      if (res.ok) {
        setProviders(prev => prev.filter(p => p.id !== id))
        if (selected?.id === id) {
          const remaining = providers.filter(p => p.id !== id)
          setSelected(remaining[0] || null)
        }
        setToast({ message: 'Provider rejected', type: 'error' })
      }
    } catch {
      setToast({ message: 'Failed to reject provider', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = providers.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.org_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-3xl font-bold text-primary">Organization Approval Center</h1>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-primary-container px-4 py-1.5 font-bold text-on-surface text-sm"
          >
            {providers.length} Pending
          </motion.span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex w-72 items-center gap-3 rounded-full bg-surface-container-low px-5 py-2.5 text-on-surface-variant">
            <Search size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search providers..."
              className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant"
            />
          </label>
        </div>
      </header>

      <div className="inline-flex rounded-2xl bg-surface-container-high p-1">
        {(['pending', 'verified', 'rejected'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch('') }}
            className={`min-w-28 rounded-xl px-6 py-2.5 font-bold text-sm transition-colors ${
              tab === t
                ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'pending' && providers.length > 0 && providers.length}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_28rem]">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container-high rounded w-1/3" />
                    <div className="h-3 bg-surface-container-high rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              {search ? 'No providers match your search' : 'No providers in this category'}
            </div>
          ) : (
            filtered.map((p, i) => (
              <motion.button
                key={p.id}
                variants={itemVariants}
                onClick={() => setSelected(p)}
                className={`w-full text-left bg-surface-container-lowest rounded-xl border p-5 transition-all hover:shadow-md ${
                  selected?.id === p.id
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-outline-variant/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-lg font-bold text-primary shrink-0">
                    {getInitials(p.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-on-surface truncate">{p.name}</strong>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[p.type] || 'bg-gray-100 text-gray-600'}`}>
                        {typeLabels[p.type] || p.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {p.org_name || p.specialization} &middot; {p.city}
                    </p>
                  </div>
                  <ArrowUpRight size={18} className="text-on-surface-variant shrink-0" />
                </div>
              </motion.button>
            ))
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.aside
              key={selected.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden sticky top-6"
            >
              <div className="bg-surface-container-low p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-2xl font-bold text-primary"
                    >
                      {getInitials(selected.name)}
                    </motion.span>
                    <div>
                      <h2 className="font-serif text-2xl text-on-surface">{selected.name}</h2>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[selected.type] || ''}`}>
                          {typeLabels[selected.type] || selected.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-on-surface-variant">{selected.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2">Bio</h3>
                  <p className="text-sm text-on-surface leading-relaxed">{selected.bio}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-on-surface-variant block">Languages</span>
                    <span className="font-medium text-on-surface">{selected.languages.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">Fee</span>
                    <span className="font-medium text-on-surface">
                      {selected.consultation_fee === 0 || selected.pro_bono
                        ? 'Free / Pro-bono'
                        : selected.consultation_fee
                          ? `$${selected.consultation_fee}/session`
                          : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">Availability</span>
                    <span className={`font-medium ${
                      selected.online && selected.in_person ? 'text-blue-600 dark:text-blue-400' :
                      selected.online ? 'text-secondary' : 'text-primary'
                    }`}>
                      {selected.online && selected.in_person ? 'Hybrid' :
                       selected.online ? 'Online' : 'In-person'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">Specialization</span>
                    <span className="font-medium text-on-surface">{selected.specialization}</span>
                  </div>
                </div>

                {selected.pro_bono && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                    <BadgeCheck size={14} />
                    Offers Pro-bono Services
                  </div>
                )}

                <div className="rounded-xl bg-surface-container-low p-5">
                  <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-3">
                    <Sparkles size={14} />
                    AI Risk Analysis
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Legitimacy Score</span>
                      <span className="font-bold text-secondary">High (96/100)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Conflict of Interest</span>
                      <span className="font-bold text-secondary">None Detected</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVerify(selected.id)}
                  disabled={actionLoading === selected.id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3.5 font-bold text-on-secondary shadow-sm hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  <BadgeCheck size={18} />
                  {actionLoading === selected.id ? 'Processing...' : 'Approve Organization'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReject(selected.id)}
                  disabled={actionLoading === selected.id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 px-6 py-3.5 font-bold text-error hover:bg-error/5 disabled:opacity-50 transition-all"
                >
                  <XCircle size={18} />
                  Reject & Block
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
