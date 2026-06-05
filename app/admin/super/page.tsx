'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldAlert, Crown, UserPlus, UserMinus, Trash2, Key, Users, Star, Gavel, BarChart3, Eye, CheckCircle, XCircle, Mail, ArrowRight, ChevronRight } from 'lucide-react'
import type { AdminUser } from '@/lib/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

const roleConfig: Record<string, { label: string; color: string; icon: any; description: string; level: number }> = {
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700 border-red-200', icon: Crown, description: 'Full system access, all permissions', level: 1 },
  platform_admin: { label: 'Platform Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield, description: 'Platform-wide management access', level: 2 },
  moderator: { label: 'Moderator', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Eye, description: 'Chat moderation, content review', level: 3 },
  provider_reviewer: { label: 'Provider Reviewer', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Star, description: 'Provider verification & approval', level: 3 },
  analytics_manager: { label: 'Analytics Manager', color: 'bg-green-100 text-green-700 border-green-200', icon: BarChart3, description: 'View analytics & generate reports', level: 3 },
}

const initialAdmins: AdminUser[] = [
  { id: 'a1', email: 'super@safeground.org', alias: 'Super Admin', role: 'super_admin', created_at: '2026-01-01T00:00:00Z' },
  { id: 'a2', email: 'admin@safeground.org', alias: 'Platform Admin', role: 'platform_admin', created_at: '2026-02-15T08:00:00Z' },
  { id: 'a3', email: 'moderator@safeground.org', alias: 'Moderator One', role: 'moderator', created_at: '2026-03-10T10:00:00Z' },
  { id: 'a4', email: 'reviewer@safeground.org', alias: 'Provider Reviewer', role: 'provider_reviewer', created_at: '2026-04-01T12:00:00Z' },
  { id: 'a5', email: 'analytics@safeground.org', alias: 'Analytics Manager', role: 'analytics_manager', created_at: '2026-05-01T09:00:00Z' },
]

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
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

function RoleHierarchy() {
  const levels = [
    { level: 1, roles: ['super_admin'], label: 'Super Admin', icon: Crown, color: 'bg-red-500' },
    { level: 2, roles: ['platform_admin'], label: 'Platform Admin', icon: Shield, color: 'bg-purple-500' },
    { level: 3, roles: ['moderator', 'provider_reviewer', 'analytics_manager'], label: 'Moderator / Provider Reviewer / Analytics Manager', icon: Users, color: 'bg-blue-500' },
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
      <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-6 flex items-center gap-2">
        <ShieldAlert size={14} /> Role Hierarchy
      </h3>
      <div className="space-y-0">
        {levels.map((l, i) => (
          <div key={l.level} className="relative">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl ${l.color} flex items-center justify-center text-white shadow-sm`}>
                  <l.icon size={18} />
                </div>
                {i < levels.length - 1 && (
                  <div className="w-0.5 h-8 bg-outline-variant my-1" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">{l.label}</span>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">Level {l.level}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {l.level === 1 ? 'Full system access, can manage all admins' :
                   l.level === 2 ? 'Platform-wide management, cannot manage super admins' :
                   'Role-specific access with limited permissions'}
                </p>
              </div>
            </div>
            {i < levels.length - 1 && (
              <div className="ml-5 mb-1">
                <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                  <span className="w-4 h-px bg-outline-variant" />
                  <ChevronRight size={10} />
                  <span>Manages</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SuperAdminPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ email: '', role: 'moderator' as AdminUser['role'] })
  const [showForm, setShowForm] = useState(false)

  function handleCreate() {
    if (!form.email.trim() || !form.email.includes('@')) {
      setToast({ message: 'Please enter a valid email', type: 'error' })
      return
    }
    if (admins.some(a => a.email === form.email.trim())) {
      setToast({ message: 'This admin already exists', type: 'error' })
      return
    }
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email: form.email.trim(),
      alias: form.email.split('@')[0],
      role: form.role,
      created_at: new Date().toISOString(),
    }
    setAdmins(prev => [...prev, newAdmin])
    setForm({ email: '', role: 'moderator' })
    setShowForm(false)
    setToast({ message: 'Admin added successfully', type: 'success' })
  }

  function handleRemove(id: string) {
    setAdmins(prev => prev.filter(a => a.id !== id))
    setToast({ message: 'Admin removed', type: 'error' })
  }

  const counts = Object.keys(roleConfig).map(role => ({
    role,
    count: admins.filter(a => a.role === role).length,
    ...roleConfig[role],
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Super Admin Panel</h1>
          <p className="text-on-surface-variant mt-1">Admin role management &amp; system access control</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm hover:brightness-110 transition-all">
          <UserPlus size={16} /> {showForm ? 'Cancel' : 'Add Admin'}
        </motion.button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {counts.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div key={c.role} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 text-center">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${c.color}`}><Icon size={18} /></div>
              <p className="text-2xl font-bold text-on-surface">{c.count}</p>
              <p className="text-[10px] text-on-surface-variant">{c.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-surface-container-lowest rounded-xl border border-primary/30 p-5 space-y-4">
                <h3 className="font-semibold text-on-surface flex items-center gap-2">
                  <UserPlus size={16} className="text-primary" /> New Admin
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="admin@example.com" type="email"
                      className="input-field text-sm pl-9" />
                  </div>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminUser['role'] }))}
                    className="input-field text-sm">
                    {Object.entries(roleConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-on-secondary hover:brightness-110 transition-all">
                    <Key size={16} /> Create Admin
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
            {admins.map((admin, i) => {
              const cfg = roleConfig[admin.role] || { label: admin.role, color: 'bg-gray-100 text-gray-600', icon: Shield, description: '', level: 99 }
              const Icon = cfg.icon
              return (
                <motion.div key={admin.id} variants={itemVariants}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shrink-0 ${cfg.color}`}>
                        <Icon size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-on-surface">{admin.alias}</strong>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                          {admin.role === 'super_admin' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-0.5">
                              <Crown size={9} /> Owner
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1"><Mail size={10} /> {admin.email}</span>
                          <span>Added {new Date(admin.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {admin.role !== 'super_admin' && (
                        <div className="relative group">
                          <select value={admin.role}
                            onChange={e => {
                              const newRole = e.target.value as AdminUser['role']
                              setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, role: newRole } : a))
                              setToast({ message: `Role changed to ${roleConfig[newRole].label}`, type: 'success' })
                            }}
                            className="appearance-none bg-surface-container-low rounded-lg px-3 py-2 text-xs font-semibold text-on-surface border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-all">
                            {Object.entries(roleConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                      )}
                      {admin.role !== 'super_admin' && (
                        <button onClick={() => handleRemove(admin.id)}
                          className="rounded-lg border border-error/30 px-2.5 py-2 text-xs font-semibold text-error hover:bg-error/5 transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <div className="space-y-4">
          <RoleHierarchy />

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
            <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-3 flex items-center gap-2">
              <Shield size={14} /> Permission Summary
            </h3>
            <div className="space-y-2 text-xs">
              {Object.entries(roleConfig).map(([k, v]) => {
                const Icon = v.icon
                return (
                  <div key={k} className="flex items-start gap-2 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                    <Icon size={14} className="mt-0.5 shrink-0 text-on-surface-variant" />
                    <div>
                      <span className="font-semibold text-on-surface">{v.label}</span>
                      <p className="text-on-surface-variant">{v.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
            <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-3 flex items-center gap-2">
              <Users size={14} /> Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Total Admins</span>
                <span className="font-bold text-on-surface">{admins.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Roles</span>
                <span className="font-bold text-on-surface">{new Set(admins.map(a => a.role)).size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Super Admins</span>
                <span className="font-bold text-on-surface">{admins.filter(a => a.role === 'super_admin').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Level 3 Admins</span>
                <span className="font-bold text-on-surface">{admins.filter(a => roleConfig[a.role]?.level === 3).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
