import { PLATFORM_COMMISSION_RATE } from '@/lib/billing/constants';

export type BookingSplit = {
  totalEtb: number;
  platformFeeEtb: number;
  providerPayoutEtb: number;
  commissionRate: number;
};

/** SafeGround keeps 20%; the provider receives the remainder. */
export function calculateBookingSplit(amountEtb: number): BookingSplit {
  if (amountEtb <= 0) {
    return {
      totalEtb: 0,
      platformFeeEtb: 0,
      providerPayoutEtb: 0,
      commissionRate: PLATFORM_COMMISSION_RATE,
    };
  }

  const platformFeeEtb = Math.round(amountEtb * PLATFORM_COMMISSION_RATE);
  const providerPayoutEtb = amountEtb - platformFeeEtb;

  return {
    totalEtb: amountEtb,
    platformFeeEtb,
    providerPayoutEtb,
    commissionRate: PLATFORM_COMMISSION_RATE,
  };
}
