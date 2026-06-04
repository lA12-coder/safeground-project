'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const staticAffirmations = [
  'Your strength is not measured by your struggles, but by your courage to face them.',
  'You are worthy of peace, healing, and every good thing that comes your way.',
  'Each day you choose yourself is a victory worth celebrating.',
  'Your recovery is a testament to your resilience and self-love.',
  'You are not alone. Many have walked this path and found their light.',
  'Healing is not linear, and that is perfectly okay. You are still moving forward.',
  'Your past does not define your future. You have the power to write a new story.',
  'One breath, one moment, one day. You are doing more than enough.',
  'You deserve to be happy, healthy, and free. Believe it.',
  'Your commitment to yourself today creates the person you want to be tomorrow.',
];

interface AffirmationCardProps {
  moodScore?: number;
  urgeIntensity?: number;
}

export function AffirmationCard({ moodScore = 5, urgeIntensity = 5 }: AffirmationCardProps) {
  const [affirmation, setAffirmation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAffirmation();
  }, []);

  const loadAffirmation = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/ai/affirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodScore, urgeIntensity }),
      });

      if (response.ok) {
        const data = await response.json();
        setAffirmation(data.affirmation);
      } else {
        // Fallback to static affirmation
        setAffirmation(staticAffirmations[Math.floor(Math.random() * staticAffirmations.length)]);
      }
    } catch (error) {
      // Use static affirmation on error
      setAffirmation(staticAffirmations[Math.floor(Math.random() * staticAffirmations.length)]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="card p-8 bg-primary-fixed/20 border-primary/30 space-y-6 parchment-glow">
      <div className="flex items-start justify-between">
        <h3 className="heading-md text-on-surface">Your Affirmation Today</h3>
        <button
          onClick={loadAffirmation}
          disabled={isRefreshing}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-surface-container-low rounded w-full" />
          <div className="h-4 bg-surface-container-low rounded w-5/6" />
        </div>
      ) : (
        <p className="text-lg leading-relaxed italic text-on-surface font-serif">
          "{affirmation}"
        </p>
      )}
    </div>
  );
}
