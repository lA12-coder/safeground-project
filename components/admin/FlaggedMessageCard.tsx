'use client'

import { useState } from 'react'
import { Trash2, CheckCircle } from 'lucide-react'

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

export function FlaggedMessageCard({
  id, alias, roomId, message, sentAt, flagReason, onDelete, onClear,
}: FlaggedMessageCardProps) {
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const flagLabels: Record<string, string> = {
    aggressive: 'AGGRESSIVE',
    spam: 'SPAM',
    inappropriate: 'INAPPROPRIATE',
    reported: 'REPORTED',
  }

  const flagColors: Record<string, string> = {
    aggressive: 'bg-red-100 text-red-700',
    spam: 'bg-amber-100 text-amber-700',
    inappropriate: 'bg-purple-100 text-purple-700',
    reported: 'bg-gray-100 text-gray-700',
  }

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
    <div className="bg-surface-container-lowest rounded-lg border border-error/20 shadow-sm p-4 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${flagColors[flagReason] || 'bg-surface-container-high text-on-surface-variant'}`}>
            {flagLabels[flagReason] || flagReason.toUpperCase()}
          </span>
          <span className="text-xs text-on-surface-variant">{timeAgo()}</span>
        </div>
        <span className="text-xs text-on-surface-variant">#{roomId}</span>
      </div>
      <div className="text-xs text-on-surface-variant mb-1">
        <span className="font-medium">{alias}</span>
      </div>
      <p className="text-sm text-on-surface mb-3 italic">&ldquo;{message.slice(0, 120)}{message.length > 120 ? '...' : ''}&rdquo;</p>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-error text-on-error rounded-lg text-xs font-semibold hover:brightness-90 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={12} />
          Delete
        </button>
        <button
          onClick={handleClear}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant/30 text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low disabled:opacity-50 transition-colors"
        >
          <CheckCircle size={12} />
          Clear Flag
        </button>
      </div>
    </div>
  )
}
