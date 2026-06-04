'use client';

import { useEffect, useState } from 'react';
import { Wind, Footprints } from 'lucide-react';
import { moodEmojis } from '@/lib/guest/moodEmojis';
import { FullPageLink } from '@/components/ui/FullPageLink';

type EchoQuote = { id: string; content: string; alias: string };

export function GuestRightPanel() {
  const [mood, setMood] = useState<number | null>(null);
  const [quotes, setQuotes] = useState<EchoQuote[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    fetch('/api/guest/echoes')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.quotes) && data.quotes.length > 0) {
          setQuotes(data.quotes);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (quotes.length < 2) return;
    const t = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(t);
  }, [quotes.length]);

  const activeQuote = quotes[quoteIndex] ?? quotes[0];

  return (
    <div className="space-y-6">
      <section className="card p-6 space-y-4">
        <h3 className="font-serif text-lg font-bold text-on-surface">How is your heart today?</h3>
        <div className="flex justify-between gap-1">
          {moodEmojis.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`text-4xl p-1 transition-all ${
                mood === m.value ? 'scale-125' : 'grayscale hover:grayscale-0 opacity-80'
              }`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="label-caps">Immediate Relief</h3>
        <div className="rounded-xl p-5 bg-secondary-container border border-secondary/30 space-y-2">
          <Wind className="w-6 h-6 text-secondary" />
          <h4 className="font-semibold text-on-surface">Breathing Technique</h4>
          <p className="text-sm text-on-surface-variant">
            Inhale for 4 counts, hold for 4, exhale for 6. Repeat three times.
          </p>
        </div>
        <div className="rounded-xl p-5 bg-primary/10 border border-primary/25 space-y-2">
          <Footprints className="w-6 h-6 text-primary" />
          <h4 className="font-semibold text-on-surface">Grounding Exercise</h4>
          <p className="text-sm text-on-surface-variant">
            Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="label-caps">Echoes of Support — Read Only</h3>
        {activeQuote ? (
          <blockquote className="card p-5 border-l-4 border-secondary">
            <p className="text-sm italic text-on-surface-variant leading-relaxed">
              &ldquo;{activeQuote.content}&rdquo;
            </p>
            <footer className="text-xs text-on-surface-variant mt-3 font-medium">
              — {activeQuote.alias}
            </footer>
          </blockquote>
        ) : (
          <p className="text-sm text-on-surface-variant">Loading community echoes…</p>
        )}
      </section>

      <section className="rounded-xl p-6 bg-[#3d2914] text-[#f5e6d3] space-y-4">
        <h3 className="font-serif text-lg font-bold">Save Your Journey</h3>
        <p className="text-sm opacity-90 leading-relaxed">
          Create a private account to track your moods, streaks, and connect with guardians when
          you are ready.
        </p>
        <FullPageLink
          href="/register"
          className="inline-block w-full text-center py-3 rounded-full border-2 border-[#f5e6d3] text-[#f5e6d3] font-semibold hover:bg-[#f5e6d3]/10 transition-colors"
        >
          Create Private Account →
        </FullPageLink>
      </section>
    </div>
  );
}
