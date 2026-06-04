'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export function PanicButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePanic = async () => {
    setIsOpen(true);

    // Log panic alert to backend
    try {
      await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error logging panic alert:', error);
    }
  };

  return (
    <>
      {/* Desktop: Sidebar button */}
      <div className="hidden md:block">
        <button
          onClick={handlePanic}
          className="w-full py-3 px-4 bg-danger hover:bg-red-800 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <span>*</span>
          <span>PANIC</span>
        </button>
      </div>

      {/* Mobile: Fixed circular button */}
      <button
        onClick={handlePanic}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 rounded-full bg-danger hover:bg-red-800 text-white z-50 flex items-center justify-center shadow-lg"
      >
        <AlertCircle size={28} />
      </button>

      {/* Panic Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-danger mb-4">Emergency Support</h2>
            <p className="text-gray-700 mb-6">
              We&apos;re here to help. Choose your next step:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  window.location.href = 'tel:911';
                  setIsOpen(false);
                }}
                className="w-full py-3 bg-danger text-white rounded-lg font-semibold hover:bg-red-800"
              >
                Call Emergency (911)
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-success text-white rounded-lg font-semibold hover:bg-green-800"
              >
                Breathing Exercise
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
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
