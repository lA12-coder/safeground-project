'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit3, Trash2, Globe, Tag, Eye, EyeOff, FileText, BookOpen, AlertTriangle, Bookmark, Briefcase, Calendar, XCircle, CheckCircle, Save } from 'lucide-react'
import type { ContentItem } from '@/lib/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  affirmation: { label: 'Affirmation', color: 'bg-pink-100 text-pink-700', icon: BookOpen },
  article: { label: 'Article', color: 'bg-blue-100 text-blue-700', icon: FileText },
  emergency_message: { label: 'Emergency', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  faith_resource: { label: 'Faith', color: 'bg-amber-100 text-amber-700', icon: Bookmark },
  professional_resource: { label: 'Professional', color: 'bg-purple-100 text-purple-700', icon: Briefcase },
}

const typeLabels: Record<string, string> = {
  affirmation: 'Affirmations',
  article: 'Articles',
  emergency_message: 'Emergency Messages',
  faith_resource: 'Faith Resources',
  professional_resource: 'Professional Resources',
}

const initialContent: ContentItem[] = [
  { id: '1', type: 'affirmation', title: 'You are stronger than your cravings', body: 'Every moment you resist is a victory. Your strength grows with each choice you make for your wellbeing.', language: 'en', tags: ['motivation', 'strength'], is_published: true, created_at: '2026-06-01T08:00:00Z', updated_at: '2026-06-01T08:00:00Z' },
  { id: '2', type: 'affirmation', title: 'Each day is a fresh start', body: 'Yesterday does not define today. You have the power to begin again, right now.', language: 'en', tags: ['hope', 'new-beginnings'], is_published: true, created_at: '2026-05-30T10:00:00Z', updated_at: '2026-05-30T10:00:00Z' },
  { id: '3', type: 'article', title: 'Understanding Compulsive Behavior', body: 'Compulsive behaviors — whether related to pornography, khat, alcohol, or screen use — share common neurological pathways. Understanding the urge cycle is the first step toward breaking it. This guide explains the science of habits and practical strategies for change.', language: 'en', tags: ['education', 'science', 'behavior'], is_published: true, created_at: '2026-05-15T09:00:00Z', updated_at: '2026-05-20T14:00:00Z' },
  { id: '4', type: 'emergency_message', title: 'Crisis Support - Immediate Steps', body: 'If you are experiencing a strong craving: 1. Take 10 deep breaths. 2. Call your support person. 3. Go for a walk. 4. Drink cold water. 5. Remember why you started.', language: 'en', tags: ['crisis', 'support'], is_published: true, created_at: '2026-04-01T12:00:00Z', updated_at: '2026-05-01T12:00:00Z' },
  { id: '5', type: 'faith_resource', title: 'Daily Prayer for Strength', body: 'Heavenly Father, grant me the strength to overcome this trial. Guide my steps and fill my heart with peace. Today, I choose healing.', language: 'en', tags: ['prayer', 'christian'], is_published: false, created_at: '2026-05-10T07:00:00Z', updated_at: '2026-05-10T07:00:00Z' },
  { id: '6', type: 'faith_resource', title: 'የእለት ጸሎት (Daily Prayer in Amharic)', body: 'አባት ሆይ በዚህ ቀን ልቤን አብራልኝ። ከፈተና ጠብቀኝ እና በሕይወት መንገድ ምራኝ።', language: 'am', tags: ['prayer', 'orthodox'], is_published: true, created_at: '2026-05-28T06:00:00Z', updated_at: '2026-05-28T06:00:00Z' },
  { id: '7', type: 'professional_resource', title: 'Counselor Referral Guidelines', body: 'When referring a client for recovery support: assess readiness, identify barriers, provide warm handoff, and schedule follow-up within 48 hours.', language: 'en', tags: ['counselor', 'protocol'], is_published: false, created_at: '2026-04-20T15:00:00Z', updated_at: '2026-04-20T15:00:00Z' },
  { id: '8', type: 'affirmation', title: 'ብርታትህን አትረሳ (Don\'t forget your strength)', body: 'የትናንትን ልምድ ዛሬ ለመሻገር እንደሚረዳህ አትርሳ። ብርታትህ በልብህ ውስጥ ነው።', language: 'am', tags: ['strength', 'amharic'], is_published: true, created_at: '2026-06-03T09:00:00Z', updated_at: '2026-06-03T09:00:00Z' },
  { id: '9', type: 'article', title: 'Digital Well-Being: Finding Balance', body: 'Excessive phone and social media use can affect sleep, focus, and mental health. Learn practical strategies to build a healthier relationship with technology while maintaining your recovery goals.', language: 'en', tags: ['digital-wellbeing', 'screen-time', 'habits'], is_published: true, created_at: '2026-06-04T10:00:00Z', updated_at: '2026-06-04T10:00:00Z' },
  { id: '10', type: 'article', title: 'Understanding the Urge Cycle', body: 'Urges follow a predictable pattern: trigger, buildup, peak, and decline. By recognizing each phase, you can intervene early and build resilience. This article explores the psychology of urges and practical coping techniques.', language: 'en', tags: ['education', 'urges', 'cbt'], is_published: true, created_at: '2026-06-02T09:00:00Z', updated_at: '2026-06-02T09:00:00Z' },
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>(initialContent)
  const [tab, setTab] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [form, setForm] = useState({
    title: '', body: '', type: 'affirmation' as ContentItem['type'], language: 'en', tags: '',
  })

  function resetForm() {
    setForm({ title: '', body: '', type: 'affirmation', language: 'en', tags: '' })
  }

  function handleCreate() {
    if (!form.title.trim() || !form.body.trim()) {
      setToast({ message: 'Title and body are required', type: 'error' })
      return
    }
    const newItem: ContentItem = {
      id: `c-${Date.now()}`,
      type: form.type,
      title: form.title,
      body: form.body,
      language: form.language,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setContent(prev => [newItem, ...prev])
    resetForm()
    setShowCreate(false)
    setToast({ message: 'Content created', type: 'success' })
  }

  function handleUpdate(id: string) {
    if (!form.title.trim() || !form.body.trim()) {
      setToast({ message: 'Title and body are required', type: 'error' })
      return
    }
    setContent(prev => prev.map(c => c.id === id ? {
      ...c, title: form.title, body: form.body, type: form.type,
      language: form.language, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    } : c))
    setEditingId(null)
    resetForm()
    setToast({ message: 'Content updated', type: 'success' })
  }

  function handleDelete(id: string) {
    setContent(prev => prev.filter(c => c.id !== id))
    setToast({ message: 'Content deleted', type: 'error' })
  }

  function togglePublish(id: string) {
    setContent(prev => prev.map(c => c.id === id ? { ...c, is_published: !c.is_published } : c))
    const item = content.find(c => c.id === id)
    setToast({ message: item?.is_published ? 'Content unpublished' : 'Content published', type: 'success' })
  }

  function startEdit(item: ContentItem) {
    setEditingId(item.id)
    setForm({
      title: item.title, body: item.body, type: item.type,
      language: item.language, tags: item.tags.join(', '),
    })
  }

  const filtered = tab === 'all' ? content : content.filter(c => c.type === tab)
  const tabs = ['all', ...Object.keys(typeLabels)]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Content Management</h1>
          <p className="text-on-surface-variant mt-1">{content.length} total items &middot; {content.filter(c => c.is_published).length} published</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setShowCreate(!showCreate); resetForm(); setEditingId(null) }}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm hover:brightness-110 transition-all">
          <Plus size={16} /> {showCreate ? 'Cancel' : 'Create New'}
        </motion.button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 font-semibold text-xs transition-all ${
              tab === t
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}>
            {t === 'all' ? 'All' : typeLabels[t] || t}
            {t !== 'all' && ` (${content.filter(c => c.type === t).length})`}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 space-y-4">
            <h3 className="font-semibold text-on-surface">Create New Content</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Title" className="input-field col-span-2 text-sm" />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContentItem['type'] }))}
                className="input-field text-sm">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div className="flex gap-2">
                <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                  className="input-field text-sm">
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                  <option value="om">Oromo</option>
                </select>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Tags (comma-separated)" className="input-field text-sm flex-1" />
              </div>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Body content..." rows={4} className="input-field col-span-2 text-sm resize-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)}
                className="rounded-xl border border-outline-variant px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">Cancel</button>
              <button onClick={handleCreate}
                className="flex items-center gap-1 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-on-primary hover:brightness-110 transition-all">
                <Save size={14} /> Save Content
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-on-surface-variant/40 mb-4" />
          <p className="text-on-surface-variant text-lg">No content found</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map(item => {
            const cfg = typeConfig[item.type] || { label: item.type, color: 'bg-gray-100 text-gray-600', icon: FileText }
            const Icon = cfg.icon
            return (
              <motion.div key={item.id} variants={itemVariants}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 transition-all hover:shadow-md">
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="input-field text-sm font-semibold" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContentItem['type'] }))}
                        className="input-field text-sm">
                        {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                        className="input-field text-sm">
                        <option value="en">English</option>
                        <option value="am">Amharic</option>
                        <option value="om">Oromo</option>
                      </select>
                      <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="Tags" className="input-field text-sm" />
                    </div>
                    <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      rows={3} className="input-field text-sm resize-none" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)}
                        className="rounded-xl border border-outline-variant px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">Cancel</button>
                      <button onClick={() => handleUpdate(item.id)}
                        className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:brightness-110 transition-all">
                        <Save size={14} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shrink-0 ${cfg.color}`}>
                        <Icon size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-on-surface">{item.title}</strong>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.is_published ? <Eye size={10} /> : <EyeOff size={10} />}
                            {item.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{item.body}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1"><Globe size={10} /> {item.language.toUpperCase()}</span>
                          <span className="flex items-center gap-1"><Calendar size={10} /> {timeAgo(item.created_at)}</span>
                          {item.tags.length > 0 && (
                            <span className="flex items-center gap-1"><Tag size={10} /> {item.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(item)}
                        className="rounded-lg border border-outline-variant px-2.5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-all">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => togglePublish(item.id)}
                        className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                          item.is_published
                            ? 'border border-amber-300 text-amber-700 hover:bg-amber-50'
                            : 'bg-secondary text-on-secondary hover:brightness-110'
                        }`}>
                        {item.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-error/30 px-2.5 py-2 text-xs font-semibold text-error hover:bg-error/5 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
