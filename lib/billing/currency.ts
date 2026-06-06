/** Ethiopian Birr — sole currency for SafeGround bookings and fees. */
export const CURRENCY_CODE = 'ETB';
export const CURRENCY_LABEL = 'ETB';

export function formatEtb(
  amount: number | null | undefined,
  options?: { perSession?: boolean; freeLabel?: string }
): string {
  if (amount == null || amount <= 0) {
    return options?.freeLabel ?? 'Free';
  }
  const base = `${amount.toLocaleString('en-ET')} ${CURRENCY_LABEL}`;
  return options?.perSession ? `${base} / session` : base;
}

export function parseFeeAmount(price: string, consultationFee?: number | null): number {
  if (consultationFee != null && consultationFee > 0) return consultationFee;
  const etb = price.match(/([\d,]+)\s*ETB/i);
  if (etb) return parseInt(etb[1].replace(/,/g, ''), 10);
  return 0;
}

export function formatPaymentStatus(status: string | null | undefined): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'waived':
      return 'Pro bono';
    case 'pending':
      return 'Payment pending';
    default:
      return status ?? '—';
  }
}

export function formatBookingStatus(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
