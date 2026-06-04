'use client'

import { useState } from 'react'
import { BriefcaseBusiness, Coffee, Lock, Users } from 'lucide-react'

const contexts = [
  { label: 'Khat Related', icon: Coffee },
  { label: 'Alcohol Related', icon: Coffee },
  { label: 'Social Pressure', icon: Users },
]

const defaultTriggers = ['Loneliness', 'Work Stress']

interface HabitLogFormProps {
  onSubmit?: (data: any) => void
}

export function HabitLogForm({ onSubmit }: HabitLogFormProps) {
  const [mood, setMood] = useState(5)
  const [stress, setStress] = useState(3)
  const [urge, setUrge] = useState(0)
  const [triggers, setTriggers] = useState(defaultTriggers)
  const [notes, setNotes] = useState('')
  const [slipToday, setSlipToday] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const removeTrigger = (trigger: string) => {
    setTriggers(prev => prev.filter(item => item !== trigger))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = {
      mood,
      stress,
      urge: String(urge),
      khatUsed: slipToday,
      khatHoursAgo: null,
      alcoholUsed: false,
      triggers,
      notes,
    }

    try {
      const response = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSubmit?.(formData)
        setNotes('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-16">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-serif text-base text-[#211712]">General Mood</label>
          <span className="font-serif text-[#8a3d08]">{mood}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(event) => setMood(Number(event.target.value))}
          className="w-full accent-[#9a4f00]"
        />
        <div className="flex justify-between font-serif text-sm text-[#806b5d]">
          <span>Low / Heavy</span>
          <span>Peaceful / Bright</span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-serif text-base text-[#211712]">Stress Level</label>
          <span className="font-serif text-[#8a3d08]">{stress}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={stress}
          onChange={(event) => setStress(Number(event.target.value))}
          className="w-full accent-[#9a4f00]"
        />
        <div className="flex justify-between font-serif text-sm text-[#806b5d]">
          <span>Calm</span>
          <span>Overwhelmed</span>
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="font-serif text-base text-[#211712]">Urge Intensity</h3>
        <div className="grid grid-cols-6 gap-3 sm:grid-cols-11">
          {Array.from({ length: 11 }, (_, value) => (
            <button
              key={value}
              type="button"
              onClick={() => setUrge(value)}
              className={`h-10 rounded-full font-serif text-sm transition ${
                urge === value ? 'bg-[#8bf2a1] text-[#007233]' : 'bg-[#eeeeed] text-[#3b2418] hover:bg-[#e3e0dc]'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="font-serif text-base text-[#211712]">Specific Contexts</h3>
        <div className="flex flex-wrap gap-4">
          {contexts.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-3 rounded-full border border-[#d7ad92] px-7 py-3 font-serif text-[#3b2418] transition hover:bg-[#fff8f2]"
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="font-serif text-base text-[#211712]">Identified Triggers</h3>
        <div className="flex min-h-24 flex-wrap items-center gap-3 rounded-[2rem] bg-[#f0f0ef] px-6 py-5 shadow-inner">
          {triggers.map(trigger => (
            <button
              key={trigger}
              type="button"
              onClick={() => removeTrigger(trigger)}
              className="rounded-full bg-[#d8ebe1] px-4 py-2 font-serif text-sm text-[#007233]"
            >
              {trigger} x
            </button>
          ))}
          <span className="flex items-center gap-2 font-serif text-sm text-[#6d625b]">
            <BriefcaseBusiness size={16} className="sr-only" />
            Add trigger...
          </span>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <label htmlFor="notes" className="font-serif text-base text-[#211712]">Private Reflections</label>
          <span className="flex items-center gap-2 font-serif text-sm text-[#007233]">
            <Lock size={15} />
            Local Storage Only
          </span>
        </div>
        <textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={6}
          placeholder="How was your day truly? No one sees this but you."
          className="w-full resize-none rounded-[2rem] border border-[#e1ddd9] bg-[#f3f3f2] px-6 py-6 font-serif text-[#3b2418] outline-none placeholder:text-[#d3ad97] focus:border-[#9a4f00]"
        />
      </section>

      <section className="border-t border-[#decfc4] pt-10">
        <label className="flex items-center justify-between rounded-full bg-[#fff0ef] px-6 py-5">
          <span>
            <span className="block font-serif text-[#b91c1c]">Did you have a slip today?</span>
            <span className="font-serif text-sm text-[#3b2418]">We are here to help, not to judge.</span>
          </span>
          <button
            type="button"
            onClick={() => setSlipToday(prev => !prev)}
            className={`flex h-8 w-16 items-center rounded-full p-1 transition ${slipToday ? 'bg-[#b91c1c]' : 'bg-[#d9dcdd]'}`}
            aria-pressed={slipToday}
          >
            <span className={`h-6 w-6 rounded-full bg-white transition ${slipToday ? 'translate-x-8' : ''}`} />
          </button>
        </label>
      </section>

      <div className="flex flex-wrap justify-center gap-4 pt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-w-44 rounded-full bg-[#9a4f00] px-8 py-4 font-serif font-bold text-white shadow-md transition hover:bg-[#783d00] disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Complete Log'}
        </button>
        <button
          type="button"
          className="min-w-44 rounded-full border border-[#6f5545] px-8 py-4 font-serif text-[#3b2418] transition hover:bg-[#f4eee9]"
        >
          Discard Entry
        </button>
      </div>
    </form>
  )
}
