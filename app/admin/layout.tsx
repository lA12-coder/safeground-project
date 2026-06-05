'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from './_components/AdminSidebar'
import { DashboardTopBar } from '@/components/layout/DashboardTopBar'
import { ToastContainer } from '@/components/ui/Toast'
import { BottomNav } from '@/components/layout/BottomNav'

const titleMap: Record<string, string> = {
  '/admin': 'System Overview',
  '/admin/providers': 'Provider Management',
  '/admin/faith-organizations': 'Faith Organizations',
  '/admin/partnerships': 'Partnerships',
  '/admin/users': 'User Management',
  '/admin/guardians': 'Guardians',
  '/admin/bookings': 'Bookings',
  '/admin/programs': 'Programs',
  '/admin/moderation': 'Chat Moderation',
  '/admin/panic-monitor': 'Panic Monitor',
  '/admin/analytics': 'Analytics',
  '/admin/content': 'Content Management',
  '/admin/settings': 'System Settings',
  '/admin/super': 'Super Admin',
  '/admin/recovery': 'Recovery',
  '/admin/community': 'Community',
  '/admin/telehealth': 'Telehealth',
  '/admin/appointments': 'Appointments',
  '/admin/seed': 'Seed Data',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const pageTitle = Object.entries(titleMap).find(([path]) => pathname.startsWith(path))?.[1] || 'Admin'

  return (
    <div className="flex min-h-screen bg-[#f6f5f1]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col transition-all duration-200 lg:ml-[240px]">
        <DashboardTopBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          pageTitle={pageTitle}
          breadcrumb="Admin"
        />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
