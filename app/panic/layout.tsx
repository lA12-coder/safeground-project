import { requireUser } from '@/lib/auth/require-user';

export default async function PanicLayout({ children }: { children: React.ReactNode }) {
  await requireUser('/panic');
  return children;
}
