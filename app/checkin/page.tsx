'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Send, Loader2, Sparkles } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { HabitLogForm } from '@/components/dashboard/HabitLogForm'

export default function CheckInPage() {
  const [submitted, setSubmitted] = useState(false)
  const [reflection, setReflection] = useState('')

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
        const { mood_score, stress_level, urge_intensity } = data
        try {
          const affirmRes = await fetch('/api/ai/affirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood_score, urge_intensity }),
          })
          if (affirmRes.ok) {
            const { affirmation } = await affirmRes.json()
            setReflection(affirmation)
          } else {
            setReflection('Today showed resilience despite the challenges. Keep going.')
          }
        } catch {
          setReflection('Today showed resilience despite the challenges. Keep going.')
        }
      }
    } catch (e) {
      console.error('Failed to submit check-in', e)
    }
  }

  return (
    <DashboardShell pageTitle="Daily Check-In" breadcrumb="Recovery">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#6f5b4e] hover:text-[#92400E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e5e0db] rounded-xl p-8 text-center space-y-6 shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Shield className="w-10 h-10 text-green-600" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2c241f]">Check-In Saved</h2>
            <p className="text-sm text-[#6f5b4e]">Your daily check-in has been recorded. Your streak is updated.</p>

            {reflection && (
              <div className="bg-[#fdf6ed] border border-[#e5d5c4] rounded-xl p-5 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#92400E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#92400E]">AI Reflection</span>
                </div>
                <p className="text-sm text-[#6f5b4e] italic leading-relaxed">
                  &ldquo;{reflection}&rdquo;
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#92400E] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#a04e14] transition-all"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => { setSubmitted(false); setReflection('') }}
                className="inline-flex items-center gap-2 bg-[#f6f5f1] text-[#6f5b4e] font-semibold py-3 px-6 rounded-xl hover:bg-[#e5e0db] transition-all"
              >
                Log Another
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-serif font-bold text-[#2c241f]">How is your heart today?</h1>
              <p className="text-sm text-[#6f5b4e] mt-1">Each check-in helps you track patterns and build momentum.</p>
            </div>
            <HabitLogForm onSubmit={handleSubmit} />
          </motion.div>
        )}
      </div>
    </DashboardShell>
  )
}
