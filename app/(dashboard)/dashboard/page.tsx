'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { MoodChart } from '@/components/dashboard/MoodChart'
import { AffirmationCard } from '@/components/dashboard/AffirmationCard'
import { KhatRiskBanner } from '@/components/dashboard/KhatRiskBanner'
import { ImmediateRelief } from '@/components/dashboard/ImmediateRelief'
import { EchoesOfSupport } from '@/components/dashboard/EchoesOfSupport'
import { MilestoneCelebration } from '@/components/dashboard/MilestoneCelebration'
import { WeeklyProgress } from '@/components/dashboard/WeeklyProgress'
import { PanicButton } from '@/components/layout/PanicButton'
import { Shield, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'

interface StreakData {
  current_streak: number
  longest_streak: number
  total_clean_days: number
  last_clean_date?: string
}

interface MoodDataPoint {
  date: string
  moodScore: number
  urgeIntensity: number
}

export default function DashboardPage() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [moodData, setMoodData] = useState<MoodDataPoint[]>([])
  const [loggedToday, setLoggedToday] = useState(false)
  const [khatInfo, setKhatInfo] = useState<{ used: boolean; hoursAgo: number } | null>(null)
  const [moodToday, setMoodToday] = useState(5)
  const [urgeToday, setUrgeToday] = useState(3)
  const [loading, setLoading] = useState(true)
  const [showMilestone, setShowMilestone] = useState(false)
  const [weeklyData, setWeeklyData] = useState<MoodDataPoint[]>([])

  useEffect(() => {
    async function fetchAll() {
      try {
        const [streakRes, historyRes] = await Promise.all([
          fetch('/api/habits/streak'),
          fetch('/api/habits/history?days=30'),
        ])

        const streak = streakRes.ok ? await streakRes.json() : null

        if (streak) {
          setStreakData(streak)
          if (streak.milestone_reached) {
            setShowMilestone(true)
          }
        }

        if (historyRes.ok) {
          const data = await historyRes.json()
          if (data.logs && data.logs.length > 0) {
            const mapped = data.logs.map((l: Record<string, unknown>) => ({
              date: l.log_date as string || l.date as string,
              moodScore: (l.mood_score as number) || 5,
              urgeIntensity: (l.urge_intensity as number) || 0,
            }))
            setMoodData(mapped)
            setWeeklyData(mapped.slice(-7))

            const today = new Date().toISOString().slice(0, 10)
            const todayLog = data.logs.find((l: Record<string, unknown>) =>
              (l.log_date as string) === today || (l.date as string) === today
            )
            if (todayLog) {
              setLoggedToday(true)
              setMoodToday((todayLog.mood_score as number) || 5)
              setUrgeToday((todayLog.urge_intensity as number) || 3)
              const khatUsed = (todayLog.khat_used_today as boolean) || false
              const khatHours = (todayLog.khat_hours_ago as number) || 0
              if (khatUsed) {
                setKhatInfo({ used: khatUsed, hoursAgo: khatHours })
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const defaultStreak = { current_streak: 0, longest_streak: 0, total_clean_days: 0 }
  const currentStreak = streakData?.current_streak || 0

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-serif text-2xl font-bold text-primary">SafeGround</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full border border-secondary/20">
              <span className="text-xs font-semibold uppercase tracking-wider">Privacy Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {khatInfo && khatInfo.used && khatInfo.hoursAgo >= 4 && khatInfo.hoursAgo <= 9 && (
          <KhatRiskBanner
            show={true}
            hoursSinceUse={khatInfo.hoursAgo}
            onPanic={() => {}}
          />
        )}

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-48 bg-surface-container-high rounded-xl" />
                <div className="h-64 bg-surface-container-high rounded-xl" />
                <div className="h-40 bg-surface-container-high rounded-xl" />
              </div>
              <div className="space-y-8">
                <div className="h-32 bg-surface-container-high rounded-xl" />
                <div className="h-48 bg-surface-container-high rounded-xl" />
                <div className="h-40 bg-surface-container-high rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/log"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-semibold hover:bg-primary/90 transition-all hover:shadow-lg active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                {loggedToday ? 'View Today\'s Log' : 'Log Your Day'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-on-surface rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-all active:scale-95"
              >
                Join Support Chat
              </Link>
              <Link
                href="/spiritual"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold hover:bg-amber-200 transition-all active:scale-95"
              >
                Daily Affirmation
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Streak + Milestone combo */}
                <div className="grid md:grid-cols-2 gap-6">
                  <StreakCard
                    currentStreak={streakData?.current_streak || defaultStreak.current_streak}
                    longestStreak={streakData?.longest_streak || defaultStreak.longest_streak}
                    totalCleanDays={streakData?.total_clean_days || defaultStreak.total_clean_days}
                  />
                  <MilestoneCelebration
                    currentStreak={currentStreak}
                    show={showMilestone}
                    onDismiss={() => setShowMilestone(false)}
                  />
                </div>

                <AnimatePresence>
                  {showMilestone && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-6 bg-secondary/10 border border-secondary/20 rounded-xl text-center"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="inline-block"
                      >
                        <span className="text-4xl">🎉</span>
                      </motion.div>
                      <h3 className="text-xl font-bold text-secondary mt-2">Milestone Reached!</h3>
                      <p className="text-sm text-secondary/80 mt-1">
                        {currentStreak} days of strength and commitment
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {weeklyData.length > 0 && <WeeklyProgress data={weeklyData} />}

                {moodData.length > 0 && <MoodChart data={moodData} />}

                {!loggedToday && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8 bg-primary-container text-on-primary-container space-y-4 parchment-glow"
                  >
                    <AlertCircle className="w-6 h-6" />
                    <h3 className="font-bold text-lg">Haven&apos;t logged today yet?</h3>
                    <p className="text-sm opacity-90">
                      Your daily check-in helps us understand your patterns and support you better.
                    </p>
                    <Link
                      href="/log"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-fixed text-on-primary-fixed rounded-full font-semibold hover:brightness-110 transition-all active:scale-95"
                    >
                      Log Your Day
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                <AffirmationCard moodScore={moodToday} urgeIntensity={urgeToday} />
                <ImmediateRelief />
                <EchoesOfSupport />
              </div>
            </div>
          </>
        )}
      </main>

      <PanicButton />
    </div>
  )
}
