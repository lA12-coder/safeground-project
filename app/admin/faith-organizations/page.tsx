'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, XCircle, Church, Phone, Mail, MapPin, Calendar, FileText, BadgeCheck, Tags, Clock, ArrowUpRight } from 'lucide-react'

const faithColors: Record<string, string> = {
  orthodox: 'bg-amber-100 text-amber-700 border-amber-200',
  protestant: 'bg-blue-100 text-blue-700 border-blue-200',
  muslim: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  traditional: 'bg-purple-100 text-purple-700 border-purple-200',
}

const faithLabels: Record<string, string> = {
  orthodox: 'Orthodox',
  protestant: 'Protestant',
  muslim: 'Muslim',
  traditional: 'Traditional',
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

type FaithOrg = {
  id: string
  org_name: string
  faith_tradition: string
  rep_name: string
  rep_phone: string
  rep_email: string
  program_name: string
  description: string
  recovery_activities: string[]
  weekly_structure: string
  city: string
  region: string
  verification_docs: string[]
  is_verified: boolean
  is_active: boolean
  created_at: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
}

export default function FaithOrganizationsPage() {
  const [organizations, setOrganizations] = useState<FaithOrg[]>([])
  const [selected, setSelected] = useState<FaithOrg | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'verified' | 'all'>('pending')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')

  async function fetchOrgs() {
    setLoading(true)
    try {
      const types = 'religious_org,religious_individual'
      const status = tab === 'pending' ? 'pending' : tab === 'verified' ? 'verified' : 'all'
      const res = await fetch(`/api/admin/providers?status=${status}&type=${types}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        const mapped: FaithOrg[] = (data.providers || []).map((p: any) => ({
          id: p.id,
          org_name: p.org_name || p.name || 'Unknown',
          faith_tradition: (p.faith_category || 'orthodox').toLowerCase(),
          rep_name: p.name || 'Unknown',
          rep_phone: p.phone || '',
          rep_email: p.email || '',
          program_name: p.programs?.[0] || 'Recovery Program',
          description: p.bio || p.description || '',
          recovery_activities: p.specialization ? [p.specialization] : [],
          weekly_structure: '',
          city: p.city || '',
          region: p.region || '',
          verification_docs: [],
          is_verified: p.is_verified || false,
          is_active: p.is_active ?? true,
          created_at: p.created_at || new Date().toISOString(),
        }))
        setOrganizations(mapped)
        const firstPending = mapped.find(o => !o.is_verified)
        if (firstPending && !selected) setSelected(firstPending)
      }
    } catch (e) {
      console.error('Failed to fetch faith organizations:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrgs() }, [tab])

  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/providers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      })
      if (res.ok) {
        setOrganizations(prev => prev.map(o => o.id === id ? { ...o, is_verified: true } : o))
        setSelected(prev => prev?.id === id ? { ...prev, is_verified: true } : prev)
        setToast({ message: 'Faith organization verified', type: 'success' })
      }
    } catch {
      setToast({ message: 'Failed to verify', type: 'error' })
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
        setOrganizations(prev => {
          const remaining = prev.filter(o => o.id !== id)
          if (selected?.id === id) {
            setSelected(remaining[0] ?? null)
          }
          return remaining
        })
        setToast({ message: 'Faith organization rejected', type: 'error' })
      }
    } catch {
      setToast({ message: 'Failed to reject', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = organizations.filter(o => {
    if (tab === 'pending' && o.is_verified) return false
    if (tab === 'verified' && !o.is_verified) return false
    if (!search) return true
    const q = search.toLowerCase()
    return o.org_name.toLowerCase().includes(q) ||
      o.rep_name.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.faith_tradition.toLowerCase().includes(q)
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[#2c241f]">Faith Organizations</h1>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-amber-100 px-4 py-1.5 font-bold text-amber-800 text-sm"
          >
            {organizations.filter(o => !o.is_verified).length} Pending
          </motion.span>
        </div>
        <label className="flex w-72 items-center gap-3 rounded-full bg-[#f5f5f4] px-5 py-2.5 text-[#64748B]">
          <Search size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </label>
      </header>

      <div className="inline-flex rounded-2xl bg-[#e7e5e4] p-1">
        {(['all', 'pending', 'verified'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch('') }}
            className={`min-w-28 rounded-xl px-6 py-2.5 font-bold text-sm transition-colors ${
              tab === t
                ? 'bg-[#92f5a4] text-[#007233] shadow-sm'
                : 'text-[#64748B] hover:text-[#1c1917]'
            }`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'pending' && ` (${organizations.filter(o => !o.is_verified).length})`}
            {t === 'verified' && ` (${organizations.filter(o => o.is_verified).length})`}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_28rem]">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e0db]/30 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#e7e5e4]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#e7e5e4] rounded w-1/3" />
                    <div className="h-3 bg-[#e7e5e4] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#64748B]">
              {search ? 'No organizations match your search' : 'No organizations in this category'}
            </div>
          ) : (
            filtered.map(o => (
              <motion.button
                key={o.id}
                variants={itemVariants}
                onClick={() => setSelected(o)}
                className={`w-full text-left bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
                  selected?.id === o.id
                    ? 'border-[#92400E] ring-1 ring-[#92400E]/20'
                    : 'border-[#e5e0db]/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fdf6ed] text-lg font-bold text-[#92400E] shrink-0">
                    <Church size={20} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-[#2c241f] truncate">{o.org_name}</strong>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${faithColors[o.faith_tradition] || ''}`}>
                        {faithLabels[o.faith_tradition] || o.faith_tradition}
                      </span>
                      {o.is_verified && (
                        <BadgeCheck size={14} className="text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-[#64748B] mt-0.5">
                      {o.city}, {o.region} &middot; {o.rep_name}
                    </p>
                  </div>
                  <ArrowUpRight size={18} className="text-[#64748B] shrink-0" />
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
              className="bg-white rounded-xl border border-[#e5e0db]/30 overflow-hidden sticky top-6"
            >
              <div className="bg-[#f5f5f4] p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fdf6ed] text-2xl font-bold text-[#92400E]"
                    >
                      <Church size={28} />
                    </motion.span>
                    <div>
                      <h2 className="text-2xl font-bold text-[#2c241f]">{selected.org_name}</h2>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${faithColors[selected.faith_tradition] || ''}`}>
                          {faithLabels[selected.faith_tradition] || selected.faith_tradition}
                        </span>
                        <span className="text-xs text-[#64748B]">{selected.city}, {selected.region}</span>
                        {selected.is_verified && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-2">Program</h3>
                  <p className="font-medium text-[#2c241f]">{selected.program_name}</p>
                  <p className="text-sm text-[#64748B] mt-1 leading-relaxed">{selected.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[#64748B] block flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Representative</span>
                    <span className="font-medium text-[#2c241f]">{selected.rep_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#64748B] block flex items-center gap-1"><Phone size={12} /> Phone</span>
                    <span className="font-medium text-[#2c241f]">{selected.rep_phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[#64748B] block flex items-center gap-1"><Mail size={12} /> Email</span>
                    <span className="font-medium text-[#2c241f]">{selected.rep_email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#64748B] block flex items-center gap-1"><MapPin size={12} /> Location</span>
                    <span className="font-medium text-[#2c241f]">{selected.city}, {selected.region}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#64748B] block flex items-center gap-1"><Calendar size={12} /> Submitted</span>
                    <span className="font-medium text-[#2c241f]">{new Date(selected.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {selected.recovery_activities.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-2 flex items-center gap-1">
                      <Tags size={12} /> Activities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.recovery_activities.map(a => (
                        <span key={a} className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.weekly_structure && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-2 flex items-center gap-1">
                      <Clock size={12} /> Weekly Structure
                    </h3>
                    <p className="text-sm text-[#1c1917] whitespace-pre-line leading-relaxed bg-[#f5f5f4] rounded-lg p-3">
                      {selected.weekly_structure}
                    </p>
                  </div>
                )}

                {selected.verification_docs.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-2 flex items-center gap-1">
                      <FileText size={12} /> Documents
                    </h3>
                    <div className="space-y-1">
                      {selected.verification_docs.map(doc => (
                        <div key={doc} className="flex items-center gap-2 text-sm text-[#92400E]">
                          <FileText size={14} />
                          {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!selected.is_verified && (
                <div className="p-6 pt-0 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApprove(selected.id)}
                    disabled={actionLoading === selected.id}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-6 py-3.5 font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    <BadgeCheck size={18} />
                    {actionLoading === selected.id ? 'Processing...' : 'Approve'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReject(selected.id)}
                    disabled={actionLoading === selected.id}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 px-6 py-3.5 font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
                  >
                    <XCircle size={18} />
                    Reject
                  </motion.button>
                </div>
              )}
              {selected.is_verified && (
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                    <CheckCircle size={16} />
                    Verified
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
