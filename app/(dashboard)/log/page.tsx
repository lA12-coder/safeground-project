'use client';

import Link from 'next/link';
import { HabitLogForm } from '@/components/dashboard/HabitLogForm';
import { ArrowLeft } from 'lucide-react';

export default function LogPage() {
  const handleSubmit = (data: Record<string, unknown>) => {
    console.log('[log] Habit log submitted:', data);
  };

  return (
    <div className="page-shell">
      <main className="max-w-2xl mx-auto px-6 md:px-12 py-8 md:py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="heading-hero text-on-surface">How is your heart today?</h1>
          <p className="body-lg text-on-surface-variant">
            Your honesty here helps us understand your patterns and support you better. Everything you share is encrypted and private.
          </p>
        </div>

        <HabitLogForm onSubmit={handleSubmit} />

        <div className="flex items-center justify-between pt-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
