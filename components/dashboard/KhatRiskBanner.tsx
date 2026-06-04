'use client';

import { AlertCircle, Zap } from 'lucide-react';

interface KhatRiskBannerProps {
  show: boolean;
  hoursSinceUse: number;
  onPanic: () => void;
}

export function KhatRiskBanner({ show, hoursSinceUse, onPanic }: KhatRiskBannerProps) {
  if (!show) return null;

  return (
    <div className="card p-6 bg-tertiary-container/20 border-2 border-tertiary text-on-tertiary space-y-4 parchment-glow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-tertiary/20 rounded-lg shrink-0">
          <AlertCircle className="w-6 h-6 text-tertiary" />
        </div>
        <div className="flex-grow space-y-2">
          <h3 className="heading-md text-tertiary">High-Risk Window</h3>
          <p className="text-sm text-on-tertiary-fixed-variant leading-relaxed">
            Based on your log, you may be entering a high-risk window ({hoursSinceUse} hours since use). Your coping skills are strongest right now. Consider reaching out or using a grounding technique.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onPanic}
          className="flex items-center gap-2 bg-error text-on-error px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95"
        >
          <Zap className="w-4 h-4" />
          Get Help Now
        </button>
        <p className="text-xs text-on-tertiary-fixed-variant">One tap connects you to crisis support</p>
      </div>
    </div>
  );
}
