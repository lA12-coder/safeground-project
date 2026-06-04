'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Send, Flag, Users, MessageCircle, AlertCircle } from 'lucide-react'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface ChatMessage {
  id: string
  sender_alias: string
  message: string
  message_type: string
  sent_at: string
  is_flagged: boolean
  is_deleted: boolean
}

const ADJECTIVES = ['Selam', 'Biruk', 'Tsega', 'Fiker', 'Tena', 'Nitsuh', 'Chora', 'Haile', 'Abebe', 'Genet']
const ANIMALS = ['Lion', 'Eagle', 'Crane', 'Gazelle', 'Wolf', 'Falcon', 'Cheetah', 'Ibis', 'Eland', 'Jackal']

function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const num = Math.floor(Math.random() * 100)
  return `${adj}-${animal}-${num}`
}

function getAlias(): string {
  if (typeof window === 'undefined') return 'Anonymous'
  let alias = sessionStorage.getItem('chat_alias')
  if (!alias) {
    alias = generateAlias()
    sessionStorage.setItem('chat_alias', alias)
  }
  return alias
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function ChatPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [alias] = useState(getAlias)
  const [room, setRoom] = useState<'global' | 'crisis'>('global')
  const [onlineCount, setOnlineCount] = useState(0)
  const [showBanner, setShowBanner] = useState(true)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load initial messages
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('anonymous_chat')
        .select('*')
        .eq('room_id', room === 'global' ? 'global' : 'crisis')
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false })
        .limit(100)

      if (data) {
        setMessages(data.reverse())
      }
      setLoading(false)
      setTimeout(scrollToBottom, 100)
    }
    load()
  }, [room, supabase, scrollToBottom])

  // Subscribe to realtime
  useEffect(() => {
    const roomId = room === 'global' ? 'global' : 'crisis'

    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anonymous_chat',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage
          if (!newMsg.is_deleted) {
            setMessages((prev) => [...prev, newMsg])
            setTimeout(scrollToBottom, 50)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'anonymous_chat',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          )
        }
      )
      .subscribe()

    channelRef.current = channel

    // Presence tracking
    const presenceChannel = supabase.channel('online-users')
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(presenceChannel)
    }
  }, [room, supabase, scrollToBottom])

  async function sendMessage(type = 'text', text?: string) {
    const msg = text || input
    if (!msg.trim() || sending) return

    setSending(true)
    const { error } = await supabase.from('anonymous_chat').insert({
      room_id: room === 'global' ? 'global' : 'crisis',
      sender_alias: alias,
      message: msg.trim().slice(0, 500),
      message_type: type,
    })
    if (!error) setInput('')
    setSending(false)
  }

  async function flagMessage(id: string) {
    await fetch('/api/chat/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: id }),
    })
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Support Chat</h1>
            <div className="flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full">
              <Users className="w-3.5 h-3.5" />
              {onlineCount} here
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            {alias}
          </div>
        </div>
      </header>

      {showBanner && (
        <div className="bg-primary-container text-on-primary-container px-6 py-3 text-sm flex items-center justify-between">
          <span>This is an anonymous safe space. No judgment. No real names. Be kind.</span>
          <button onClick={() => setShowBanner(false)} className="font-bold opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Room selector */}
      <div className="flex gap-2 px-6 py-3 border-b border-outline-variant bg-surface-container-lowest">
        <button
          onClick={() => setRoom('global')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            room === 'global' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          Global Support
        </button>
        <button
          onClick={() => setRoom('crisis')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            room === 'crisis' ? 'bg-error text-on-error' : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          Crisis Room
        </button>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 max-h-[60vh]">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-surface-container-high rounded-xl" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Welcome to SafeGround&apos;s anonymous chat</p>
              <p className="text-sm mt-1">Your privacy is protected. You are known as <strong>{alias}</strong>.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_alias === alias ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.message_type === 'system'
                      ? 'bg-surface-container-high text-on-surface-variant italic text-center mx-auto text-sm'
                      : msg.sender_alias === alias
                      ? 'bg-primary text-on-primary rounded-br-md'
                      : 'bg-surface-container-high text-on-surface rounded-bl-md'
                  }`}
                >
                  {msg.message_type !== 'system' && (
                    <div className={`text-xs font-bold mb-1 ${msg.sender_alias === alias ? 'text-on-primary/70' : 'text-primary'}`}>
                      {msg.sender_alias === alias ? 'You' : msg.sender_alias}
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] ${msg.sender_alias === alias ? 'text-on-primary/60' : 'text-on-surface-variant/60'}`}>
                      {timeAgo(msg.sent_at)}
                    </span>
                    {msg.sender_alias !== alias && msg.message_type === 'text' && !msg.is_flagged && (
                      <button
                        onClick={() => flagMessage(msg.id)}
                        className="text-on-surface-variant/40 hover:text-error transition ml-2"
                        title="Flag as inappropriate"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Support reactions */}
        <div className="flex gap-2 px-6 py-2 border-t border-outline-variant bg-surface-container-lowest">
          {['👊 Stay strong', '💚 I hear you', '🌟 You got this'].map((reaction) => (
            <button
              key={reaction}
              onClick={() => sendMessage('support_reaction', reaction)}
              disabled={sending}
              className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest rounded-full text-sm transition disabled:opacity-50"
            >
              {reaction}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your message..."
              maxLength={500}
              className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              rows={2}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="bg-primary text-on-primary p-3 rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-right text-xs text-on-surface-variant mt-1">
            {input.length}/500
          </div>
        </div>
      </div>
    </div>
  )
}
