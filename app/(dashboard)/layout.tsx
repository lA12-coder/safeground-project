import { DashboardShell } from '@/components/layout/DashboardShell';
import { requireUser } from '@/lib/auth/require-user';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser('/dashboard');
  return <DashboardShell role="user">{children}</DashboardShell>;
}
