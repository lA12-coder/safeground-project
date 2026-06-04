'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { MoodChart } from '@/components/dashboard/MoodChart'
import { AffirmationCard } from '@/components/dashboard/AffirmationCard'
import { KhatRiskBanner } from '@/components/dashboard/KhatRiskBanner'
import { ImmediateRelief } from '@/components/dashboard/ImmediateRelief'
import { EchoesOfSupport } from '@/components/dashboard/EchoesOfSupport'
import { PanicButton } from '@/components/layout/PanicButton'
import { Shield, AlertCircle } from 'lucide-react'

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

interface AffirmationData {
  affirmation: string
}

export default function DashboardPage() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [moodData, setMoodData] = useState<MoodDataPoint[]>([])
  const [loggedToday, setLoggedToday] = useState(true)
  const [khatInfo, setKhatInfo] = useState<{ used: boolean; hoursAgo: number } | null>(null)
  const [moodToday, setMoodToday] = useState(5)
  const [urgeToday, setUrgeToday] = useState(3)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [streakRes, historyRes] = await Promise.all([
          fetch('/api/habits/streak'),
          fetch('/api/habits/history?days=30'),
        ])

        if (streakRes.ok) {
          const data = await streakRes.json()
          setStreakData(data)
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

            const today = new Date().toISOString().slice(0, 10)
            const todayLog = data.logs.find((l: Record<string, unknown>) =>
              (l.log_date as string) === today || (l.date as string) === today
            )
            if (todayLog) {
              setLoggedToday(false)
              setMoodToday((todayLog.mood_score as number) || 5)
              setUrgeToday((todayLog.urge_intensity as number) || 3)
              const khatUsed = (todayLog.khat_used_today as boolean) || false
              const khatHours = (todayLog.khat_hours_ago as number) || 0
              if (khatUsed) {
                setKhatInfo({ used: khatUsed, hoursAgo: khatHours })
              }
            } else {
              setLoggedToday(false)
            }
          } else {
            setLoggedToday(false)
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

  return (
    <div className="min-h-screen bg-surface">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-40 bg-surface-container-high rounded-xl" />
              <div className="h-64 bg-surface-container-high rounded-xl" />
            </div>
            <div className="space-y-8">
              <div className="h-32 bg-surface-container-high rounded-xl" />
              <div className="h-48 bg-surface-container-high rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <StreakCard
                currentStreak={streakData?.current_streak || defaultStreak.current_streak}
                longestStreak={streakData?.longest_streak || defaultStreak.longest_streak}
                totalCleanDays={streakData?.total_clean_days || defaultStreak.total_clean_days}
              />

              {moodData.length > 0 && <MoodChart data={moodData} />}

              {!loggedToday && (
                <div className="card p-8 bg-primary-container text-on-primary-container space-y-4 parchment-glow">
                  <AlertCircle className="w-6 h-6" />
                  <h3 className="heading-md">Haven&apos;t logged today yet?</h3>
                  <p className="body-md opacity-90">
                    Your daily check-in helps us understand your patterns and support you better.
                  </p>
                  <Link href="/log" className="inline-block btn-primary bg-primary-fixed text-on-primary-fixed">
                    Log Your Day
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <AffirmationCard moodScore={moodToday} urgeIntensity={urgeToday} />
              <ImmediateRelief />
              <EchoesOfSupport />
            </div>
          </div>
        )}
      </main>

      <PanicButton />
    </div>
  )
}
