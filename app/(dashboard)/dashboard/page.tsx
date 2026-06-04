'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { MoodChart } from '@/components/dashboard/MoodChart';
import { AffirmationCard } from '@/components/dashboard/AffirmationCard';
import { KhatRiskBanner } from '@/components/dashboard/KhatRiskBanner';
import { ImmediateRelief } from '@/components/dashboard/ImmediateRelief';
import { EchoesOfSupport } from '@/components/dashboard/EchoesOfSupport';
import { PanicButton } from '@/components/layout/PanicButton';
import { Shield, AlertCircle } from 'lucide-react';

// Mock data - replace with real data from API
const mockMoodData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  moodScore: Math.floor(Math.random() * 10) + 1,
  urgeIntensity: Math.floor(Math.random() * 10) + 1,
}));

export default function DashboardPage() {
  const [streakData, setStreakData] = useState({
    currentStreak: 7,
    longestStreak: 14,
    totalCleanDays: 21,
  });

  const [loggedToday, setLoggedToday] = useState(false);
  const [showKhatBanner, setShowKhatBanner] = useState(false);

  useEffect(() => {
    // Fetch streak data from API
    // const fetchStreakData = async () => {
    //   const response = await fetch('/api/habits/streak');
    //   if (response.ok) {
    //     const data = await response.json();
    //     setStreakData(data);
    //   }
    // };
    // fetchStreakData();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold text-primary">SafeGround</span>
            <div className="hidden md:flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full border border-outline-variant ml-4">
              <span className="text-xs font-semibold text-on-surface-variant">Session:</span>
              <code className="text-xs font-bold text-primary">SG-ANON-7742</code>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full border border-secondary/20">
              <span className="text-xs font-semibold uppercase tracking-wider">Privacy Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* Khat Risk Banner */}
        <KhatRiskBanner
          show={showKhatBanner}
          hoursSinceUse={6}
          onPanic={() => {
            /* trigger panic */
          }}
        />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Streak + Chart */}
          <div className="lg:col-span-2 space-y-8">
            <StreakCard {...streakData} />
            <MoodChart data={mockMoodData} />

            {/* Today's Check-in CTA */}
            {!loggedToday && (
              <div className="card p-8 bg-primary-container text-on-primary-container space-y-4 parchment-glow">
                <AlertCircle className="w-6 h-6" />
                <h3 className="heading-md">Haven't logged today yet?</h3>
                <p className="body-md opacity-90">
                  Your daily check-in helps us understand your patterns and support you better.
                </p>
                <Link href="/dashboard/log" className="inline-block btn-primary bg-primary-fixed text-on-primary-fixed">
                  Log Your Day
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Affirmation, Relief, Support */}
          <div className="space-y-8">
            <AffirmationCard moodScore={7} urgeIntensity={3} />
            <ImmediateRelief />
            <EchoesOfSupport />
          </div>
        </div>
      </main>

      <PanicButton />
    </div>
  );
}
