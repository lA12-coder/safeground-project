'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Cross, Users, Calendar, Shield,
  CalendarCheck, BarChart3, Settings, LogOut, LifeBuoy,
  Building2, Handshake, Church, UserCheck, BookOpen,
  AlertTriangle, PieChart, FileText, Crown,
} from 'lucide-react'
import { PanicButton } from '@/components/layout/PanicButton'
import { signOut } from '@/lib/auth/actions'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Verification',
    items: [
      { label: 'Organizations', href: '/admin/providers', icon: Building2 },
      { label: 'Faith Orgs', href: '/admin/faith-organizations', icon: Church },
      { label: 'Partnerships', href: '/admin/partnerships', icon: Handshake },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Guardians', href: '/admin/guardians', icon: UserCheck },
      { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
      { label: 'Programs', href: '/admin/programs', icon: BookOpen },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { label: 'Moderation', href: '/admin/moderation', icon: Shield },
      { label: 'Panic Monitor', href: '/admin/panic-monitor', icon: AlertTriangle },
      { label: 'Analytics', href: '/admin/analytics', icon: PieChart },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Content', href: '/admin/content', icon: FileText },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Super Admin', href: '/admin/super', icon: Crown },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-white border-r border-[#e5e0db] flex-col z-40">
      <div className="px-4 pt-6 pb-4 border-b border-[#e5e0db]">
        <Link href="/admin" className="text-xl font-bold text-[#8a3d08] tracking-tight">
          SafeGround
        </Link>
        <div className="relative mt-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 px-3 bg-[#f6f5f1] rounded-md text-sm text-[#2c241f] placeholder:text-[#9a8a7d] focus:outline-none focus:ring-2 focus:ring-[#8a3d08]/20 transition-all"
          />
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#9a8a7d]">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#8a3d08]/10 text-[#8a3d08] font-semibold'
                        : 'text-[#6f5b4e] hover:bg-[#f8f7f3] hover:text-[#2c241f]'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#8a3d08]' : ''} />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-[#e5e0db] space-y-2">
        <PanicButton variant="sidebar" />
        <a
          href="mailto:support@safeground.app"
          className="w-full flex items-center gap-3 px-4 py-3 text-[#6f5b4e] hover:bg-[#f8f7f3] rounded-md text-base font-medium transition-colors duration-200"
        >
          <LifeBuoy size={18} />
          <span>Support</span>
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-[#6f5b4e] hover:bg-[#f8f7f3] rounded-md text-base font-medium transition-colors duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
