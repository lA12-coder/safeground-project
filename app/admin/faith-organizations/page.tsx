'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, XCircle, Church, Phone, Mail, MapPin, Calendar, FileText, BadgeCheck, Tags, Clock, ArrowUpRight } from 'lucide-react'
import type { FaithOrganization } from '@/lib/types'

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

const mockOrganizations: FaithOrganization[] = [
  {
    id: '1', org_name: 'Debre Damo Spiritual Recovery', faith_tradition: 'orthodox',
    rep_name: 'Abune Gebre Mikael', rep_phone: '+251-911-123456', rep_email: 'abune@debredamo.org',
    program_name: 'Tsom & Selot Recovery', description: 'A 40-day spiritual recovery program combining fasting, prayer, and counseling for those struggling with khat addiction. Rooted in Ethiopian Orthodox traditions with modern therapeutic approaches.',
    recovery_activities: ['Prayer Sessions', 'Fasting Guidance', 'One-on-One Counseling', 'Community Support Groups', 'Scripture Study'],
    weekly_structure: 'Mon-Wed-Fri: Group prayer & counseling\nTue-Thu: Individual sessions\nSat: Community service\nSun: Church service & reflection',
    city: 'Addis Ababa', region: 'Addis Ababa',
    verification_docs: ['license.pdf', 'certificate.pdf'], is_verified: false, is_active: true, created_at: '2026-05-28T10:00:00Z',
  },
  {
    id: '2', org_name: 'Ethiopian Islamic Counseling Center', faith_tradition: 'muslim',
    rep_name: 'Sheikh Ahmed Hassen', rep_phone: '+251-922-654321', rep_email: 'ahmed@eislamic.org',
    program_name: 'Tawba & Tazkiyah Program', description: 'Islamic-based recovery program focusing on spiritual purification (Tazkiyah) and repentance (Tawba). Includes daily prayers, Quran study, and group support.',
    recovery_activities: ['Daily Prayers', 'Quran Study Circles', 'Group Counseling', 'Family Support', 'Dhikr Sessions'],
    weekly_structure: 'Daily: Fajr prayer & reflection\nMon/Thu: Quran study\nTue/Wed: Group counseling\nFri: Jumuah & special program\nSat: Family support',
    city: 'Dire Dawa', region: 'Dire Dawa',
    verification_docs: ['registration.pdf'], is_verified: true, is_active: true, created_at: '2026-05-20T08:30:00Z',
  },
  {
    id: '3', org_name: 'Mekane Yesus Recovery Ministry', faith_tradition: 'protestant',
    rep_name: 'Pastor Tesfaye Alemu', rep_phone: '+251-933-789012', rep_email: 'pastor@mekaneyesus.org',
    program_name: 'New Life in Christ', description: 'Evangelical Christian recovery program with weekly Bible studies, accountability groups, and practical life skills training for sustainable recovery.',
    recovery_activities: ['Bible Study', 'Accountability Groups', 'Life Skills Training', 'Job Readiness', 'Family Counseling'],
    weekly_structure: 'Sunday: Church service\nMonday: Accountability groups\nWednesday: Bible study\nFriday: Life skills workshop\nSaturday: Community outreach',
    city: 'Hawassa', region: 'Sidama',
    verification_docs: ['certificate.pdf', 'license.pdf', 'reference.pdf'], is_verified: false, is_active: true, created_at: '2026-06-01T14:00:00Z',
  },
  {
    id: '4', org_name: 'Geda Traditional Healing Circle', faith_tradition: 'traditional',
    rep_name: 'Aba Gammachis Dibaba', rep_phone: '+251-944-567890', rep_email: 'gammachis@gedahealing.org',
    program_name: 'Borenta Recovery Path', description: 'Traditional Oromo Geda system-based healing program using indigenous knowledge, community rituals, and elder guidance for addiction recovery.',
    recovery_activities: ['Elder Counseling', 'Community Rituals', 'Herbal Support', 'Storytelling Circles', 'Nature Retreats'],
    weekly_structure: 'Monday: Community circle\nWednesday: Elder consultation\nFriday: Ritual ceremony\nWeekend: Nature retreat (bi-weekly)',
    city: 'Jimma', region: 'Oromia',
    verification_docs: [], is_verified: false, is_active: true, created_at: '2026-05-25T09:15:00Z',
  },
  {
    id: '5', org_name: 'St. Mary Orthodox Recovery', faith_tradition: 'orthodox',
    rep_name: 'Memhir Desta Kebede', rep_phone: '+251-955-345678', rep_email: 'desta@stmary.org',
    program_name: 'Kidusan Recovery Plan', description: 'Faith-based recovery program integrated with the Ethiopian Orthodox Church calendar. Uses liturgical seasons as framework for recovery milestones.',
    recovery_activities: ['Liturgical Participation', 'Confession & Guidance', 'Monastic Mentoring', 'Community Meals', 'Iconography Therapy'],
    weekly_structure: 'Daily: Morning prayers\nMon/Thu: Confession available\nTue: Monastic mentoring\nWed: Community meal & sharing\nFri: Evening prayer vigil',
    city: 'Bahir Dar', region: 'Amhara',
    verification_docs: ['license.pdf'], is_verified: false, is_active: true, created_at: '2026-05-30T11:00:00Z',
  },
]

