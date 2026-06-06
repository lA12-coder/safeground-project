'use client';

import { useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, CreditCard, Smartphone } from 'lucide-react';
import type { DirectoryProvider } from '@/lib/directory/types';
import { parseFeeAmount } from '@/lib/faith/constants';

type SpiritualBookingFlowProps = {
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

export function SpiritualBookingFlow({ provider, onClose }: SpiritualBookingFlowProps) {
  const needsPayment = !provider.proBono;
  const totalSteps = needsPayment ? 5 : 4;
  const amountEtb = parseFeeAmount(provider.price, provider.consultationFee);

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'chapa' | 'telebirr'>('chapa');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    meetingLink?: string;
    paid?: boolean;
  } | null>(null);

  const dates = useMemo(() => getAvailableDates(), []);

  const createBooking = async () => {
    if (!selectedDate || !selectedTime) return null;
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
        amountEtb,
        proBono: provider.proBono,
        bookingType: 'spiritual',
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error('Booking failed');
    return data.booking_id ?? data.booking?.id;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const id = bookingId ?? (await createBooking());
      if (!id) throw new Error('No booking id');
      setBookingId(id);

      if (needsPayment) {
        setStep(4);
      } else {
        setConfirmation({ meetingLink: undefined, paid: true });
        setStep(totalSteps);
      }
    } catch {
      setConfirmation(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          payment_method: paymentMethod,
          phone: phone || undefined,
          amount_etb: amountEtb,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Payment failed');
      setConfirmation({
        meetingLink: data.booking?.meeting_link,
        paid: true,
      });
      setStep(totalSteps);
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
              Step {step} of {totalSteps}
            </p>
            <h2 className="font-serif text-xl font-bold text-on-surface">Book Spiritual Assistance</h2>
            <p className="text-sm text-primary font-medium">{provider.name}</p>
            {provider.orgName && (
              <p className="text-xs text-on-surface-variant">{provider.orgName}</p>
            )}
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
                  const selected = selectedDate?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
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
              <p className="text-sm text-on-surface-variant">Share context for your spiritual teacher (optional)</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What would you like guidance on?"
                className="input-field min-h-[120px] resize-none"
                rows={4}
              />
              <div className="rounded-lg bg-surface-container-low p-4 text-sm space-y-1">
                <p><span className="font-semibold">Session fee:</span> {provider.price}</p>
                <p className="text-on-surface-variant text-xs">
                  {provider.proBono
                    ? 'This session is pro bono — no payment required.'
                    : 'You will complete payment in the next step via Chapa or Telebirr.'}
                </p>
              </div>
            </>
          )}

          {step === 4 && needsPayment && (
            <>
              <p className="text-sm text-on-surface-variant">Complete payment to confirm your session</p>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-primary">{amountEtb} ETB</p>
                <p className="text-sm text-on-surface-variant mt-1">with {provider.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('chapa')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
                    paymentMethod === 'chapa' ? 'border-primary bg-primary/5' : 'border-outline-variant'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span className="text-sm font-semibold">Chapa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('telebirr')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
                    paymentMethod === 'telebirr' ? 'border-primary bg-primary/5' : 'border-outline-variant'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-primary" />
                  <span className="text-sm font-semibold">Telebirr</span>
                </button>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number (09…)"
                className="input-field w-full"
              />
              <p className="text-xs text-on-surface-variant">
                Demo mode: payment is simulated. In production this connects to Chapa/Telebirr checkout.
              </p>
            </>
          )}

          {step === totalSteps && confirmation && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-secondary-container rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-on-surface">Session confirmed</h3>
              <div className="text-left bg-surface-container-low rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-semibold">Teacher:</span> {provider.name}</p>
                <p><span className="font-semibold">When:</span> {dateLabel} at {selectedTime}</p>
                {needsPayment && confirmation.paid && (
                  <p><span className="font-semibold">Payment:</span> {amountEtb} ETB via {paymentMethod}</p>
                )}
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
          {step > 1 && step < totalSteps ? (
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
              {submitting ? 'Saving…' : needsPayment ? 'Continue to payment' : 'Confirm booking'}
            </button>
          )}
          {step === 4 && needsPayment && (
            <button
              type="button"
              disabled={submitting}
              onClick={handlePayment}
              className="btn-primary py-2 px-6 disabled:opacity-50"
            >
              {submitting ? 'Processing…' : `Pay ${amountEtb} ETB`}
            </button>
          )}
          {step === totalSteps && (
            <button type="button" onClick={onClose} className="btn-primary py-2 px-6 ml-auto">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
