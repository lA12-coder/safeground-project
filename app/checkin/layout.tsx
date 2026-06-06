import { requireUser } from '@/lib/auth/require-user';

export default async function CheckInLayout({ children }: { children: React.ReactNode }) {
  await requireUser('/checkin');
  return children;
}
