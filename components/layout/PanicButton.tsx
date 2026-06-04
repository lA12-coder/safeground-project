'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

type PanicButtonProps = {
  variant?: 'header' | 'sidebar' | 'fab';
};

export function PanicButton({ variant = 'fab' }: PanicButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePanic = async () => {
    setIsOpen(true);
    try {
      await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: variant }),
      });
    } catch (error) {
      console.error('Error logging panic alert:', error);
    }
  };

  const trigger =
    variant === 'header' ? (
      <button
        type="button"
        onClick={handlePanic}
        className="bg-error text-on-error font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-all active:scale-95 text-sm"
      >
        PANIC
      </button>
    ) : variant === 'sidebar' ? (
      <button
        type="button"
        onClick={handlePanic}
        className="w-full py-3 px-4 bg-error hover:opacity-90 text-on-error rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <AlertCircle className="w-5 h-5" aria-hidden />
        <span>PANIC</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={handlePanic}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-error hover:opacity-90 text-on-error z-40 flex items-center justify-center shadow-lg"
        aria-label="Panic support"
      >
        <AlertCircle size={26} aria-hidden />
      </button>
    );

  return (
    <>
      {trigger}

      {isOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="panic-title"
        >
          <div className="card p-8 max-w-md w-full space-y-6">
            <h2 id="panic-title" className="heading-md text-error">
              You are not alone
            </h2>
            <p className="body-md">
              Take a breath. Choose a step that feels right — every option keeps your privacy intact.
            </p>
            <div className="space-y-3">
              <a
                href="tel:952"
                className="block w-full py-3 bg-error text-on-error rounded-full font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Crisis Line (952)
              </a>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 bg-secondary text-on-secondary rounded-full font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Grounding on Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 border-2 border-outline-variant text-on-surface rounded-full font-semibold hover:bg-surface-container-low transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
