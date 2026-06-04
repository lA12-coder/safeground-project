'use client';

import { useState, useEffect } from 'react';

const communityQuotes = [
  "You are not alone. There is light even on the darkest paths.",
  "One day at a time, one breath at a time. You're doing enough.",
  "Your pain is valid, and your recovery is beautiful.",
  "Strength doesn't mean never falling. It means getting back up.",
  "Today is a new opportunity to choose yourself.",
  "Your journey matters, even if nobody else is watching.",
  "Healing is not weakness. It's the bravest thing you can do.",
  "You are stronger than you think, and braver than you believe.",
];

export function EchoesOfSupport() {
  const [quotes, setQuotes] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle and pick 2 random quotes
    const shuffled = [...communityQuotes].sort(() => Math.random() - 0.5);
    setQuotes(shuffled.slice(0, 2));
  }, []);

  return (
    <div className="card p-6 bg-surface-container-high/30 space-y-4 parchment-glow">
      <div className="flex items-center justify-between">
        <h3 className="label-caps">Echoes of Support</h3>
        <span className="bg-surface-container text-on-surface-variant px-2 py-1 rounded text-xs font-bold uppercase">
          Read Only
        </span>
      </div>
      <div className="space-y-3">
        {quotes.map((quote, idx) => (
          <div
            key={idx}
            className="bg-surface-container-lowest p-4 rounded-lg text-sm border border-outline-variant/30 italic text-on-surface"
          >
            "{quote}"
          </div>
        ))}
      </div>
    </div>
  );
}
