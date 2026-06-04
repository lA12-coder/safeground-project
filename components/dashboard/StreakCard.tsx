'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Flame, Sparkles } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalCleanDays: number;
}

const milestones = [3, 7, 14, 30, 60, 90];

export function StreakCard({ currentStreak, longestStreak, totalCleanDays }: StreakCardProps) {
  const nextMilestone = milestones.find(m => m > currentStreak) || 90;
  const isMilestone = milestones.includes(currentStreak);
  const percentToNext = Math.min((currentStreak / nextMilestone) * 100, 100);

  const getStreakTier = () => {
    if (currentStreak >= 90) return { label: 'Legend', color: 'text-amber-600', icon: Sparkles }
    if (currentStreak >= 30) return { label: 'Champion', color: 'text-amber-500', icon: Flame }
    if (currentStreak >= 14) return { label: 'Warrior', color: 'text-amber-500', icon: Flame }
    if (currentStreak >= 7) return { label: 'Committed', color: 'text-amber-500', icon: Flame }
    return { label: 'Beginner', color: 'text-amber-600', icon: Sparkles }
  }

  const tier = getStreakTier()

  return (
    <div className="card p-8 space-y-6 parchment-glow transition-colors duration-300">
      {/* Main Streak Display */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative"
        >
          <motion.span
            animate={isMilestone ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl font-serif font-bold text-primary"
          >
            {currentStreak}
          </motion.span>
          {currentStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <span className={`inline-flex items-center gap-1 text-sm font-semibold ${tier.color}`}>
                <tier.icon className="w-4 h-4" />
                {tier.label}
              </span>
            </motion.div>
          )}
        </motion.div>
        <div>
          <h3 className="font-bold text-xl text-on-surface">Days of Strength</h3>
          {isMilestone && (
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-secondary font-bold text-sm mt-1"
            >
              Milestone Reached!
            </motion.p>
          )}
        </div>
      </div>

      {/* Safety Plan Badge */}
      <div className="flex items-center justify-center gap-2 bg-secondary-container/20 rounded-full py-2 px-4 w-fit mx-auto border border-secondary/30">
        <CheckCircle className="w-4 h-4 text-secondary" />
        <span className="text-sm font-semibold text-on-secondary-container">Safety Plan Active</span>
      </div>

      {/* Sub Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="text-center p-4 bg-surface-container-low rounded-lg">
          <div className="text-2xl font-serif font-bold text-primary">{longestStreak}</div>
          <div className="text-xs text-on-surface-variant font-semibold mt-1">Longest Streak</div>
        </div>
        <div className="text-center p-4 bg-surface-container-low rounded-lg">
          <div className="text-2xl font-serif font-bold text-secondary">{totalCleanDays}</div>
          <div className="text-xs text-on-surface-variant font-semibold mt-1">Total Clean Days</div>
        </div>
      </div>

      {/* Next Milestone */}
      {currentStreak < 90 && (
        <div className="pt-4 border-t border-outline-variant">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-on-surface-variant">Next Milestone</span>
            <span className="text-xs text-primary font-bold">{nextMilestone} days</span>
          </div>
          <div className="relative w-full bg-surface-container-low rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentToNext}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
            />
            {percentToNext > 20 && (
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-1/2 -translate-y-1/2 right-2 w-1 h-1 bg-white/50 rounded-full"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
