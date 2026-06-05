'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Handshake, Plus, X, Search, BadgeCheck, Globe, Phone,
  Building2, MapPin, CheckCircle, XCircle, ExternalLink,
} from 'lucide-react'

interface Partner {
  id: string
  name: string
  org_name?: string
  type: string
  specialization: string
  city: string
  region: string
  bio: string
  languages: string[]
  online: boolean
  in_person: boolean
  is_verified: boolean
  is_active: boolean
  phone: string
  created_at: string
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

export default function AdminPartnershipsPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'pending' | 'verified'>('all')
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({
    name: '', org_name: '', type: 'ngo', specialization: '',
    city: 'Addis Abeba', region: 'Ethiopia', bio: '',
    languages: 'English', phone: '', online: true, in_person: true,
  })

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/partners')
      if (res.ok) {
        const data = await res.json()
        setPartners(data.partners || [])
      }
    } catch (e) {
      console.error('Failed to fetch partners:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  async function handleReview(id: string, verified: boolean) {
    try {
      const res = await fetch(`/api/admin/providers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      })
      if (!res.ok) throw new Error('Review failed')
      setPartners(prev => prev.filter(partner => partner.id !== id))
      setToast({ message: verified ? 'Partner request approved' : 'Partner request rejected', type: 'success' })
    } catch {
      setToast({ message: 'Could not update partner request', type: 'error' })
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      if (res.ok) {
        setToast({ message: 'Partner added successfully', type: 'success' })
        setShowForm(false)
        setForm({ name: '', org_name: '', type: 'ngo', specialization: '', city: 'Addis Abeba', region: 'Ethiopia', bio: '', languages: 'English', phone: '', online: true, in_person: true })
        fetchPartners()
      } else {
        const data = await res.json()
        setToast({ message: data.error || 'Failed to add partner', type: 'error' })
      }
    } catch {
      setToast({ message: 'Failed to add partner', type: 'error' })
    }
  }

  const filtered = partners.filter(p => {
    const matchesStatus =
      status === 'all' ||
      (status === 'pending' && !p.is_verified) ||
      (status === 'verified' && p.is_verified)
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.org_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })
  const visibleCounts = {
    all: partners.length,
    pending: partners.filter(p => !p.is_verified).length,
    verified: partners.filter(p => p.is_verified).length,
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">Partnerships</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Manage partner organizations and collaborations.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:brightness-110 transition-all"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Partner'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAdd}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 space-y-4"
          >
            <h2 className="font-semibold text-on-surface flex items-center gap-2">
              <Handshake size={18} className="text-primary" />
              New Partnership
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Organization Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Display Name</label>
                <input value={form.org_name} onChange={e => setForm({ ...form, org_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25">
                  <option value="ngo">NGO</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="religious_org">Religious</option>
                  <option value="university">University</option>
                  <option value="community">Community</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Specialization</label>
                <input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">City</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Languages (comma-sep)</label>
                <input value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </div>
              <div className="space-y-1 flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.online} onChange={e => setForm({ ...form, online: e.target.checked })}
                    className="rounded border-outline-variant text-primary focus:ring-primary/30" />
                  Online
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.in_person} onChange={e => setForm({ ...form, in_person: e.target.checked })}
                    className="rounded border-outline-variant text-primary focus:ring-primary/30" />
                  In-person
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all">
                Add Partner
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <label className="flex items-center gap-3 rounded-full bg-surface-container-lowest border border-outline-variant/30 px-5 py-2.5 text-on-surface-variant w-full sm:w-80">
        <Search size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..."
          className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant" />
      </label>

      <div className="flex flex-wrap gap-2">
        {([
          ['all', 'All'],
          ['pending', 'Pending Requests'],
          ['verified', 'Verified Partners'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              status === key
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low'
            }`}
          >
            {label} <span className="ml-1 text-xs opacity-70">{visibleCounts[key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 animate-pulse">
              <div className="h-4 bg-surface-container-high rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-container-high rounded w-1/2 mb-2" />
              <div className="h-3 bg-surface-container-high rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <Handshake size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">{search ? 'No partners match your search' : 'No partners yet'}</p>
          <p className="text-sm mt-1">Add your first partner organization above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-base font-bold text-primary shrink-0">
                    {(p.org_name || p.name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h3 className="font-semibold text-on-surface text-sm">{p.org_name || p.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.is_verified
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {p.is_verified ? p.type.toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                </div>
                <BadgeCheck size={16} className={p.is_verified ? 'text-secondary shrink-0' : 'text-on-surface-variant/40 shrink-0'} />
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{p.bio || p.specialization}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1"><MapPin size={12} />{p.city}</span>
                <span className="flex items-center gap-1"><Globe size={12} />{p.languages?.join(', ')}</span>
                {p.phone && <span className="flex items-center gap-1"><Phone size={12} />{p.phone}</span>}
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                {p.online && <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">Online</span>}
                {p.in_person && <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">In-person</span>}
              </div>
              {!p.is_verified && (
                <div className="mt-4 flex gap-2 border-t border-outline-variant/20 pt-4">
                  <button
                    onClick={() => handleReview(p.id, true)}
                    className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-on-secondary hover:brightness-110 transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(p.id, false)}
                    className="flex-1 rounded-lg bg-error/10 px-3 py-2 text-xs font-bold text-error hover:bg-error/15 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
