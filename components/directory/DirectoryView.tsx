'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DirectoryProvider } from '@/lib/directory/types';
import { ProviderCard } from './ProviderCard';
import { BookingFlow } from './BookingFlow';

type Tab = 'clinical' | 'faith';

const LANGUAGES = [
  { value: 'any', label: 'Any Language' },
  { value: 'amharic', label: 'Amharic' },
  { value: 'english', label: 'English' },
  { value: 'oromifa', label: 'Oromifa' },
  { value: 'tigrinya', label: 'Tigrinya' },
];

const DENOMINATIONS = ['All', 'Orthodox', 'Protestant', 'Muslim'] as const;

export function DirectoryView() {
  const [tab, setTab] = useState<Tab>('clinical');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('any');
  const [sessionOnline, setSessionOnline] = useState(true);
  const [sessionInPerson, setSessionInPerson] = useState(false);
  const [proBonoOnly, setProBonoOnly] = useState(false);
  const [denomination, setDenomination] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [providers, setProviders] = useState<DirectoryProvider[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingProvider, setBookingProvider] = useState<DirectoryProvider | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      type: tab,
      page: String(page),
      limit: '3',
    });
    if (city) params.set('city', city);
    if (language !== 'any') params.set('language', language);
    if (sessionOnline) params.set('online', 'true');
    if (sessionInPerson) params.set('in_person', 'true');
    if (proBonoOnly) params.set('pro_bono', 'true');
    if (tab === 'faith' && denomination !== 'All') {
      params.set('denomination', denomination.toLowerCase());
    }

    const res = await fetch(`/api/directory?${params}`);
    const data = await res.json();
    setProviders(data.providers ?? []);
    setTotalPages(data.pagination?.totalPages ?? 1);
    setLoading(false);
  }, [tab, city, language, sessionOnline, sessionInPerson, proBonoOnly, denomination, page]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    setPage(1);
  }, [tab, city, language, sessionOnline, sessionInPerson, proBonoOnly, denomination]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-8">
        <header className="space-y-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-on-surface">
            Healing through Connection
          </h1>
          <p className="body-lg max-w-2xl">
            Find a path forward with culturally responsive clinical care or grounded spiritual
            guidance. Your journey is private and secure.
          </p>

          <div className="flex gap-2 p-1 bg-surface-container rounded-full w-fit">
            <button
              type="button"
              onClick={() => setTab('clinical')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                tab === 'clinical'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Clinical Support
            </button>
            <button
              type="button"
              onClick={() => setTab('faith')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                tab === 'faith'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Faith-Based Programs
            </button>
          </div>
        </header>

        {tab === 'faith' && (
          <div className="flex flex-wrap gap-2">
            {DENOMINATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDenomination(d)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                  denomination === d
                    ? 'border-secondary bg-secondary-container text-on-secondary-container'
                    : 'border-outline-variant text-on-surface-variant'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        <div className="card p-6 md:p-8 space-y-5 parchment-glow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <label className="label-caps block mb-2">City or Region</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Addis Ababa, Hawassa…"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label-caps block mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-caps block mb-2">Session Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSessionOnline((v) => !v)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-2 ${
                    sessionOnline
                      ? 'border-on-surface bg-surface-container text-on-surface'
                      : 'border-outline-variant text-on-surface-variant'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setSessionInPerson((v) => !v)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-2 ${
                    sessionInPerson
                      ? 'border-on-surface bg-surface-container text-on-surface'
                      : 'border-outline-variant text-on-surface-variant'
                  }`}
                >
                  In-person
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between lg:justify-end gap-3">
              <span className="text-sm font-medium text-on-surface">Pro-bono only</span>
              <button
                type="button"
                role="switch"
                aria-checked={proBonoOnly}
                onClick={() => setProBonoOnly((v) => !v)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  proBonoOnly ? 'bg-secondary' : 'bg-outline-variant'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    proBonoOnly ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-on-surface-variant py-12">Loading providers…</p>
        ) : providers.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12">No providers match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} onAction={setBookingProvider} />
            ))}
          </div>
        )}

        <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-full hover:bg-surface-container disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-full text-sm font-semibold ${
                  page === n
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {n}
              </button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="text-on-surface-variant">…</span>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className={`w-10 h-10 rounded-full text-sm font-semibold ${
                  page === totalPages
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 rounded-full hover:bg-surface-container disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {bookingProvider && (
        <BookingFlow provider={bookingProvider} onClose={() => setBookingProvider(null)} />
      )}
    </div>
  );
}
