'use client'

import { useState, useEffect } from 'react'
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
  psychiatrist: 'bg-blue-100 text-blue-700',
  counselor: 'bg-blue-100 text-blue-700',
  religious_org: 'bg-amber-100 text-amber-700',
  religious_individual: 'bg-amber-100 text-amber-700',
  ngo: 'bg-green-100 text-green-700',
  healthcare: 'bg-blue-100 text-blue-700',
  university: 'bg-green-100 text-green-700',
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

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
    </div>
  )
}

export function ProviderReviewCard({
  id, name, org, city, type, bio, languages, fee, online, in_person, pro_bono, documents,
  onVerify, onReject,
}: ProviderReviewCardProps) {
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  if (dismissed) return null

  const handleVerify = async () => {
    setLoading(true)
    try {
      await onVerify(id)
      setDismissed(true)
      setToast({ message: 'Provider verified successfully', type: 'success' })
    } catch {
      setToast({ message: 'Failed to verify provider', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await onReject(id)
      setDismissed(true)
      setToast({ message: 'Provider rejected', type: 'error' })
    } catch {
      setToast({ message: 'Failed to reject provider', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const availabilityLabel = online && in_person ? 'Hybrid' : online ? 'Online' : in_person ? 'In-person' : 'N/A'

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className={`bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-6 transition-all duration-300 ${
        loading ? 'opacity-50 scale-[0.97]' : 'opacity-100'
      }`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-[#92400E] font-bold text-lg shrink-0">
            {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[#1c1917]">{name}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-700'}`}>
                {typeLabels[type] || type.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[#64748B] mt-0.5">{org} &middot; {city}</p>

            <p className="text-sm text-[#1c1917]/80 mt-3 leading-relaxed">{bio}</p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#64748B]">
              <span>{languages.join(', ')}</span>
              <span className="font-semibold">{fee === 0 ? 'Free' : fee ? `$${fee}/session` : 'Fee not set'}</span>
              <span className={`font-semibold ${
                availabilityLabel === 'Hybrid' ? 'text-blue-600' :
                availabilityLabel === 'Online' ? 'text-[#166534]' : 'text-[#92400E]'
              }`}>
                {availabilityLabel}
              </span>
              {pro_bono && <span className="text-[#166534] font-semibold">Pro-bono</span>}
            </div>

            {documents && documents.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {documents.map((doc, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs text-[#166534] bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} />
                    {doc}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#d6d3d1]/30">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 py-2 bg-[#166534] text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={14} />
            {loading ? 'Processing...' : 'Verify'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 py-2 border-2 border-red-300 text-[#B91C1C] rounded-lg font-semibold text-sm hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle size={14} />
            Reject
          </button>
        </div>
      </div>
    </>
  )
}
