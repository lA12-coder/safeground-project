'use client'

import { useState } from 'react'
import { Shield, BookOpen, Sparkles, Heart, RefreshCw, MessageCircle } from 'lucide-react'

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

        {/* Guided Practices */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-serif font-bold text-lg text-on-surface">Guided Practices</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 border border-outline-variant rounded-xl hover:bg-surface-container-low cursor-pointer transition">
              <p className="font-semibold text-on-surface">Morning Meditation</p>
              <p className="text-sm text-on-surface-variant mt-1">10 minutes — Start your day with grounded intention</p>
            </div>
            <div className="p-5 border border-outline-variant rounded-xl hover:bg-surface-container-low cursor-pointer transition">
              <p className="font-semibold text-on-surface">Evening Reflection</p>
              <p className="text-sm text-on-surface-variant mt-1">15 minutes — Release the day and find peace</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
