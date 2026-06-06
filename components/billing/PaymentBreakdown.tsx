import { calculateBookingSplit } from '@/lib/billing/commission';
import { formatEtb } from '@/lib/billing/currency';
import type { BookingCategory } from '@/lib/billing/constants';

type PaymentBreakdownProps = {
  amountEtb: number;
  category: BookingCategory;
};

export function PaymentBreakdown({ amountEtb, category }: PaymentBreakdownProps) {
  if (amountEtb <= 0) return null;

  const split = calculateBookingSplit(amountEtb);
  const categoryLabel = category === 'spiritual' ? 'spiritual teacher' : 'psychiatrist / counselor';

  return (
    <div className="rounded-lg bg-surface-container-low p-4 text-sm space-y-2 border border-outline-variant/60">
      <p className="font-semibold text-on-surface">Payment breakdown</p>
      <div className="flex justify-between text-on-surface-variant">
        <span>Session with {categoryLabel}</span>
        <span>{formatEtb(split.totalEtb)}</span>
      </div>
      <div className="flex justify-between text-on-surface-variant">
        <span>SafeGround platform fee (20%)</span>
        <span>{formatEtb(split.platformFeeEtb)}</span>
      </div>
      <div className="flex justify-between text-on-surface-variant">
        <span>Provider receives</span>
        <span>{formatEtb(split.providerPayoutEtb)}</span>
      </div>
      <div className="border-t border-outline-variant pt-2 flex justify-between font-semibold text-on-surface">
        <span>You pay</span>
        <span>{formatEtb(split.totalEtb)}</span>
      </div>
    </div>
  );
}
