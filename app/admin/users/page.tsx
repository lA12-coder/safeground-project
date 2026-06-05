'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Mail, Calendar, Shield, AlertTriangle, Activity, Clock, Award, MapPin, BadgeCheck, Trash2, RotateCcw, Eye, XCircle, Flag, Languages, Hash } from 'lucide-react'
import type { Profile, Streak, GuardianControl } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
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
      {type === 'success' ? <BadgeCheck size={16} /> : <XCircle size={16} />}
      {message}
    </motion.div>
  )
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(Profile & { streak?: Streak; guardian?: GuardianControl | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!profiles) { setUsers([]); return }

      const userIds = profiles.map(p => p.id)
      const [{ data: streaks }, { data: guardians }] = await Promise.all([
        supabase.from('streaks').select('*').in('user_id', userIds),
        supabase.from('guardian_controls').select('*').in('user_id', userIds).eq('is_active', true),
      ])

      const streakMap = new Map((streaks || []).map(s => [s.user_id, s]))
      const guardianMap = new Map((guardians || []).map(g => [g.user_id, g]))

      setUsers(profiles.map(p => ({
        ...p,
        streak: streakMap.get(p.id),
        guardian: guardianMap.get(p.id) || null,
      })))
    } catch (e) {
      console.error('Failed to fetch users:', e)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u =>
    !search || u.alias.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.region?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Management</h1>
          <p className="text-on-surface-variant mt-1">{users.length} total users</p>
        </div>
        <label className="flex w-72 items-center gap-3 rounded-full bg-surface-container-low px-5 py-2.5 text-on-surface-variant">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by alias, email, region..."
            className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant" />
        </label>
      </header>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-high rounded w-2/3" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-container-high rounded w-full" />
                <div className="h-3 bg-surface-container-high rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <User size={48} className="mx-auto text-on-surface-variant/40 mb-4" />
          <p className="text-on-surface-variant text-lg">{search ? 'No users match your search' : 'No users found'}</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(u => (
            <motion.button key={u.id} variants={itemVariants}
              onClick={() => setSelected(u)}
              className={`text-left bg-surface-container-lowest rounded-xl border p-5 transition-all hover:shadow-md ${
                selected?.id === u.id ? 'border-primary ring-1 ring-primary/20' : 'border-outline-variant/30'
              }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-primary shrink-0">
                  {getInitials(u.alias)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-on-surface truncate">{u.alias}</strong>
                    {u.onboarding_done && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">{u.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1"><Languages size={10} /> {u.language_pref || 'N/A'}</span>
                {u.region && <span className="flex items-center gap-1"><MapPin size={10} /> {u.region}</span>}
                <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(u.created_at).toLocaleDateString()}</span>
              </div>
              {u.trigger_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {u.trigger_tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-error/10 text-error/80">{t}</span>
                  ))}
                  {u.trigger_tags.length > 3 && (
                    <span className="text-[10px] text-on-surface-variant">+{u.trigger_tags.length - 3}</span>
                  )}
                </div>
              )}
              {u.guardian && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-secondary font-medium">
                  <Shield size={10} /> Guardian Active
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
              <div className="bg-surface-container-low p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-2xl font-bold text-primary">
                      {getInitials(selected.alias)}
                    </span>
                    <div>
                      <h2 className="font-serif text-2xl text-on-surface">{selected.alias}</h2>
                      <p className="text-sm text-on-surface-variant">{selected.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface">
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-on-surface-variant block">Language</span>
                    <span className="font-medium text-on-surface">{selected.language_pref || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">Region</span>
                    <span className="font-medium text-on-surface">{selected.region || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">Streak Goal</span>
                    <span className="font-medium text-on-surface">{selected.streak_goal || 0} days</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block">Joined</span>
                    <span className="font-medium text-on-surface">{new Date(selected.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {selected.trigger_tags?.length > 0 && (
                  <div>
                    <span className="text-xs text-on-surface-variant block mb-1 flex items-center gap-1"><Flag size={11} /> Trigger Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selected.trigger_tags.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-error/10 text-error/80">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-on-surface-variant"><Shield size={14} /> Onboarding:</span>
                  <span className={`font-semibold ${selected.onboarding_done ? 'text-secondary' : 'text-error'}`}>
                    {selected.onboarding_done ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-error/30 px-4 py-3 text-sm font-semibold text-error hover:bg-error/5 transition-all">
                    <AlertTriangle size={16} />
                    Suspend
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-error/30 px-4 py-3 text-sm font-semibold text-error hover:bg-error/5 transition-all">
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-secondary/30 px-4 py-3 text-sm font-semibold text-secondary hover:bg-secondary/5 transition-all">
                    <RotateCcw size={16} />
                    Restore
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
