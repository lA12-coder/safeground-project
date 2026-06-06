'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  Loader2,
  ArrowRight,
  Church,
  Stethoscope,
  ExternalLink,
} from 'lucide-react';
import { formatBookingStatus, formatEtb, formatPaymentStatus } from '@/lib/billing/currency';

type UserBooking = {
  id: string;
  provider_id: string;
  provider_name: string;
  scheduled_at: string;
  session_type: string;
  duration_minutes: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  amount_etb: number | null;
  amount_label: string;
  booking_category: 'clinical' | 'spiritual' | null;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
};

type Tab = 'upcoming' | 'past' | 'all';

function statusStyle(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-amber-50 text-amber-800 border-amber-200';
  }
}

function paymentStyle(status: string) {
  switch (status) {
    case 'paid':
      return 'text-green-700';
    case 'waived':
      return 'text-[#92400E]';
    default:
      return 'text-amber-700';
  }
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  };
}

export function MyBookingsList() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Could not load sessions');
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch {
      setError('Could not load your booked sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();

  const filtered = useMemo(() => {
    if (tab === 'all') return bookings;
    if (tab === 'upcoming') {
      return bookings.filter(
        (b) => new Date(b.scheduled_at).getTime() >= now && b.status !== 'cancelled'
      );
    }
    return bookings.filter(
      (b) => new Date(b.scheduled_at).getTime() < now || b.status === 'cancelled' || b.status === 'completed'
    );
  }, [bookings, tab, now]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#92400E]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <button type="button" onClick={load} className="text-sm font-semibold text-[#92400E] hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['upcoming', 'past', 'all'] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              tab === key
                ? 'bg-[#92400E] text-white border-[#92400E]'
                : 'bg-white text-[#6f5b4e] border-[#e5e0db] hover:border-[#92400E]/40'
            }`}
          >
            {key === 'upcoming' ? 'Upcoming' : key === 'past' ? 'Past' : 'All sessions'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#e5e0db] rounded-xl p-10 text-center space-y-4">
          <Calendar className="w-12 h-12 text-[#92400E]/40 mx-auto" />
          <h2 className="font-serif text-lg font-bold text-[#2c241f]">No sessions yet</h2>
          <p className="text-sm text-[#6f5b4e] max-w-sm mx-auto">
            Book a psychiatrist, counselor, or spiritual teacher from the directory. All fees are shown in Ethiopian Birr (ETB).
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 bg-[#92400E] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#7a360a]"
            >
              Browse providers <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/spiritual"
              className="inline-flex items-center gap-1.5 border border-[#e5e0db] text-[#6f5b4e] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f6f5f1]"
            >
              Faith support
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const when = formatWhen(booking.scheduled_at);
            const isSpiritual = booking.booking_category === 'spiritual';
            const CategoryIcon = isSpiritual ? Church : Stethoscope;

            return (
              <article
                key={booking.id}
                className="bg-white border border-[#e5e0db] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyle(booking.status)}`}
                      >
                        {formatBookingStatus(booking.status)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6f5b4e] bg-[#f6f5f1] px-2 py-0.5 rounded-full">
                        <CategoryIcon className="w-3 h-3" />
                        {isSpiritual ? 'Spiritual' : 'Clinical'}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#2c241f]">{booking.provider_name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6f5b4e]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#92400E]" />
                        {when.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#92400E]" />
                        {when.time}
                      </span>
                      <span className="capitalize">{booking.session_type.replace(/-/g, ' ')}</span>
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-[#6f5b4e] line-clamp-2">{booking.notes}</p>
                    )}
                  </div>

                  <div className="sm:text-right space-y-2 shrink-0">
                    <p className="text-xl font-bold text-[#92400E]">{booking.amount_label}</p>
                    <p className={`text-xs font-semibold ${paymentStyle(booking.payment_status)}`}>
                      {formatPaymentStatus(booking.payment_status)}
                      {booking.payment_method ? ` · ${booking.payment_method}` : ''}
                    </p>
                    {booking.meeting_link && booking.status !== 'cancelled' && (
                      <a
                        href={booking.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:underline"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join session
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs text-center text-[#9a8a7d]">
        All session fees on SafeGround are charged in Ethiopian Birr (ETB). Platform fee: 20%.
      </p>
    </div>
  );
}

export { formatEtb };