export default function FaithOrganizationsPage() {
  const [organizations, setOrganizations] = useState<FaithOrganization[]>([])
  const [selected, setSelected] = useState<FaithOrganization | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'verified' | 'all'>('pending')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrganizations(mockOrganizations)
      setLoading(false)
      const firstPending = mockOrganizations.find(o => !o.is_verified)
      if (firstPending) setSelected(firstPending)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  function handleApprove(id: string) {
    setActionLoading(id)
    setTimeout(() => {
      setOrganizations(prev => prev.map(o => o.id === id ? { ...o, is_verified: true } : o))
      setSelected(prev => prev?.id === id ? { ...prev, is_verified: true } : prev)
      setActionLoading(null)
      setToast({ message: 'Faith organization verified successfully', type: 'success' })
    }, 800)
  }

  function handleReject(id: string) {
    setActionLoading(id)
    setTimeout(() => {
      setOrganizations(prev => prev.filter(o => o.id !== id))
      if (selected?.id === id) {
        const remaining = organizations.filter(o => o.id !== id)
        setSelected(remaining[0] || null)
      }
      setActionLoading(null)
      setToast({ message: 'Faith organization rejected', type: 'error' })
    }, 800)
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

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-3xl font-bold text-primary">Faith Organizations</h1>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-primary-container px-4 py-1.5 font-bold text-on-surface text-sm"
          >
            {organizations.filter(o => !o.is_verified).length} Pending
          </motion.span>
        </div>
        <label className="flex w-72 items-center gap-3 rounded-full bg-surface-container-low px-5 py-2.5 text-on-surface-variant">
          <Search size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full bg-transparent outline-none text-sm placeholder:text-on-surface-variant"
          />
        </label>
      </header>

      <div className="inline-flex rounded-2xl bg-surface-container-high p-1">
        {(['all', 'pending', 'verified'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch('') }}
            className={`min-w-28 rounded-xl px-6 py-2.5 font-bold text-sm transition-colors ${
              tab === t
                ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
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
              {search ? 'No organizations match your search' : 'No organizations in this category'}
            </div>
          ) : (
            filtered.map(o => (
              <motion.button
                key={o.id}
                variants={itemVariants}
                onClick={() => setSelected(o)}
                className={`w-full text-left bg-surface-container-lowest rounded-xl border p-5 transition-all hover:shadow-md ${
                  selected?.id === o.id
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-outline-variant/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-lg font-bold text-primary shrink-0">
                    <Church size={20} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-on-surface truncate">{o.org_name}</strong>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${faithColors[o.faith_tradition] || ''}`}>
                        {faithLabels[o.faith_tradition] || o.faith_tradition}
                      </span>
                      {o.is_verified && (
                        <BadgeCheck size={14} className="text-secondary" />
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {o.city}, {o.region} &middot; {o.rep_name}
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
                      <Church size={28} />
                    </motion.span>
                    <div>
                      <h2 className="font-serif text-2xl text-on-surface">{selected.org_name}</h2>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${faithColors[selected.faith_tradition] || ''}`}>
                          {faithLabels[selected.faith_tradition] || selected.faith_tradition}
                        </span>
                        <span className="text-xs text-on-surface-variant">{selected.city}, {selected.region}</span>
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
                  <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2">Program</h3>
                  <p className="font-medium text-on-surface">{selected.program_name}</p>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{selected.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-on-surface-variant block flex items-center gap-1"><User size={12} /> Representative</span>
                    <span className="font-medium text-on-surface">{selected.rep_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block flex items-center gap-1"><Phone size={12} /> Phone</span>
                    <span className="font-medium text-on-surface">{selected.rep_phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-on-surface-variant block flex items-center gap-1"><Mail size={12} /> Email</span>
                    <span className="font-medium text-on-surface">{selected.rep_email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block flex items-center gap-1"><MapPin size={12} /> Location</span>
                    <span className="font-medium text-on-surface">{selected.city}, {selected.region}</span>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant block flex items-center gap-1"><Calendar size={12} /> Submitted</span>
                    <span className="font-medium text-on-surface">{new Date(selected.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2 flex items-center gap-1">
                    <Tags size={12} /> Recovery Activities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.recovery_activities.map(a => (
                      <span key={a} className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2 flex items-center gap-1">
                    <Clock size={12} /> Weekly Structure
                  </h3>
                  <p className="text-sm text-on-surface whitespace-pre-line leading-relaxed bg-surface-container-low rounded-lg p-3">
                    {selected.weekly_structure}
                  </p>
                </div>

                {selected.verification_docs.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2 flex items-center gap-1">
                      <FileText size={12} /> Documents
                    </h3>
                    <div className="space-y-1">
                      {selected.verification_docs.map(doc => (
                        <div key={doc} className="flex items-center gap-2 text-sm text-primary">
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
                    Reject Application
                  </motion.button>
                </div>
              )}
              {selected.is_verified && (
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                    <CheckCircle size={16} />
                    This organization has been verified
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

function User(props: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
