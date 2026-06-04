'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaggedMessageCard } from '@/components/admin/FlaggedMessageCard'
import { createClient } from '@/lib/supabase/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
}

export default function AdminModerationPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFlaggedMessages()
  }, [])

  async function fetchFlaggedMessages() {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('anonymous_chat')
        .select('*')
        .eq('is_flagged', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50)

      setMessages(data || [])
    } catch (e) {
      console.error('Failed to fetch flagged messages:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/chat/${id}/delete`, { method: 'DELETE' })
    setMessages(prev => prev.filter(m => m.id !== id))
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  async function handleClear(id: string) {
    try {
      const supabase = createClient()
      await supabase.from('anonymous_chat').update({ is_flagged: false, flag_reason: null }).eq('id', id)
      setMessages(prev => prev.filter(m => m.id !== id))
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
    } catch (e) {
      console.error('Failed to clear message:', e)
    }
  }

  async function handleBulkDelete() {
    for (const id of selected) await handleDelete(id)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Chat Moderation</h1>
          <p className="text-on-surface-variant mt-1">Review and manage flagged community messages</p>
        </div>
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.button
              key="bulk-delete"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-error text-on-error rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Bulk Delete Selected ({selected.size})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-4 animate-pulse">
              <div className="h-4 bg-surface-container-high rounded w-1/4 mb-2" />
              <div className="h-3 bg-surface-container-high rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <p className="text-on-surface-variant text-lg">No flagged messages</p>
          <p className="text-on-surface-variant/60 text-sm mt-1">The community is doing well</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) setSelected(new Set(messages.map(m => m.id)))
                else setSelected(new Set())
              }}
              className="rounded border-outline-variant"
            />
            <span className="text-sm text-on-surface-variant">Select all</span>
          </div>

          <AnimatePresence mode="popLayout">
            {messages.map((msg: any) => (
              <motion.div
                key={msg.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.005, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
                className="flex items-start gap-3"
              >
                <input
                  type="checkbox"
                  checked={selected.has(msg.id)}
                  onChange={() => toggleSelect(msg.id)}
                  className="mt-4 rounded border-outline-variant"
                />
                <div className="flex-1">
                  <FlaggedMessageCard
                    id={msg.id}
                    alias={msg.user_alias}
                    roomId={msg.room_id}
                    message={msg.message}
                    sentAt={msg.created_at}
                    flagReason={msg.flag_reason || 'reported'}
                    onDelete={handleDelete}
                    onClear={handleClear}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
