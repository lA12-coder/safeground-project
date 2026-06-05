'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface ProviderReviewCardProps {
  id: string
  name: string
  org: string
  city: string
  type: string
  bio: string
  languages: string[]
  fee?: number
  online: boolean
  in_person: boolean
  pro_bono?: boolean
  documents?: string[]
  onVerify: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

const typeColors: Record<string, string> = {
  psychiatrist: 'bg-blue-50 text-blue-700',
  counselor: 'bg-blue-50 text-blue-700',
  religious_org: 'bg-amber-50 text-amber-700',
  religious_individual: 'bg-amber-50 text-amber-700',
  ngo: 'bg-green-50 text-green-700',
  healthcare: 'bg-blue-50 text-blue-700',
  university: 'bg-green-50 text-green-700',
}

const typeLabels: Record<string, string> = {
  psychiatrist: 'MEDICAL',
  counselor: 'MEDICAL',
  religious_org: 'SPIRITUAL',
  religious_individual: 'SPIRITUAL',
  ngo: 'COMMUNITY',
  healthcare: 'MEDICAL',
  university: 'COMMUNITY',
}

export function ProviderReviewCard({
  id, name, org, city, type, bio, languages, fee, online, in_person, pro_bono, documents,
  onVerify, onReject,
}: ProviderReviewCardProps) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const availabilityLabel = online && in_person ? 'Hybrid' : online ? 'Online' : in_person ? 'In-person' : 'N/A'

  const handleVerify = async () => {
    setLoading(true)
    try {
      await onVerify(id)
      setToast({ message: 'Provider verified', type: 'success' })
    } catch {
      setToast({ message: 'Failed to verify', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await onReject(id)
      setToast({ message: 'Provider rejected', type: 'error' })
    } catch {
      setToast({ message: 'Failed to reject', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5 transition-all ${loading ? 'opacity-50' : ''}`}>
      {toast && (
        <div className={`mb-3 px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {toast.message}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#f0ece7] flex items-center justify-center text-sm font-bold text-[#8a3d08] shrink-0">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#2c241f] text-sm">{name}</h3>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-600'}`}>
              {typeLabels[type] || type.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[#6f5b4e] mt-0.5">{org} &middot; {city}</p>
          <p className="text-sm text-[#2c241f]/80 mt-2 leading-relaxed">{bio}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-[#6f5b4e]">
            <span>{languages.join(', ')}</span>
            <span className="font-medium">{fee === 0 ? 'Free' : fee ? `$${fee}/session` : 'Not set'}</span>
            <span className={`font-medium ${
              availabilityLabel === 'Hybrid' ? 'text-blue-600' : availabilityLabel === 'Online' ? 'text-green-600' : 'text-amber-600'
            }`}>{availabilityLabel}</span>
            {pro_bono && <span className="font-medium text-green-600">Pro-bono</span>}
          </div>
          {documents && documents.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {documents.map((doc, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle size={10} /> {doc}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#e5e0db]">
        <button onClick={handleVerify} disabled={loading}
          className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
          <CheckCircle size={13} /> {loading ? 'Processing...' : 'Approve'}
        </button>
        <button onClick={handleReject} disabled={loading}
          className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
          <XCircle size={13} /> Reject
        </button>
      </div>
    </div>
  )
}
