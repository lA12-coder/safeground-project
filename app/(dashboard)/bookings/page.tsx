import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MyBookingsList } from '@/components/bookings/MyBookingsList';

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#6f5b4e] hover:text-[#92400E] mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[#2c241f]">My Sessions</h1>
          <p className="text-sm text-[#6f5b4e] mt-1">
            View all booked psychiatrist, counselor, and spiritual teacher sessions with status and ETB payment details.
          </p>
        </div>
        <MyBookingsList />
      </div>
    </div>
  );
}
