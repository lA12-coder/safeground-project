export type ReligionId = 'orthodox' | 'protestant' | 'muslim' | 'catholic' | 'other' | 'none';

export const RELIGION_OPTIONS: { id: ReligionId; label: string; denomination?: string }[] = [
  { id: 'orthodox', label: 'Ethiopian Orthodox', denomination: 'Orthodox' },
  { id: 'protestant', label: 'Protestant / Evangelical', denomination: 'Protestant' },
  { id: 'muslim', label: 'Muslim', denomination: 'Muslim' },
  { id: 'catholic', label: 'Catholic', denomination: 'Catholic' },
  { id: 'other', label: 'Other faith tradition' },
  { id: 'none', label: 'Prefer not to say' },
];

export function religionToDenomination(religion: string | null | undefined): string | undefined {
  const match = RELIGION_OPTIONS.find((r) => r.id === religion);
  return match?.denomination;
}

export function parseFeeAmount(price: string, consultationFee?: number | null): number {
  if (consultationFee != null && consultationFee > 0) return consultationFee;
  const etb = price.match(/(\d+)\s*ETB/i);
  if (etb) return parseInt(etb[1], 10);
  const usd = price.match(/\$(\d+)/);
  if (usd) return parseInt(usd[1], 10) * 55;
  return 0;
}
