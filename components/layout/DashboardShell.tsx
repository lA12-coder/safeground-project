'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { DashboardTopBar } from './DashboardTopBar';
import { ToastContainer } from '@/components/ui/Toast';

type DashboardShellProps = {
  children: React.ReactNode;
  role?: 'user' | 'admin' | 'provider';
  pageTitle?: string;
  breadcrumb?: string;
};

export function DashboardShell({ children, role = 'user', pageTitle, breadcrumb }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isFullBleed =
    pathname === '/chat' ||
    pathname.startsWith('/chat/') ||
    pathname === '/spiritual';

  const isAdmin = pathname.startsWith('/admin');
  const resolvedRole = isAdmin ? 'admin' : role;

  if (isFullBleed) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f6f5f1]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        role={resolvedRole}
      />
      <div
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : 256 }}
      >
        <DashboardTopBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          pageTitle={pageTitle}
          breadcrumb={breadcrumb}
        />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
