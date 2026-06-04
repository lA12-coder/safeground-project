'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, BookOpen, Sparkles, Heart, RefreshCw, MessageCircle, Wind, Clock, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

const fallbackAffirmations = [
  '"The path to healing is not a straight line. Every step you take, no matter how small, is a victory."',
  '"You are stronger than the urges that visit you. They are guests, not owners of your home."',
  '"Let your faith be the anchor that holds when the waves of craving rise."',
  '"Recovery is not about perfection. It is about persistence. You persisted today."',
  '"The fact that you are here, seeking help, is proof that hope is alive in you."',
  '"Your future self is watching you right now with gratitude for every choice you make."',
  '"You are not alone in this struggle. Thousands have walked this path and found freedom."',
  '"Be gentle with yourself today. Healing requires patience, not punishment."',
  '"Remember your why. The person you love most in this world — be that person for yourself."',
  '"Each morning brings a new chance to begin again. Today is a fresh start."',
]

function BreathingExercise() {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle')
  const [count, setCount] = useState(0)
  const [rounds, setRounds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startBreathing = () => {
    setPhase('inhale')
    setCount(4)
    setRounds(0)
  }

  const stopBreathing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase('idle')
    setCount(0)
  }

  useEffect(() => {
    if (phase === 'idle') return
    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (phase === 'inhale') {
          if (prev <= 1) { setPhase('hold'); return 7 }
          return prev - 1
        }
        if (phase === 'hold') {
          if (prev <= 1) { setPhase('exhale'); return 8 }
          return prev - 1
        }
        if (phase === 'exhale') {
          if (prev <= 1) {
            setRounds(r => {
              if (r + 1 >= 4) { setPhase('idle'); setCount(0); return 0 }
              setPhase('inhale'); return r + 1
            })
            return 4
          }
          return prev - 1
        }
        return prev
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  const phaseColors: Record<string, string> = {
    idle: 'bg-amber-100 text-amber-700',
    inhale: 'bg-blue-100 text-blue-700',
    hold: 'bg-purple-100 text-purple-700',
    exhale: 'bg-green-100 text-green-700',
  }

  const phaseLabels: Record<string, string> = {
    idle: 'Begin',
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
  }

  return (
    <div className="card p-8 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
      <div className="flex items-center gap-2 text-primary">
        <Wind className="w-5 h-5" />
        <h2 className="font-serif font-bold text-lg text-on-surface">Breathing Exercise (4-7-8)</h2>
      </div>
      <div className="text-center">
        {phase !== 'idle' ? (
          <motion.div
            key={phase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.8 : 1,
              }}
              transition={{ duration: 0.5 }}
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-3xl font-bold ${phaseColors[phase]}`}
            >
              {count}
            </motion.div>
            <p className="text-lg font-semibold text-on-surface">{phaseLabels[phase]}</p>
            <p className="text-sm text-on-surface-variant">Round {rounds + 1} of 4</p>
            <button
              onClick={stopBreathing}
              className="px-6 py-2 bg-error/10 text-error rounded-full text-sm font-semibold hover:bg-error/20 transition"
            >
              Stop
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-on-surface-variant text-sm">
              Calm your nervous system with the 4-7-8 breathing technique. Inhale 4s, Hold 7s, Exhale 8s.
            </p>
            <button
              onClick={startBreathing}
              className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition"
            >
              Start Breathing Exercise
            </button>
          </div>
        )}
        {rounds >= 4 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold mt-4"
          >
            Exercise complete. Notice how you feel.
          </motion.p>
        )}
      </div>
    </div>
  )
}

function PrayerTimes() {
  const now = new Date()
  const hours = now.getHours()
  const isMorning = hours < 12
  const isEvening = hours >= 17

  const prayers = [
    { label: 'Morning Reflection', time: '06:00', icon: Sun, active: isMorning },
    { label: 'Midday Centering', time: '12:00', icon: Clock, active: hours >= 12 && hours < 17 },
    { label: 'Evening Gratitude', time: '18:00', icon: Moon, active: isEvening },
    { label: 'Night Peace', time: '21:00', icon: Moon, active: hours >= 21 },
  ]

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-on-surface">Prayer & Reflection Times</h3>
      </div>
      <div className="space-y-2">
        {prayers.map(p => (
          <div
            key={p.label}
            className={`flex items-center justify-between p-3 rounded-lg text-sm ${
              p.active ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-2">
              <p.icon className={`w-4 h-4 ${p.active ? 'text-primary' : 'text-on-surface-variant'}`} />
              <span className={p.active ? 'font-semibold text-primary' : 'text-on-surface-variant'}>{p.label}</span>
            </div>
            <span className="text-xs text-on-surface-variant">{p.time}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-on-surface-variant italic">
        Align your recovery with moments of stillness throughout the day.
      </p>
    </div>
  )
}

export default function SpiritualPage() {
  const [affirmation, setAffirmation] = useState(fallbackAffirmations[0])
  const [loading, setLoading] = useState(false)
  const [companionMessages, setCompanionMessages] = useState<{ role: string; content: string }[]>([])
  const [companionInput, setCompanionInput] = useState('')
  const [companionLoading, setCompanionLoading] = useState(false)

  async function fetchAffirmation() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/affirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_score: 5, urge_intensity: 3 }),
      })
      if (res.ok) {
        const data = await res.json()
        setAffirmation(`"${data.affirmation}"`)
      } else {
        setAffirmation(fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)])
      }
    } catch {
      setAffirmation(fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)])
    }
    setLoading(false)
  }

  async function sendCompanionMessage() {
    if (!companionInput.trim() || companionLoading) return
    const userMsg = companionInput.trim()
    setCompanionInput('')
    setCompanionMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setCompanionLoading(true)

    try {
      const res = await fetch('/api/faith/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...companionMessages, { role: 'user', content: userMsg }],
          user_context: { religion: 'prefer_not_to_say', language_pref: 'en' },
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCompanionMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setCompanionMessages(prev => [...prev, { role: 'assistant', content: 'I am here for you. Take a deep breath and know that you are not alone.' }])
      }
    } catch {
      setCompanionMessages(prev => [...prev, { role: 'assistant', content: 'I am here for you. Take a deep breath and know that you are not alone.' }])
    }
    setCompanionLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-primary">Spiritual Connection</h1>
          </div>
          <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Privacy Active
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Daily Affirmation */}
        <div className="card p-8 parchment-glow bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50">
          <div className="flex items-center gap-2 text-amber-800 mb-4">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-serif font-bold text-lg">Daily Inspiration</h2>
          </div>
          <p className="font-serif text-xl text-amber-900 italic leading-relaxed min-h-[3rem]">
            {loading ? 'Finding your affirmation...' : affirmation}
          </p>
          <button
            onClick={fetchAffirmation}
            disabled={loading}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-amber-700 text-white rounded-full text-sm font-semibold hover:bg-amber-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'New Affirmation'}
          </button>
        </div>

        {/* Faith Resources */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-5 h-5" />
            <h2 className="font-serif font-bold text-lg text-on-surface">Faith Resources</h2>
          </div>
          <p className="text-on-surface-variant">
            Connect with spiritual organizations and faith leaders in your community. Browse the directory for faith-based programs tailored to your tradition.
          </p>
          <a
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition text-sm"
          >
            Browse Resources
          </a>
        </div>

        {/* Spiritual Companion AI */}
        <div className="card p-8 space-y-6 bg-gradient-to-br from-amber-50 to-white border-amber-200/50">
          <div className="flex items-center gap-2 text-primary">
            <MessageCircle className="w-5 h-5" />
            <h2 className="font-serif font-bold text-lg text-on-surface">Spiritual Companion</h2>
          </div>
          <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-4 py-2">
            This is an AI companion, not a religious authority. It draws from general wisdom traditions.
          </p>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {companionMessages.length === 0 && (
              <p className="text-on-surface-variant text-sm italic text-center py-8">
                Share what&apos;s on your heart. I&apos;m here to listen.
              </p>
            )}
            {companionMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-md'
                    : 'bg-amber-100 text-amber-900 rounded-bl-md'
                }`}>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {companionLoading && (
              <div className="flex justify-start">
                <div className="bg-amber-100 rounded-2xl px-4 py-3 text-sm text-amber-700 animate-pulse">
                  Reflecting...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={companionInput}
              onChange={(e) => setCompanionInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendCompanionMessage() }}
              placeholder="Share what's on your heart..."
              className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={sendCompanionMessage}
              disabled={!companionInput.trim() || companionLoading}
              className="px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 text-sm"
            >
              Send
            </button>
          </div>
        </div>

        {/* Breathing Exercise */}
        <BreathingExercise />

        {/* Prayer Times */}
        <PrayerTimes />
      </main>
    </div>
  )
}
