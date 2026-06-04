'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, Award, Star } from 'lucide-react'

const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365]

interface MilestoneCelebrationProps {
  currentStreak: number
  show?: boolean
  onDismiss?: () => void
}

export function MilestoneCelebration({ currentStreak, show, onDismiss }: MilestoneCelebrationProps) {
  const nextMilestone = MILESTONES.find(m => m > currentStreak) || MILESTONES[MILESTONES.length - 1]
  const lastMilestone = [...MILESTONES].reverse().find(m => m <= currentStreak) || 0
  const progress = currentStreak > 0 ? (currentStreak / nextMilestone) * 100 : 0
  const prevProgress = lastMilestone > 0 ? (lastMilestone / nextMilestone) * 100 : 0
  const percentComplete = ((currentStreak - lastMilestone) / (nextMilestone - lastMilestone)) * 100

  const icon = currentStreak >= 90 ? Trophy : currentStreak >= 30 ? Award : currentStreak >= 14 ? Star : Sparkles

  return (
    <div className="card p-6 bg-gradient-to-br from-amber-50 via-amber-50/50 to-white border-amber-200/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-on-surface">Recovery Milestone</h3>
            <p className="text-sm text-on-surface-variant">
              {currentStreak >= 90
                ? 'Exceptional commitment to your well-being'
                : currentStreak >= 30
                ? 'One month of strength — incredible'
                : currentStreak >= 14
                ? 'Two weeks of dedicated healing'
                : currentStreak >= 7
                ? 'One full week of recovery'
                : 'Every day counts'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">
            {lastMilestone > 0 ? `${lastMilestone} days` : 'Starting out'}
          </span>
          <span className="font-bold text-primary">{nextMilestone} days</span>
        </div>
        <div className="relative h-3 bg-surface-container-high rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentComplete, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>{currentStreak} days strong</span>
          <span>{Math.round(percentComplete)}% to next milestone</span>
        </div>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="mt-4 p-4 bg-amber-100 rounded-xl text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <Trophy className="w-8 h-8 text-amber-700 mx-auto mb-1" />
            </motion.div>
            <p className="font-bold text-amber-800">Celebrating you!</p>
            <p className="text-sm text-amber-700">You reached a new milestone today</p>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="mt-2 text-xs text-amber-600 hover:text-amber-800 underline"
              >
                Dismiss
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
        <Sparkles className="w-3 h-3" />
        <span>Next milestone: {nextMilestone} days of strength</span>
      </div>
    </div>
  )
}
