'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

interface DayData {
  date: string
  moodScore: number
  urgeIntensity: number
}

interface WeeklyProgressProps {
  data: DayData[]
}

export function WeeklyProgress({ data }: WeeklyProgressProps) {
  const last7Days = data.slice(-7)
  const prev7Days = data.slice(-14, -7)

  const avgMood = (arr: DayData[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, d) => s + d.moodScore, 0) / arr.length) : 0
  const avgUrge = (arr: DayData[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, d) => s + d.urgeIntensity, 0) / arr.length) : 0

  const currentAvgMood = avgMood(last7Days)
  const prevAvgMood = avgMood(prev7Days)
  const currentAvgUrge = avgUrge(last7Days)
  const prevAvgUrge = avgUrge(prev7Days)

  const moodTrend = currentAvgMood > prevAvgMood ? 'up' : currentAvgMood < prevAvgMood ? 'down' : 'same'
  const urgeTrend = currentAvgUrge < prevAvgUrge ? 'up' : currentAvgUrge > prevAvgUrge ? 'down' : 'same'

  const loggedDays = last7Days.length
  const streakDays = last7Days.filter(d => d.urgeIntensity <= 3).length

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-secondary" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-error" />
    return <Minus className="w-4 h-4 text-on-surface-variant" />
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-on-surface">Weekly Progress</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-surface-container-low rounded-xl text-center"
        >
          <p className="text-2xl font-bold text-on-surface">{loggedDays}/7</p>
          <p className="text-xs text-on-surface-variant mt-1">Days Logged</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-surface-container-low rounded-xl text-center"
        >
          <p className="text-2xl font-bold text-secondary">{streakDays}</p>
          <p className="text-xs text-on-surface-variant mt-1">Low-Urge Days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-surface-container-low rounded-xl text-center"
        >
          <p className="text-2xl font-bold text-primary">{currentAvgMood}/10</p>
          <p className="text-xs text-on-surface-variant mt-1">Avg Mood</p>
        </motion.div>
      </div>

      <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Mood Trend</span>
          <span className="flex items-center gap-1.5 font-semibold text-on-surface">
            <TrendIcon trend={moodTrend} />
            {currentAvgMood} vs {prevAvgMood} (previous week)
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Urge Trend</span>
          <span className="flex items-center gap-1.5 font-semibold text-on-surface">
            <TrendIcon trend={urgeTrend} />
            {currentAvgUrge} vs {prevAvgUrge} (previous week)
          </span>
        </div>
      </div>
    </div>
  )
}
