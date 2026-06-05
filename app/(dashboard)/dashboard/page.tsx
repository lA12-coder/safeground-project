'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Shield, Trophy, Calendar, Sparkles, Clock,
  CheckCircle, Target, AlertCircle, MessageCircle,
  Globe, UserCheck, Zap, TrendingUp, TrendingDown, Minus,
  Lightbulb, ArrowRight, ChevronRight, BookOpen
} from 'lucide-react';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { MoodChart } from '@/components/dashboard/MoodChart';
import { AffirmationCard } from '@/components/dashboard/AffirmationCard';
import { KhatRiskBanner } from '@/components/dashboard/KhatRiskBanner';
import { ImmediateRelief } from '@/components/dashboard/ImmediateRelief';
import { EchoesOfSupport } from '@/components/dashboard/EchoesOfSupport';
import { PanicButton } from '@/components/layout/PanicButton';
import { STREAK_MILESTONES } from '@/lib/utils/streakUtils';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const fallbackMoodData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  moodScore: 6 + (i % 4),
  urgeIntensity: 4 + (i % 3),
}));

type HabitHistoryItem = {
  log_date: string;
  mood_score: number;
  urge_intensity: number;
  stress_level?: number;
  khat_used_today?: boolean;
  khat_hours_ago?: number | null;
  relapsed?: boolean;
};

type MoodDataPoint = {
  date: string;
  moodScore: number;
  urgeIntensity: number;
};

