'use client'

import { useEffect, useState, useCallback } from 'react'
import { ProviderReviewCard } from '@/components/admin/ProviderReviewCard'
import { Search, Filter, RefreshCw } from 'lucide-react'

interface Provider {
  id: string
  name: string
  org_name?: string
  type: string
  specialization: string
  city: string
  region: string
  bio: string
  languages: string[]
  consultation_fee: number | null
  pro_bono: boolean
  online: boolean
  in_person: boolean
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/directory?limit=100&include_unverified=true')
      if (res.ok) {
        const data = await res.json()
        setProviders(data.providers || [])
      }
    } catch (e) {
      console.error('Failed to fetch providers:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])

  const handleVerify = async (id: string) => {
    await fetch(`/api/admin/providers/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true }),
    })
    setProviders(prev => prev.filter(p => p.id !== id))
  }

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/providers/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: false }),
    })
    setProviders(prev => prev.filter(p => p.id !== id))
  }

  const filtered = providers.filter(p => {
    if (filter === 'pending' && p.is_verified) return false
    if (filter === 'verified' && !p.is_verified) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.org_name?.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter && p.type !== typeFilter) return false
    return true
  })

  const pendingCount = providers.filter(p => !p.is_verified).length
  const verifiedCount = providers.filter(p => p.is_verified).length

  const uniqueTypes = Array.from(new Set(providers.map(p => p.type)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#92400E]">Provider Approval Center</h1>
          <p className="text-[#64748B] mt-1">Review and verify healthcare providers &amp; faith organizations</p>
        </div>
        <button
          onClick={fetchProviders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-[#d6d3d1]/30 rounded-lg text-sm font-semibold text-[#64748B] hover:bg-[#f5f5f4] transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#d6d3d1]/30 rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search size={16} className="text-[#64748B]" />
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'pending', 'verified'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-[#92400E] text-white'
                  : 'bg-white text-[#64748B] border border-[#d6d3d1]/30 hover:bg-[#f5f5f4]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && <span className="ml-1.5 text-xs opacity-80">({pendingCount})</span>}
              {f === 'verified' && <span className="ml-1.5 text-xs opacity-80">({verifiedCount})</span>}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="appearance-none bg-white border border-[#d6d3d1]/30 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-[#64748B] outline-none"
          >
            <option value="">All Types</option>
            {uniqueTypes.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-[#64748B]">
          <strong className="text-[#1c1917]">{providers.length}</strong> total
        </span>
        <span className="text-[#64748B]">
          <strong className="text-[#92400E]">{pendingCount}</strong> pending
        </span>
        <span className="text-[#64748B]">
          <strong className="text-[#166534]">{verifiedCount}</strong> verified
        </span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[#d6d3d1]/30 shadow-sm p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#64748B] text-lg">No providers match your criteria</p>
          <p className="text-[#64748B]/60 text-sm mt-1">
            {filter === 'pending' ? 'All providers have been reviewed' : 'No providers found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(p => (
            <ProviderReviewCard
              key={p.id}
              id={p.id}
              name={p.name}
              org={p.org_name || p.specialization}
              city={p.city}
              type={p.type}
              bio={p.bio}
              languages={p.languages}
              fee={p.consultation_fee ?? undefined}
              online={p.online}
              in_person={p.in_person}
              pro_bono={p.pro_bono}
              onVerify={handleVerify}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
