'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, MapPin, Globe, Monitor, User, Calendar, Search, ChevronRight, X, SlidersHorizontal } from 'lucide-react'

interface Provider {
  id: string
  display_name: string
  provider_type: string
  organization: string
  bio_text: string
  city: string
  languages: string[]
  online_available: boolean
  in_person_available: boolean
  consultation_fee: number
  is_pro_bono: boolean
  is_verified: boolean
  specializations: string[]
  denomination: string
}

const FILTER_TABS = ['All', 'Clinical', 'Faith-Based'] as const
type FilterTab = typeof FILTER_TABS[number]

const ALL_CITIES = ['Addis Ababa', 'Hawassa', 'Dire Dawa', 'Adama', 'Bahir Dar', 'Mekelle', 'Jimma']

export default function DirectoryPage() {
  const supabase = createClient()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [bookingModal, setBookingModal] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [cityFilter, setCityFilter] = useState('')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [proBonoOnly, setProBonoOnly] = useState(false)

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true)
      const typeParam = activeTab === 'Clinical' ? 'psychiatrist,counselor'
        : activeTab === 'Faith-Based' ? 'religious_org,religious_individual'
        : undefined

      let url = '/api/directory?limit=50'
      if (typeParam) url += `&type=${typeParam}`

      try {
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setProviders(data.providers || data || [])
        } else {
          const { data: direct } = await supabase
            .from('providers')
            .select('*')
            .eq('is_verified', true)
            .eq('is_active', true)
            .limit(50)
          if (direct) setProviders(direct as Provider[])
        }
      } catch {
        const { data: direct } = await supabase
          .from('providers')
          .select('*')
          .eq('is_verified', true)
          .eq('is_active', true)
          .limit(50)
        if (direct) setProviders(direct as Provider[])
      }
      setLoading(false)
    }
    fetchProviders()
  }, [activeTab, supabase])

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesSearch = p.display_name?.toLowerCase().includes(term) ||
          p.city?.toLowerCase().includes(term) ||
          p.organization?.toLowerCase().includes(term) ||
          p.languages?.some(l => l.toLowerCase().includes(term))
        if (!matchesSearch) return false
      }
      if (cityFilter && p.city !== cityFilter) return false
      if (onlineOnly && !p.online_available) return false
      if (proBonoOnly && !p.is_pro_bono) return false
      return true
    })
  }, [providers, searchTerm, cityFilter, onlineOnly, proBonoOnly])

  const typeLabel = (t: string) => {
    switch (t) {
      case 'psychiatrist': return { label: 'Psychiatrist', color: 'bg-blue-100 text-blue-800' }
      case 'counselor': return { label: 'Counselor', color: 'bg-purple-100 text-purple-800' }
      case 'religious_org': return { label: 'Faith Organization', color: 'bg-amber-100 text-amber-800' }
      case 'religious_individual': return { label: 'Faith Guide', color: 'bg-green-100 text-green-800' }
      default: return { label: t, color: 'bg-surface-container-high text-on-surface-variant' }
    }
  }

  async function handleBook(providerId: string) {
    if (!bookingDate) return
    const supabase = createClient()
    await supabase.from('telehealth_bookings').insert({
      provider_id: providerId,
      booking_type: 'online',
      scheduled_at: new Date(bookingDate).toISOString(),
      status: 'pending',
    })
    setBookingModal(false)
    setBookingDate('')
    setSelectedProvider(null)
    alert('Booking submitted! Check your dashboard for confirmation.')
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-primary">Directory</h1>
          </div>
          <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Privacy Active
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="font-serif text-3xl font-bold text-on-surface">Healing through Connection</h2>
          <p className="mt-2 text-on-surface-variant max-w-2xl">
            Find a path forward with culturally responsive clinical care or grounded spiritual guidance.
          </p>
        </section>

        {/* Tabs, Filters & Search */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition ${
                    activeTab === tab
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                  showFilters || cityFilter || onlineOnly || proBonoOnly
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(cityFilter || onlineOnly || proBonoOnly) && (
                  <span className="w-2 h-2 rounded-full bg-error" />
                )}
              </button>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, city, language..."
                  className="w-full rounded-full border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">City:</span>
                <select
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                  className="text-sm border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-lowest"
                >
                  <option value="">All Cities</option>
                  {ALL_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={e => setOnlineOnly(e.target.checked)}
                  className="rounded border-outline-variant text-primary"
                />
                Online Only
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={proBonoOnly}
                  onChange={e => setProBonoOnly(e.target.checked)}
                  className="rounded border-outline-variant text-primary"
                />
                Free / Pro-bono
              </label>
              {(cityFilter || onlineOnly || proBonoOnly) && (
                <button
                  onClick={() => { setCityFilter(''); setOnlineOnly(false); setProBonoOnly(false) }}
                  className="text-xs text-error font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Provider Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-surface-container-high rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No providers found</p>
            <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((provider) => {
              const t = typeLabel(provider.provider_type)
              return (
                <div
                  key={provider.id}
                  className="card p-6 space-y-4 cursor-pointer hover:shadow-lg transition"
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-lg">
                        {provider.display_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface">{provider.display_name}</h3>
                        {provider.organization && (
                          <p className="text-xs text-on-surface-variant">{provider.organization}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${t.color}`}>
                      {t.label}
                    </span>
                  </div>

                  {provider.bio_text && (
                    <p className="text-sm text-on-surface-variant line-clamp-3">{provider.bio_text}</p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant">
                    {provider.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {provider.city}
                      </span>
                    )}
                    {provider.languages && provider.languages.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {provider.languages.join(', ')}
                      </span>
                    )}
                    {provider.online_available && (
                      <span className="flex items-center gap-1 text-green-700">
                        <Monitor className="w-3 h-3" /> Online
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                    <span className="font-bold text-primary">
                      {provider.is_pro_bono ? 'Free' : `$${provider.consultation_fee || '—'}`}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                      View Profile <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedProvider(null)}>
          <div className="bg-surface rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-bold text-xl">
                  {selectedProvider.display_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">{selectedProvider.display_name}</h3>
                  <span className="text-sm text-on-surface-variant">{selectedProvider.organization}</span>
                </div>
              </div>
              <button onClick={() => setSelectedProvider(null)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProvider.bio_text && (
              <p className="text-sm text-on-surface-variant leading-relaxed">{selectedProvider.bio_text}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedProvider.city && (
                <div className="flex items-center gap-2 text-on-surface-variant"><MapPin className="w-4 h-4" /> {selectedProvider.city}</div>
              )}
              {selectedProvider.languages && (
                <div className="flex items-center gap-2 text-on-surface-variant"><Globe className="w-4 h-4" /> {selectedProvider.languages.join(', ')}</div>
              )}
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Monitor className="w-4 h-4" /> {selectedProvider.online_available ? 'Online' : 'In-person'}
              </div>
              <div className="flex items-center gap-2 font-bold text-primary">
                <span>{selectedProvider.is_pro_bono ? 'Free (Pro-bono)' : `$${selectedProvider.consultation_fee || '—'} / session`}</span>
              </div>
            </div>

            {selectedProvider.specializations && selectedProvider.specializations.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-on-surface mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.specializations.map((s) => (
                    <span key={s} className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface-variant">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedProvider.provider_type?.startsWith('religious') && selectedProvider.denomination && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Denomination:</strong> {selectedProvider.denomination}
              </div>
            )}

            <button
              onClick={() => setBookingModal(true)}
              className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition"
            >
              {selectedProvider.provider_type?.startsWith('religious') ? 'Join Program' : 'Book Session'}
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setBookingModal(false); setBookingDate('') }}>
          <div className="bg-surface rounded-2xl p-8 max-w-md w-full space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface">Book Session</h3>
              <button onClick={() => { setBookingModal(false); setBookingDate('') }} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant">
              With <strong className="text-on-surface">{selectedProvider.display_name}</strong>
            </p>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-on-surface">Select Date & Time</span>
              <input
                type="datetime-local"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
              />
            </label>
            <button
              onClick={() => handleBook(selectedProvider.id)}
              disabled={!bookingDate}
              className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