export default function DashboardPage() {
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, totalCleanDays: 0 });
  const [loggedToday, setLoggedToday] = useState(false);
  const [showKhatBanner, setShowKhatBanner] = useState(false);
  const [khatHoursAgo, setKhatHoursAgo] = useState(6);
  const [moodData, setMoodData] = useState<MoodDataPoint[]>(fallbackMoodData);
  const [historyData, setHistoryData] = useState<HabitHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataEmpty, setIsDataEmpty] = useState(false);

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
          setHistoryData(history);

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
            setIsDataEmpty(false);
          } else {
            setIsDataEmpty(true);
          }
        }
      } catch {
        if (active) {
          setError('Could not load your latest data. Showing fallback.');
          setIsDataEmpty(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => { active = false; };
  }, []);

  const daysLogged = useMemo(() => {
    if (historyData.length === 0) return 0;
    return new Set(historyData.map(h => h.log_date)).size;
  }, [historyData]);

  const latestEntry = useMemo(() => {
    if (historyData.length === 0) return null;
    return historyData[historyData.length - 1];
  }, [historyData]);

  const insights = useMemo(() => {
    if (moodData.length === 0) return null;

    const dayScores: Record<string, number[]> = {};
    const dayUrges: Record<string, number[]> = {};

    moodData.forEach(item => {
      const day = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayScores[day]) dayScores[day] = [];
      dayScores[day].push(item.moodScore);
      if (!dayUrges[day]) dayUrges[day] = [];
      dayUrges[day].push(item.urgeIntensity);
    });

    let bestDay = '';
    let bestAvg = 0;
    Object.entries(dayScores).forEach(([day, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestAvg) { bestAvg = avg; bestDay = day; }
    });

    const half = Math.max(Math.floor(moodData.length / 2), 1);
    const firstHalf = moodData.slice(0, half);
    const secondHalf = moodData.slice(-half);
    const firstAvg = firstHalf.reduce((s, d) => s + d.moodScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + d.moodScore, 0) / secondHalf.length;
    const diff = secondAvg - firstAvg;
    const trend = diff > 0.5 ? 'improving' : diff < -0.5 ? 'declining' : 'stable';

    let worstUrgeDay = '';
    let worstUrgeAvg = 0;
    Object.entries(dayUrges).forEach(([day, urges]) => {
      const avg = urges.reduce((a, b) => a + b, 0) / urges.length;
      if (avg > worstUrgeAvg) { worstUrgeAvg = avg; worstUrgeDay = day; }
    });

    let recommendation = '';
    if (trend === 'declining') {
      recommendation = 'Your mood has been declining. Consider reaching out to a counselor or using the Panic Button when urges spike.';
    } else if (trend === 'improving') {
      recommendation = 'Your mood is improving! Keep up the great work by maintaining your daily check-in habit.';
    } else if (worstUrgeDay) {
      recommendation = `Your urges tend to be higher on ${worstUrgeDay}s. Try scheduling extra support or activities on those days.`;
    } else {
      recommendation = 'Try logging your triggers consistently to identify patterns that affect your recovery.';
    }

    return {
      bestDay, bestAvg: Math.round(bestAvg * 10) / 10, trend,
      worstUrgeDay, worstUrgeAvg: Math.round(worstUrgeAvg * 10) / 10, recommendation,
    };
  }, [moodData]);

  const nextMilestone = STREAK_MILESTONES.find(m => m > streakData.currentStreak) ?? 90;
  const achievedMilestones = STREAK_MILESTONES.filter(m => m <= streakData.currentStreak);
  const recoveryScore = nextMilestone > 0 ? Math.min(Math.round((streakData.currentStreak / nextMilestone) * 100), 100) : 0;

  const recentActivity = useMemo(() => {
    return historyData.slice(-5).reverse();
  }, [historyData]);

  const TrendIcon = insights?.trend === 'improving' ? TrendingUp : insights?.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = insights?.trend === 'improving' ? 'text-green-600' : insights?.trend === 'declining' ? 'text-red-600' : 'text-amber-600';

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/50">
        <div className="px-4 sm:px-6 md:px-12 py-3 flex justify-between items-center max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-serif text-xl font-bold text-primary">SafeGround</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-3 px-3 py-1 bg-primary-container/20 text-primary rounded-full border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Recovery Intelligence Center</span>
            </span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold">{streakData.currentStreak}d</span>
              <span className="mx-1">·</span>
              <span>Total: {streakData.totalCleanDays}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary-container/40 text-on-secondary-container px-3 py-1.5 rounded-full border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Privacy Active</span>
            </div>
            <Link
              href="/log"
              className="hidden md:inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-all active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Log Day
            </Link>
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

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 animate-pulse">
                  <div className="h-4 bg-surface-container-high rounded w-1/2 mb-3" />
                  <div className="h-8 bg-surface-container-high rounded w-1/3 mb-2" />
                  <div className="h-3 bg-surface-container-high rounded w-2/3" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 animate-pulse">
                    <div className="h-5 bg-surface-container-high rounded w-1/3 mb-4" />
                    <div className="h-32 bg-surface-container-high rounded" />
                  </div>
                ))}
              </div>
              <div className="space-y-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 animate-pulse">
                    <div className="h-5 bg-surface-container-high rounded w-1/2 mb-4" />
                    <div className="h-20 bg-surface-container-high rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isDataEmpty ? (
          <motion.div {...fadeInUp} className="card p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="heading-lg">Start Your Recovery Journey</h2>
            <p className="body-md max-w-md mx-auto">
              Begin by logging your first daily check-in. Each entry helps you track patterns and build momentum toward your goals.
            </p>
            <Link href="/log" className="inline-flex items-center gap-2 btn-primary">
              Log Your First Day
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Current Streak</span>
                  <Flame className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-serif font-bold text-primary">{streakData.currentStreak}</div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">days of strength</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-green-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Clean Days</span>
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-3xl font-serif font-bold text-green-700">{streakData.totalCleanDays}</div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">total recovered</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Best Streak</span>
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-serif font-bold text-primary">{streakData.longestStreak}</div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">personal best</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 border-l-4 border-l-blue-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Days Logged</span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-serif font-bold text-blue-700">{daysLogged}</div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">of last 30 days</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-8">
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
                  <StreakCard {...streakData} />
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
                  <MoodChart data={moodData} />
                </motion.div>

                {insights && (
                  <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }} className="card p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="font-serif text-lg font-semibold text-on-surface">Today&apos;s Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Best Day</span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface">{insights.bestDay}</p>
                        <p className="text-[11px] text-on-surface-variant">Highest average mood ({insights.bestAvg}/10)</p>
                      </div>
                      <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Mood Trend</span>
                        </div>
                        <p className={`text-sm font-semibold capitalize ${trendColor}`}>{insights.trend}</p>
                        <p className="text-[11px] text-on-surface-variant">Compared to previous period</p>
                      </div>
                      {insights.worstUrgeDay && (
                        <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-error" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Urge Pattern</span>
                          </div>
                          <p className="text-sm font-semibold text-on-surface">{insights.worstUrgeDay}</p>
                          <p className="text-[11px] text-on-surface-variant">Highest urges avg ({insights.worstUrgeAvg}/10)</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Recommendation</p>
                          <p className="text-sm text-on-surface leading-relaxed">{insights.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {loggedToday && latestEntry ? (
                  <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }} className="card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-serif text-lg font-semibold text-on-surface">Today&apos;s Summary</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-surface-container-low rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary">{latestEntry.mood_score}</div>
                        <div className="text-xs text-on-surface-variant mt-1">Mood</div>
                      </div>
                      <div className="bg-surface-container-low rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{latestEntry.urge_intensity}</div>
                        <div className="text-xs text-on-surface-variant mt-1">Urge</div>
                      </div>
                      <div className="bg-surface-container-low rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{latestEntry.stress_level ?? '-'}</div>
                        <div className="text-xs text-on-surface-variant mt-1">Stress</div>
                      </div>
                    </div>
                    {latestEntry.khat_used_today && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                        Khat logged — {latestEntry.khat_hours_ago ?? '?'} hours ago
                      </p>
                    )}
                    {latestEntry.relapsed && (
                      <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                        Relapse logged today. Reach out for support.
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8 bg-primary-container/10 border-primary/30 space-y-4 parchment-glow"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      <h3 className="heading-md text-on-surface">Haven&apos;t logged today yet?</h3>
                    </div>
                    <p className="body-md opacity-90">
                      Your daily check-in helps us understand your patterns and support you better.
                    </p>
                    <Link href="/log" className="inline-flex items-center gap-2 btn-primary">
                      <BookOpen className="w-4 h-4" />
                      Log Your Day
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="space-y-8">
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
                  <AffirmationCard
                    moodScore={latestEntry?.mood_score ?? 7}
                    urgeIntensity={latestEntry?.urge_intensity ?? 3}
                  />
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
                  <ImmediateRelief />
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
                  <EchoesOfSupport />
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }} className="card p-5 space-y-3">
                  <h3 className="label-caps">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/log" className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors group">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-on-surface">Log Day</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link href="/chat" className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors group">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-on-surface">Chat Room</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link href="/support/professional" className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors group">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-on-surface">Directory</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link href="/guardian" className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors group">
                      <div className="flex items-center gap-3">
                        <UserCheck className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-on-surface">Guardian</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link href="/panic" className="flex items-center justify-between p-3 rounded-lg bg-error/10 hover:bg-error/20 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-error" />
                        <span className="text-sm font-medium text-error">Panic Support</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-error group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }} className="card p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold text-on-surface">Recent Activity</h3>
                </div>
                {recentActivity.length > 0 ? (
                  <div className="space-y-0">
                    {recentActivity.map((entry, idx) => {
                      const date = new Date(entry.log_date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div key={entry.log_date} className="flex gap-4 pb-5 relative last:pb-0">
                          {idx < recentActivity.length - 1 && (
                            <div className="absolute left-[7px] top-5 bottom-0 w-px bg-outline-variant" />
                          )}
                          <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 border-2 ${
                            entry.relapsed
                              ? 'bg-error border-error'
                              : entry.mood_score >= 7
                              ? 'bg-green-500 border-green-500'
                              : entry.mood_score >= 4
                              ? 'bg-primary border-primary'
                              : 'bg-amber-500 border-amber-500'
                          }`} />
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-on-surface">
                                {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              {entry.relapsed && (
                                <span className="text-[10px] font-semibold bg-error/10 text-error px-1.5 py-0.5 rounded">Relapse</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                              <span>Mood: {entry.mood_score}</span>
                              <span>Urge: {entry.urge_intensity}</span>
                              {entry.stress_level != null && <span>Stress: {entry.stress_level}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant text-center py-6">No activity recorded yet.</p>
                )}
              </motion.div>

              <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }} className="card p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold text-on-surface">Milestones</h3>
                </div>

                <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Recovery Score</span>
                    <span className="text-lg font-bold text-primary">{recoveryScore}%</span>
                  </div>
                  <div className="w-full bg-surface-container-lowest rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${recoveryScore}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {streakData.currentStreak} of {nextMilestone} days toward next milestone
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Achieved</span>
                    <span className="text-[11px] text-on-surface-variant">{achievedMilestones.length}/{STREAK_MILESTONES.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STREAK_MILESTONES.map((milestone) => {
                      const achieved = achievedMilestones.includes(milestone);
                      return (
                        <div
                          key={milestone}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            achieved
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : streakData.currentStreak < milestone && milestone === nextMilestone
                              ? 'bg-primary-container/10 text-primary border border-primary/30'
                              : 'bg-surface-container-low text-on-surface-variant border border-outline-variant'
                          }`}
                        >
                          {achieved ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : streakData.currentStreak < milestone && milestone === nextMilestone ? (
                            <Target className="w-3 h-3" />
                          ) : (
                            <span className="w-3 h-3 rounded-full border border-on-surface-variant/40" />
                          )}
                          {milestone}d
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
              <KhatRiskBanner show={showKhatBanner} hoursSinceUse={khatHoursAgo} onPanic={handlePanic} />
            </motion.div>
          </>
        )}
      </main>

      <PanicButton variant="fab" onActivate={handlePanic} />
    </div>
  );
}
