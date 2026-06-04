'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function GuestPanicFab() {
  const [open, setOpen] = useState(false);

  const handlePanic = async () => {
    setOpen(true);
    try {
      await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'guest' }),
      });
    } catch {
      /* non-blocking */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePanic}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-error text-on-error z-50 flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Panic support"
      >
        <AlertCircle size={28} aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="card p-8 max-w-md w-full space-y-6">
            <h2 className="heading-md text-error">You are not alone</h2>
            <p className="body-md">Take a breath. Help is one tap away.</p>
            <div className="space-y-3">
              <a
                href="tel:952"
                className="block w-full py-3 bg-error text-on-error rounded-full font-semibold text-center"
              >
                Crisis Line (952)
              </a>
              <Link
                href="/directory"
                onClick={() => setOpen(false)}
                className="block w-full py-3 bg-secondary text-on-secondary rounded-full font-semibold text-center"
              >
                Find Support
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-3 border-2 border-outline-variant rounded-full font-semibold"
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
