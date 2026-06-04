'use client'

import { useEffect, useState } from 'react'
import { FlaggedMessageCard } from '@/components/admin/FlaggedMessageCard'
import { createClient } from '@/lib/supabase/client'

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
    const supabase = createClient()
    await supabase.from('anonymous_chat').update({ is_flagged: false, flag_reason: null }).eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
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
          <h1 className="text-3xl font-bold text-[#92400E]">Chat Moderation</h1>
          <p className="text-[#64748B] mt-1">Review and manage flagged community messages</p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-[#B91C1C] text-white rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            Bulk Delete Selected ({selected.size})
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg border border-[#d6d3d1]/30 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#64748B] text-lg">No flagged messages</p>
          <p className="text-[#64748B]/60 text-sm mt-1">The community is doing well</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) setSelected(new Set(messages.map(m => m.id)))
                else setSelected(new Set())
              }}
              className="rounded border-[#d6d3d1]"
            />
            <span className="text-sm text-[#64748B]">Select all</span>
          </div>

          {messages.map((msg: any) => (
            <div key={msg.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(msg.id)}
                onChange={() => toggleSelect(msg.id)}
                className="mt-4 rounded border-[#d6d3d1]"
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
