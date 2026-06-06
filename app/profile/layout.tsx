import { requireUser } from '@/lib/auth/require-user';

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireUser('/profile');
  return children;
}
