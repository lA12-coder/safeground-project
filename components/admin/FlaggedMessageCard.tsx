'use client'

import { useState } from 'react'
import { Trash2, CheckCircle, Flag } from 'lucide-react'

interface FlaggedMessageCardProps {
  id: string
  alias: string
  roomId: string
  message: string
  sentAt: string
  flagReason: string
  onDelete: (id: string) => Promise<void>
  onClear: (id: string) => Promise<void>
}

const flagLabels: Record<string, string> = {
  aggressive: 'AGGRESSIVE',
  spam: 'SPAM',
  inappropriate: 'INAPPROPRIATE',
  reported: 'REPORTED',
}

const flagColors: Record<string, string> = {
  aggressive: 'bg-red-50 text-red-600 border-red-200',
  spam: 'bg-amber-50 text-amber-600 border-amber-200',
  inappropriate: 'bg-purple-50 text-purple-600 border-purple-200',
  reported: 'bg-gray-50 text-gray-600 border-gray-200',
}

export function FlaggedMessageCard({
  id, alias, roomId, message, sentAt, flagReason, onDelete, onClear,
}: FlaggedMessageCardProps) {
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const timeAgo = () => {
    const diff = Date.now() - new Date(sentAt).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const handleDelete = async () => {
    setLoading(true)
    await onDelete(id)
    setDismissed(true)
    setLoading(false)
  }

  const handleClear = async () => {
    setLoading(true)
    await onClear(id)
    setDismissed(true)
    setLoading(false)
  }

  return (
    <div className={`bg-white rounded-lg border border-[#e5e0db] shadow-sm p-4 transition-all ${loading ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flag size={12} className="text-red-500" />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${flagColors[flagReason] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {flagLabels[flagReason] || flagReason.toUpperCase()}
          </span>
          <span className="text-[10px] text-[#9a8a7d]">{timeAgo()}</span>
        </div>
        <span className="text-[10px] text-[#9a8a7d]">#{roomId}</span>
      </div>
      <div className="text-[11px] text-[#6f5b4e] mb-1">
        <span className="font-medium">{alias}</span>
      </div>
      <p className="text-sm text-[#2c241f] mb-3 italic leading-relaxed">
        &ldquo;{message.slice(0, 140)}{message.length > 140 ? '...' : ''}&rdquo;
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={handleDelete} disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
          <Trash2 size={11} /> Delete
        </button>
        <button onClick={handleClear} disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e0db] text-[#6f5b4e] rounded-lg text-[10px] font-semibold hover:bg-[#f6f5f1] disabled:opacity-50 transition-colors">
          <CheckCircle size={11} /> Clear Flag
        </button>
      </div>
    </div>
  )
}
