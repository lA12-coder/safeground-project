'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'
import { BreathingCircle } from '@/components/panic/BreathingCircle'
import { CopingStepCard, CopingStep } from '@/components/panic/CopingStepCard'
import { PanicButton } from '@/components/layout/PanicButton'

type Phase = 'breathing' | 'coping' | 'completion'

export default function PanicPage() {
  const [phase, setPhase] = useState<Phase>('breathing')
  const [sessionData, setSessionData] = useState<{ id: string; steps: CopingStep[]; affirmation: string } | null>(null)
  const [urgeStartTime] = useState<number>(Date.now())

  const handleBreathingComplete = () => {
    if (!sessionData) {
      fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity: 8, context_tags: ['panic-page'] }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.session_id) {
            setSessionData({ id: data.session_id, steps: data.steps, affirmation: data.affirmation })
          }
        })
        .catch(() => {
          setSessionData({
            id: 'local',
            steps: [
              { title: 'Grounding', instruction: 'Name 5 things you can see around you.', duration_seconds: 90 },
              { title: 'Breathing', instruction: 'Breathe in for 4 seconds, hold for 7, exhale for 8.', duration_seconds: 90 },
              { title: 'Distraction', instruction: 'Stand up and walk around for 2 minutes.', duration_seconds: 90 },
              { title: 'Connection', instruction: 'Reach out to someone you trust.', duration_seconds: 90 },
              { title: 'Affirmation', instruction: 'You are stronger than this urge. It will pass.', duration_seconds: 90 },
            ],
            affirmation: 'An urge is temporary. You do not need to act on it.',
          })
        })
    }
    setPhase('coping')
  }

  const handleComplete = async (completedSteps: number) => {
    if (sessionData?.id) {
      await fetch('/api/panic/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionData.id, completed_steps: completedSteps }),
      }).catch(() => {})
    }
    setPhase('completion')
  }

  const handleCancel = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e0db]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 rounded-lg text-[#6f5b4e] hover:bg-[#f6f5f1] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-5 h-5 text-[#92400E]" />
            <span className="font-serif text-lg font-bold text-[#92400E]">SafeGround</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Emergency Support</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs text-[#6f5b4e] hover:text-[#92400E] font-medium transition-colors"
            >
              Skip to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {phase === 'breathing' && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BreathingCircle onComplete={handleBreathingComplete} urgeStartTime={urgeStartTime} />
            </motion.div>
          )}

          {phase === 'coping' && sessionData?.steps && (
            <motion.div
              key="coping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CopingStepCard
                steps={sessionData.steps}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {phase === 'coping' && !sessionData?.steps && (
            <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
              <div className="w-10 h-10 border-4 border-[#92400E] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#6f5b4e] font-medium">Preparing your coping plan...</p>
            </div>
          )}

          {phase === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="absolute inset-0 border-4 border-dashed border-[#92400E]/30 rounded-full"
                />
                <span className="text-5xl">🌟</span>
              </div>

              <h2 className="text-4xl font-serif font-bold text-[#2c241f] mb-3">
                You Held Your Ground
              </h2>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full font-bold text-sm mb-6 border border-amber-200">
                <span>✓</span> Streak Protected
              </div>

              <p className="text-lg text-[#6f5b4e] mb-8 italic max-w-sm">
                &ldquo;{sessionData?.affirmation || 'You are stronger than the urge.'}&rdquo;
              </p>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#92400E] text-white font-semibold py-4 px-8 rounded-xl hover:bg-[#a04e14] transition-all shadow-md active:scale-95"
              >
                Return to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <PanicButton variant="fab" />
      </div>
    </div>
  )
}
