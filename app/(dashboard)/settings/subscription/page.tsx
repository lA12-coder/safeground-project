'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Loader2, ArrowLeft } from 'lucide-react';
import { AI_PLUS_PRICE_ETB, FREE_AI_REQUEST_LIMIT } from '@/lib/billing/constants';

type SubscriptionState = {
  plan: string;
  is_subscribed: boolean;
  ai_requests_used: number;
  ai_requests_limit: number;
  remaining: number | null;
  subscription_expires_at: string | null;
};

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/billing/subscription')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'ai_plus' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upgrade failed');
      setMessage(json.message ?? 'AI Plus activated!');
      const refreshed = await fetch('/api/billing/subscription').then((r) => r.json());
      setData(refreshed);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#92400E]" />
      </div>
    );
  }

  const used = data?.ai_requests_used ?? 0;
  const limit = data?.ai_requests_limit ?? FREE_AI_REQUEST_LIMIT;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <div className="max-w-lg mx-auto px-4 py-10">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-[#6f5b4e] hover:text-[#92400E] mb-6">
          <ArrowLeft className="w-4 h-4" /> Settings
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7 text-[#92400E]" />
          <h1 className="text-2xl font-bold text-[#2c241f]">AI Plus</h1>
        </div>
        <p className="text-sm text-[#6f5b4e] mb-8">
          Try the AI assistant free ({FREE_AI_REQUEST_LIMIT} requests), then upgrade for unlimited access.
        </p>

        <div className="bg-white rounded-xl border border-[#e5e0db] p-6 mb-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#6f5b4e]">Trial usage</span>
            <span className="font-semibold text-[#2c241f]">
              {data?.is_subscribed ? 'Unlimited (AI Plus)' : `${used} / ${limit} requests`}
            </span>
          </div>
          {!data?.is_subscribed && (
            <div className="h-2 bg-[#f0ece7] rounded-full overflow-hidden">
              <div className="h-full bg-[#92400E] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          )}
          {data?.is_subscribed && data.subscription_expires_at && (
            <p className="text-xs text-[#6f5b4e]">
              Renews / expires: {new Date(data.subscription_expires_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid gap-4 mb-8">
          <div className={`rounded-xl border p-5 ${data?.is_subscribed ? 'border-[#92400E] bg-[#fff8f0]' : 'border-[#e5e0db] bg-white'}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-[#92400E] mb-1">AI Plus</p>
            <p className="text-3xl font-bold text-[#2c241f] mb-3">{AI_PLUS_PRICE_ETB} ETB<span className="text-base font-normal text-[#6f5b4e]">/month</span></p>
            <ul className="space-y-2 text-sm text-[#6f5b4e] mb-5">
              {['Unlimited AI recovery assistant', 'Unlimited affirmations & faith companion', 'Priority Groq responses'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#92400E] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            {!data?.is_subscribed ? (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full py-3 rounded-lg bg-[#92400E] text-white font-semibold hover:bg-[#7a360a] disabled:opacity-60"
              >
                {upgrading ? 'Processing…' : 'Upgrade now (demo)'}
              </button>
            ) : (
              <p className="text-sm font-semibold text-[#92400E]">✓ Active on your account</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e0db] p-5 text-sm text-[#6f5b4e] space-y-2">
          <p className="font-semibold text-[#2c241f]">Session bookings</p>
          <p>
            Psychiatrist and spiritual teacher sessions include a <strong>20% SafeGround platform fee</strong>.
            The remaining 80% goes to the verified provider after payment.
          </p>
        </div>

        {message && (
          <p className="mt-4 text-sm text-center text-[#92400E] font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
