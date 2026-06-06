'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Shield, Trophy, Calendar, Sparkles, Clock,
  CheckCircle, Target, AlertCircle, MessageCircle,
  Globe, UserCheck, Zap, TrendingUp, TrendingDown, Minus,
  Lightbulb, ArrowRight, BookOpen, Gem, BarChart3,
} from 'lucide-react';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { MoodChart } from '@/components/dashboard/MoodChart';
import { AffirmationCard } from '@/components/dashboard/AffirmationCard';
import { KhatRiskBanner } from '@/components/dashboard/KhatRiskBanner';
import { ImmediateRelief } from '@/components/dashboard/ImmediateRelief';
import { EchoesOfSupport } from '@/components/dashboard/EchoesOfSupport';
import { STREAK_MILESTONES } from '@/lib/utils/streakUtils';
import { KpiCard } from '@/components/ui/KpiCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';

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
          const currentStreak = data.currentStreak ?? data.current_streak ?? 0;
          const longestStreak = data.longestStreak ?? data.longest_streak ?? 0;
          const totalCleanDays = data.totalCleanDays ?? data.total_clean_days ?? 0;
          setStreakData({ currentStreak, longestStreak, totalCleanDays });
          if (currentStreak > 0 || totalCleanDays > 0) {
            setIsDataEmpty(false);
          }
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

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchDashboardData();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
    };
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
    <div className="min-h-screen bg-[#f6f5f1]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8 space-y-6">
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#e5e0db]/30 p-5 animate-pulse">
                  <div className="h-4 bg-[#e5e0db] rounded w-1/2 mb-3" />
                  <div className="h-8 bg-[#e5e0db] rounded w-1/3 mb-2" />
                  <div className="h-3 bg-[#e5e0db] rounded w-2/3" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#e5e0db]/30 p-6 animate-pulse">
                    <div className="h-5 bg-[#e5e0db] rounded w-1/3 mb-4" />
                    <div className="h-32 bg-[#e5e0db] rounded" />
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#e5e0db]/30 p-6 animate-pulse">
                    <div className="h-5 bg-[#e5e0db] rounded w-1/2 mb-4" />
                    <div className="h-20 bg-[#e5e0db] rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isDataEmpty ? (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="Start Your Recovery Journey"
            description="Begin by logging your first daily check-in. Each entry helps you track patterns and build momentum toward your goals."
            action={
              <Link href="/log" className="inline-flex items-center gap-2 bg-[#92400E] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#a04e14] transition-colors">
                Log Your First Day <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
        ) : (
          <>
            {/* Hero Recovery Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#fdf6ed] to-white border border-[#e5e0db] rounded-xl shadow-sm p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-6 h-6 text-[#92400E]" />
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2c241f]">
                      {streakData.currentStreak} days of strength
                    </h1>
                  </div>
                  <p className="text-[#6f5b4e]">You&apos;re closer to your {nextMilestone}-day goal. Keep going.</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Gem className="w-4 h-4 text-[#92400E]" />
                      <span className="font-semibold text-[#2c241f]">Recovery Score</span>
                      <span className="text-[#92400E] font-bold">{recoveryScore}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Target className="w-4 h-4 text-[#16a34a]" />
                      <span className="text-[#6f5b4e]">{streakData.currentStreak} / {nextMilestone} days</span>
                    </div>
                  </div>
                  <div className="mt-4 max-w-xs">
                    <ProgressBar value={recoveryScore} color="amber" size="md" showLabel />
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div className="text-center px-4 py-3 bg-white rounded-xl border border-[#e5e0db] shadow-sm">
                    <div className="text-2xl font-bold text-[#92400E]">{streakData.currentStreak}</div>
                    <div className="text-[10px] text-[#6f5b4e] font-medium">Current</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-white rounded-xl border border-[#e5e0db] shadow-sm">
                    <div className="text-2xl font-bold text-[#16a34a]">{streakData.longestStreak}</div>
                    <div className="text-[10px] text-[#6f5b4e] font-medium">Best</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-white rounded-xl border border-[#e5e0db] shadow-sm">
                    <div className="text-2xl font-bold text-[#2563eb]">{streakData.totalCleanDays}</div>
                    <div className="text-[10px] text-[#6f5b4e] font-medium">Total</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div {...fadeInUp} transition={{ duration: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard
                label="Current Streak"
                value={`${streakData.currentStreak}d`}
                icon={<Flame className="w-4 h-4" />}
                accentColor="amber"
                subtitle="days of strength"
              />
              <KpiCard
                label="Clean Days"
                value={streakData.totalCleanDays}
                icon={<Shield className="w-4 h-4" />}
                accentColor="green"
                subtitle="total recovered"
              />
              <KpiCard
                label="Best Streak"
                value={`${streakData.longestStreak}d`}
                icon={<Trophy className="w-4 h-4" />}
                accentColor="amber"
                subtitle="personal best"
              />
              <KpiCard
                label="Days Logged"
                value={daysLogged}
                icon={<Calendar className="w-4 h-4" />}
                accentColor="blue"
                subtitle="of last 30 days"
              />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.05 }}>
                  <StreakCard
                    currentStreak={streakData.currentStreak}
                    longestStreak={streakData.longestStreak}
                    totalCleanDays={streakData.totalCleanDays}
                  />
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.1 }}>
                  <MoodChart data={moodData} />
                </motion.div>

                {insights && (
                  <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.15 }}>
                    <SectionCard
                      title="Today's Insights"
                      subtitle="AI-powered pattern analysis from your data"
                      padding="lg"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#f6f5f1] rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-[#92400E]" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#6f5b4e]">Best Day</span>
                          </div>
                          <p className="text-sm font-semibold text-[#2c241f]">{insights.bestDay}</p>
                          <p className="text-[11px] text-[#6f5b4e]">Highest average mood ({insights.bestAvg}/10)</p>
                        </div>
                        <div className="bg-[#f6f5f1] rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#6f5b4e]">Mood Trend</span>
                          </div>
                          <p className={`text-sm font-semibold capitalize ${trendColor}`}>{insights.trend}</p>
                          <p className="text-[11px] text-[#6f5b4e]">Compared to previous period</p>
                        </div>
                        {insights.worstUrgeDay && (
                          <div className="bg-[#f6f5f1] rounded-lg p-4 space-y-2 sm:col-span-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-[#dc2626]" />
                              <span className="text-xs font-semibold uppercase tracking-wider text-[#6f5b4e]">Urge Pattern</span>
                            </div>
                            <p className="text-sm font-semibold text-[#2c241f]">{insights.worstUrgeDay}s — {insights.worstUrgeAvg}/10 avg</p>
                            <p className="text-[11px] text-[#6f5b4e]">Highest urge day. Plan extra support.</p>
                          </div>
                        )}
                      </div>
                      <div className="bg-[#fdf6ed] border border-[#92400E]/20 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-[#92400E] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#92400E] mb-1">Recommendation</p>
                            <p className="text-sm text-[#2c241f] leading-relaxed">{insights.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  </motion.div>
                )}

                {loggedToday && latestEntry ? (
                  <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.2 }}>
                    <SectionCard title="Today's Summary" padding="lg">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#f6f5f1] rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-[#92400E]">{latestEntry.mood_score}</div>
                          <div className="text-xs text-[#6f5b4e] mt-1">Mood</div>
                        </div>
                        <div className="bg-[#f6f5f1] rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-[#2563eb]">{latestEntry.urge_intensity}</div>
                          <div className="text-xs text-[#6f5b4e] mt-1">Urge</div>
                        </div>
                        <div className="bg-[#f6f5f1] rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-[#d97706]">{latestEntry.stress_level ?? '-'}</div>
                          <div className="text-xs text-[#6f5b4e] mt-1">Stress</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {latestEntry.khat_used_today && (
                          <span className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200">
                            Khat logged — {latestEntry.khat_hours_ago ?? '?'}h ago
                          </span>
                        )}
                        {latestEntry.relapsed && (
                          <span className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-1.5 border border-red-200">
                            Relapse logged. Support available.
                          </span>
                        )}
                      </div>
                    </SectionCard>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <SectionCard padding="lg" className="bg-[#fdf6ed] border-[#92400E]/30">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-[#92400E]" />
                        <h3 className="text-base font-semibold text-[#2c241f]">Haven&apos;t logged today yet?</h3>
                      </div>
                      <p className="text-sm text-[#6f5b4e] mb-4">
                        Your daily check-in helps us understand your patterns and support you better.
                      </p>
                      <Link
                        href="/log"
                        className="inline-flex items-center gap-2 bg-[#92400E] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#a04e14] transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        Log Your Day
                      </Link>
                    </SectionCard>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
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

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
                  <SectionCard title="Quick Actions" padding="md">
                    <div className="space-y-1">
                      {[
                        { href: '/log', icon: BookOpen, label: 'Log Day', color: 'text-[#92400E]' },
                        { href: '/chat', icon: MessageCircle, label: 'Chat Room', color: 'text-[#2563eb]' },
                        { href: '/directory', icon: Globe, label: 'Directory', color: 'text-[#16a34a]' },
                        { href: '/settings/guardian', icon: UserCheck, label: 'Guardian', color: 'text-[#9333ea]' },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f6f5f1] transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-sm font-medium text-[#2c241f]">{item.label}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#9a8a7d] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                      <Link
                        href="/panic"
                        className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4 text-[#dc2626]" />
                          <span className="text-sm font-medium text-[#dc2626]">Panic Support</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#dc2626] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  </SectionCard>
                </motion.div>
              </div>
            </div>

            {/* Activity + Milestones Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.25 }}>
                <SectionCard title="Recent Activity" padding="lg">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-0">
                      {recentActivity.map((entry, idx) => {
                        const date = new Date(entry.log_date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <div key={entry.log_date} className="flex gap-4 pb-5 relative last:pb-0">
                            {idx < recentActivity.length - 1 && (
                              <div className="absolute left-[7px] top-5 bottom-0 w-px bg-[#e5e0db]" />
                            )}
                            <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 border-2 ${
                              entry.relapsed
                                ? 'bg-[#dc2626] border-[#dc2626]'
                                : entry.mood_score >= 7
                                ? 'bg-[#16a34a] border-[#16a34a]'
                                : entry.mood_score >= 4
                                ? 'bg-[#92400E] border-[#92400E]'
                                : 'bg-[#d97706] border-[#d97706]'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#2c241f]">
                                  {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                {entry.relapsed && (
                                  <span className="text-[10px] font-semibold bg-red-50 text-[#dc2626] px-1.5 py-0.5 rounded">Relapse</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-[#6f5b4e]">
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
                    <p className="text-sm text-[#6f5b4e] text-center py-6">No activity recorded yet.</p>
                  )}
                </SectionCard>
              </motion.div>

              <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
                <SectionCard title="Milestones" padding="lg">
                  <div className="bg-[#f6f5f1] rounded-lg p-4 space-y-2 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6f5b4e]">Recovery Score</span>
                      <span className="text-lg font-bold text-[#92400E]">{recoveryScore}%</span>
                    </div>
                    <ProgressBar value={recoveryScore} color="amber" size="md" />
                    <p className="text-[11px] text-[#6f5b4e]">
                      {streakData.currentStreak} of {nextMilestone} days toward next milestone
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6f5b4e]">Achieved</span>
                      <span className="text-[11px] text-[#6f5b4e]">{achievedMilestones.length}/{STREAK_MILESTONES.length}</span>
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
                                ? 'bg-[#fdf6ed] text-[#92400E] border border-[#92400E]/30'
                                : 'bg-[#f6f5f1] text-[#6f5b4e] border border-[#e5e0db]'
                            }`}
                          >
                            {achieved ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : streakData.currentStreak < milestone && milestone === nextMilestone ? (
                              <Target className="w-3 h-3" />
                            ) : (
                              <span className="w-3 h-3 rounded-full border border-[#6f5b4e]/40" />
                            )}
                            {milestone}d
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            </div>

            <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
              <KhatRiskBanner show={showKhatBanner} hoursSinceUse={khatHoursAgo} onPanic={handlePanic} />
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
