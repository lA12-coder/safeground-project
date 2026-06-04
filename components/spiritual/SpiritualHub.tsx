'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  LayoutGrid,
  Bandage,
  Users,
  BookOpen,
  HelpCircle,
  BookMarked,
} from 'lucide-react';
import { PanicButton } from '@/components/layout/PanicButton';

const SCRIPTURE_AM = 'እግዚአብሔር ብርሃኔ ነው፤ የማዳኔም ነው። ማንን እፈራለሁ?';
const SCRIPTURE_EN = 'The Lord is my light and my salvation; whom shall I fear?';

const NAV = [
  { label: 'Programs', href: '/spiritual', icon: BookOpen, active: true },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Recovery', href: '/log', icon: Bandage },
  { label: 'Community', href: '/chat', icon: Users },
];

export function SpiritualHub() {
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);
  const [companionInput, setCompanionInput] = useState('');
  const [companionReply, setCompanionReply] = useState<string | null>(null);
  const [companionLoading, setCompanionLoading] = useState(false);

  const week = 4;
  const progress = (week / 12) * 100;

  const handleSaveReflection = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safeground_reflection', reflection);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSeekGuidance = async () => {
    const message = companionInput.trim() || 'What burden weighs on my soul today?';
    setCompanionLoading(true);
    setCompanionOpen(true);
    try {
      const res = await fetch('/api/faith/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setCompanionReply(data.reply ?? 'Peace be with you on your path today.');
    } finally {
      setCompanionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] flex">
      <aside className="hidden lg:flex flex-col w-56 bg-surface-container-low border-r border-outline-variant shrink-0">
        <div className="p-6 border-b border-outline-variant">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <span className="font-serif font-bold text-primary block">SafeGround</span>
              <span className="text-[10px] text-on-surface-variant">Therapeutic Grounding</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ label, href, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                active
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 space-y-2 border-t border-outline-variant">
          <Link
            href="/directory"
            className="flex items-center gap-2 text-sm text-on-surface-variant px-2 py-2"
          >
            <HelpCircle size={16} /> Support
          </Link>
          <PanicButton variant="sidebar" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-6">
          <span className="font-semibold text-on-surface">Programs</span>
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <span>Amharic / English</span>
            <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant" />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#f5e6d3] text-primary text-xs font-bold uppercase tracking-wide">
                Path of Restoration
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-on-surface">
                Week {week}: Anchoring in Faith
              </h1>
              <p className="body-md max-w-xl">
                Your spiritual journey is a marathon, not a sprint. This week we focus on identifying
                triggers and seeking refuge in the divine.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Overall Progress</span>
                  <span className="text-on-surface-variant">Week {week} of 12</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[1, 2, 3, 4].map((w) => (
                    <div
                      key={w}
                      className={`h-2 rounded-full ${
                        w <= Math.ceil(week / 3) ? 'bg-primary' : 'bg-surface-container-high'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-4 parchment-glow h-fit">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
                  W
                </div>
                <div>
                  <h2 className="font-semibold text-on-surface">Wisdom Companion</h2>
                  <span className="text-[10px] font-bold tracking-widest text-primary">
                    FAITH-GUIDED AI
                  </span>
                </div>
              </div>
              <div className="bg-[#fff8e7] rounded-xl p-4 border border-outline-variant/50">
                <p className="text-sm italic text-on-surface-variant leading-relaxed">
                  &ldquo;What burden weighs on your soul today? Remember, there is strength in
                  turning to the Light.&rdquo;
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCompanionOpen(true);
                  setCompanionReply(null);
                  setCompanionInput('');
                }}
                className="w-full btn-primary py-3"
              >
                Seek Guidance →
              </button>
            </div>
          </div>

          <section className="card p-8 md:p-12 text-center space-y-6 parchment-glow">
            <BookMarked className="w-8 h-8 text-primary mx-auto opacity-60" />
            <p
              className="text-2xl md:text-3xl font-bold text-on-surface leading-relaxed max-w-2xl mx-auto"
              style={{ fontFamily: "'Noto Serif Ethiopic', 'Noto Serif', serif" }}
            >
              {SCRIPTURE_AM}
            </p>
            <p className="text-lg italic text-on-surface-variant font-serif">{SCRIPTURE_EN}</p>
            <div className="max-w-xl mx-auto text-left pt-6 space-y-3">
              <label className="label-caps block">Your Reflection</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write your thoughts here…"
                className="input-field min-h-[140px] resize-none w-full"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-6 py-2.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/5"
                >
                  {saved ? 'Saved' : 'Save Entry'}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {companionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl border border-outline-variant">
            <h3 className="font-serif text-xl font-bold">Wisdom Companion</h3>
            {companionReply ? (
              <p className="text-sm italic text-on-surface-variant leading-relaxed">{companionReply}</p>
            ) : (
              <textarea
                value={companionInput}
                onChange={(e) => setCompanionInput(e.target.value)}
                placeholder="Share what is on your heart…"
                className="input-field min-h-[100px] resize-none"
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setCompanionOpen(false)}
                className="px-4 py-2 text-on-surface-variant font-medium"
              >
                Close
              </button>
              {!companionReply && (
                <button
                  type="button"
                  disabled={companionLoading}
                  onClick={handleSeekGuidance}
                  className="btn-primary py-2 px-5 disabled:opacity-60"
                >
                  {companionLoading ? 'Listening…' : 'Ask'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
