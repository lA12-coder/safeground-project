'use client';

import Link from 'next/link';
import { HabitLogForm } from '@/components/dashboard/HabitLogForm';
import { Shield, ArrowLeft } from 'lucide-react';

export default function LogPage() {
  const handleSubmit = (data: any) => {
    console.log('[v0] Habit log submitted:', data);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold text-primary">SafeGround</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 md:px-12 py-12 space-y-8">
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
