'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { MoodChart } from '@/components/dashboard/MoodChart';
import { AffirmationCard } from '@/components/dashboard/AffirmationCard';
import { KhatRiskBanner } from '@/components/dashboard/KhatRiskBanner';
import { ImmediateRelief } from '@/components/dashboard/ImmediateRelief';
import { EchoesOfSupport } from '@/components/dashboard/EchoesOfSupport';
import { PanicButton } from '@/components/layout/PanicButton';

const fallbackMoodData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  moodScore: 6 + (i % 4),
  urgeIntensity: 4 + (i % 3),
}));

type HabitHistoryItem = {
  log_date: string;
  mood_score: number;
  urge_intensity: number;
  khat_used_today?: boolean;
  khat_hours_ago?: number | null;
};

export default function DashboardPage() {
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, totalCleanDays: 0 });
  const [loggedToday, setLoggedToday] = useState(false);
  const [showKhatBanner, setShowKhatBanner] = useState(false);
  const [khatHoursAgo, setKhatHoursAgo] = useState(6);
  const [moodData, setMoodData] = useState(fallbackMoodData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePanic = useCallback(async () => {
    try {
      await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'dashboard' }),
      });
    } catch {
      setError('Could not log panic support, but the support tools are still available.');
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [streakResponse, historyResponse] = await Promise.all([
          fetch('/api/habits/streak'),
          fetch('/api/habits/history?days=30'),
        ]);

        if (!active) return;

        if (streakResponse.ok) {
          const data = await streakResponse.json();
          setStreakData({
            currentStreak: data.currentStreak ?? data.current_streak ?? 0,
            longestStreak: data.longestStreak ?? data.longest_streak ?? 0,
            totalCleanDays: data.totalCleanDays ?? data.total_clean_days ?? 0,
          });
        }

        if (historyResponse.ok) {
          const history = (await historyResponse.json()) as HabitHistoryItem[];
          if (history.length > 0) {
            setMoodData(history.map((item) => ({
              date: item.log_date,
              moodScore: item.mood_score ?? 0,
              urgeIntensity: item.urge_intensity ?? 0,
            })));

            const latest = history[history.length - 1];
            const today = new Date().toISOString().split('T')[0];
            setLoggedToday(latest.log_date === today);
            setKhatHoursAgo(latest.khat_hours_ago ?? 6);
            setShowKhatBanner(Boolean(latest.khat_used_today && latest.khat_hours_ago != null && latest.khat_hours_ago < 12));
          }
        }
      } catch {
        if (active) setError('Could not load your latest data. Showing fallback.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/50">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold text-primary">SafeGround</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider">Privacy Active</span>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8 space-y-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <KhatRiskBanner show={showKhatBanner} hoursSinceUse={khatHoursAgo} onPanic={handlePanic} />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 animate-pulse">
                  <div className="h-6 bg-surface-container-high rounded w-1/3 mb-4" />
                  <div className="h-24 bg-surface-container-high rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 animate-pulse">
                  <div className="h-6 bg-surface-container-high rounded w-1/2 mb-4" />
                  <div className="h-20 bg-surface-container-high rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <StreakCard {...streakData} />
              <MoodChart data={moodData} />

              {!loggedToday && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-8 bg-primary-container text-on-primary-container space-y-4 parchment-glow"
                >
                  <AlertCircle className="w-6 h-6" />
                  <h3 className="heading-md">Haven&apos;t logged today yet?</h3>
                  <p className="body-md opacity-90">
                    Your daily check-in helps us understand your patterns and support you better.
                  </p>
                  <Link href="/log" className="inline-block btn-primary">Log Your Day</Link>
                </motion.div>
              )}
            </div>

            <div className="space-y-8">
              <AffirmationCard moodScore={7} urgeIntensity={3} />
              <ImmediateRelief />
              <EchoesOfSupport />
            </div>
          </motion.div>
        )}
      </main>

      <PanicButton variant="fab" onActivate={handlePanic} />
    </div>
  );
}
