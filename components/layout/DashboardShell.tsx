'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed =
    pathname === '/chat' ||
    pathname.startsWith('/chat/') ||
    pathname === '/spiritual';

  if (isFullBleed) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="pb-20 md:pb-0">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
