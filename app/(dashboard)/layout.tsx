import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        <div className="pb-20 md:pb-0">{children}</div>
      </main>

      {/* Bottom nav for mobile */}
      <BottomNav />
    </div>
  );
}
