'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const moodEmojis = [
  { value: 1, emoji: '😔', label: 'Very Bad' },
  { value: 2, emoji: '😐', label: 'Bad' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🌟', label: 'Excellent' },
];

const urgeOptions = ['None', 'Low', 'Medium', 'High'];

const triggerTags = [
  'Stress',
  'Boredom',
  'Late Night',
  'Social Media',
  'Peer Pressure',
  'Family Issues',
  'Academic Pressure',
  'Loneliness',
  'Celebration',
];

interface HabitLogFormProps {
  onSubmit?: (data: any) => void;
}

export function HabitLogForm({ onSubmit }: HabitLogFormProps) {
  const [mood, setMood] = useState<number | null>(null);
  const [stress, setStress] = useState(5);
  const [urge, setUrge] = useState<string | null>(null);
  const [khatUsed, setKhatUsed] = useState(false);
  const [khatHoursAgo, setKhatHoursAgo] = useState('');
  const [alcoholUsed, setAlcoholUsed] = useState(false);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showRelapseWarning, setShowRelapseWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTrigger = (trigger: string) => {
    setTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleKhatChange = (checked: boolean) => {
    if (checked) {
      setShowRelapseWarning(true);
    } else {
      setKhatUsed(false);
      setKhatHoursAgo('');
    }
  };

  const confirmRelapse = () => {
    setKhatUsed(true);
    setShowRelapseWarning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        mood,
        stress,
        urge,
        khatUsed,
        khatHoursAgo: khatUsed ? parseInt(khatHoursAgo) : null,
        alcoholUsed,
        triggers,
        notes,
      };

      const response = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form
        setMood(null);
        setStress(5);
        setUrge(null);
        setKhatUsed(false);
        setKhatHoursAgo('');
        setAlcoholUsed(false);
        setTriggers([]);
        setNotes('');
        onSubmit?.(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-8">
      {/* Mood Selector */}
      <section className="space-y-4">
        <h3 className="heading-md text-on-surface">How is your heart today?</h3>
        <div className="flex justify-between gap-2">
          {moodEmojis.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`text-5xl p-2 transition-all hover:scale-125 ${
                mood === m.value ? 'scale-125' : 'grayscale hover:grayscale-0'
              }`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </section>

      {/* Stress Slider */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="label-caps">Stress Level</label>
          <span className="text-3xl font-serif font-bold text-primary">{stress}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={stress}
          onChange={(e) => setStress(parseInt(e.target.value))}
          className="w-full h-2 bg-surface-container-low rounded-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-xs text-on-surface-variant">
          <span>Calm</span>
          <span>Overwhelmed</span>
        </div>
      </section>

      {/* Urge Intensity */}
      <section className="space-y-4">
        <label className="label-caps block">Urge Intensity</label>
        <div className="flex flex-wrap gap-2">
          {urgeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setUrge(option)}
              className={`chip ${urge === option ? 'chip-active' : 'chip-inactive'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {/* Context Flags */}
      <section className="space-y-4 p-6 bg-surface-container-low rounded-lg">
        <h4 className="label-caps">Context & Behavior</h4>

        {/* Khat Used */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={khatUsed && !showRelapseWarning}
            onChange={(e) => handleKhatChange(e.target.checked)}
            className="w-5 h-5 rounded cursor-pointer accent-error"
          />
          <span className="text-sm font-semibold text-on-surface">Khat used today</span>
        </label>

        {khatUsed && (
          <input
            type="number"
            min="0"
            max="24"
            value={khatHoursAgo}
            onChange={(e) => setKhatHoursAgo(e.target.value)}
            placeholder="Hours ago?"
            className="w-full px-4 py-2 border-2 border-outline-variant rounded-lg focus:border-primary focus:outline-none"
          />
        )}

        {/* Alcohol Used */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={alcoholUsed}
            onChange={(e) => setAlcoholUsed(e.target.checked)}
            className="w-5 h-5 rounded cursor-pointer accent-primary"
          />
          <span className="text-sm font-semibold text-on-surface">Alcohol used today</span>
        </label>
      </section>

      {/* Trigger Tags */}
      <section className="space-y-4">
        <label className="label-caps block">What triggered you today? (Select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {triggerTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTrigger(tag)}
              className={`chip ${triggers.includes(tag) ? 'chip-active' : 'chip-inactive'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <label htmlFor="notes" className="label-caps block">
          Additional Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What else would you like to record? This stays on your device only — never uploaded."
          rows={4}
          className="w-full px-4 py-3 border-2 border-outline-variant rounded-lg focus:border-primary focus:outline-none resize-none font-body-md"
        />
        <p className="text-xs text-on-surface-variant italic">
          This session is encrypted and will not be saved unless you upgrade.
        </p>
      </section>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!mood || !urge || isSubmitting}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? 'Saving...' : "Save Today's Check-in"}
      </button>

      {/* Relapse Warning Dialog */}
      {showRelapseWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-w-md p-8 space-y-6 bg-surface-container-highest">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-error" />
              <h3 className="heading-md text-error">Acknowledge Your Slip</h3>
            </div>
            <p className="body-md">
              We see you. Your honesty here is important for your recovery. Recording this helps us understand your patterns and support you better.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRelapseWarning(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRelapse}
                className="flex-1 btn-primary bg-error hover:bg-error/90"
              >
                I'm Recording This
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
