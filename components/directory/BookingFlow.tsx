'use client';

import { useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { DirectoryProvider } from '@/lib/directory/types';

type BookingFlowProps = {
  provider: DirectoryProvider;
  onClose: () => void;
};

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

function getAvailableDates(count = 14): Date[] {
  const dates: Date[] = [];
  const start = new Date();
  start.setDate(start.getDate() + 1);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== 0) dates.push(d);
  }
  return dates;
}

export function BookingFlow({ provider, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    meetingLink?: string;
  } | null>(null);

  const dates = useMemo(() => getAvailableDates(), []);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          providerName: provider.name,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          notes,
          sessionType: provider.online ? 'online' : 'in-person',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmation({ meetingLink: data.booking.meetingLink });
        setStep(4);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-outline-variant">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider">
              Step {step} of 4
            </p>
            <h2 className="font-serif text-xl font-bold text-on-surface">
              {provider.cta === 'join' ? 'Join Program' : 'Book Session'}
            </h2>
            <p className="text-sm text-primary font-medium">{provider.name}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <>
              <p className="text-sm text-on-surface-variant">Select an available date</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dates.map((d) => {
                  const key = d.toISOString();
                  const selected = selectedDate?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`py-3 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-on-surface-variant">Choose a time slot</p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 rounded-lg text-sm font-medium border-2 ${
                      selectedTime === slot
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant hover:border-primary/40'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-on-surface-variant">Optional notes for your provider</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share anything that helps them prepare (optional)…"
                className="input-field min-h-[120px] resize-none"
                rows={4}
              />
            </>
          )}

          {step === 4 && confirmation && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-secondary-container rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-on-surface">You&apos;re booked</h3>
              <div className="text-left bg-surface-container-low rounded-lg p-4 space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Provider:</span> {provider.name}
                </p>
                <p>
                  <span className="font-semibold">When:</span> {dateLabel} at {selectedTime}
                </p>
                {confirmation.meetingLink && (
                  <p>
                    <span className="font-semibold">Meeting link:</span>{' '}
                    <a href={confirmation.meetingLink} className="text-primary underline break-all">
                      {confirmation.meetingLink}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t border-outline-variant gap-3">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 px-4 py-2 text-on-surface-variant font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 && (
            <button
              type="button"
              disabled={step === 1 ? !selectedDate : !selectedTime}
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary py-2 px-6 disabled:opacity-50 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="btn-primary py-2 px-6 disabled:opacity-50"
            >
              {submitting ? 'Confirming…' : 'Confirm booking'}
            </button>
          )}
          {step === 4 && (
            <button type="button" onClick={onClose} className="btn-primary py-2 px-6 ml-auto">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
