'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Cross, Users, Calendar, Shield,
  CalendarCheck, BarChart3, Settings, LogOut, LifeBuoy, AlertTriangle,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Recovery', href: '/admin/recovery', icon: Cross },
  { label: 'Community', href: '/admin/community', icon: Users },
  { label: 'Telehealth', href: '/admin/telehealth', icon: Calendar },
  { label: 'Moderation', href: '/admin/moderation', icon: Shield },
  { label: 'Appointments', href: '/admin/appointments', icon: CalendarCheck },
  { label: 'Programs', href: '/admin/programs', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#d6d3d1]/30 flex flex-col z-40">
      <div className="p-6 border-b border-[#d6d3d1]/30">
        <Link href="/admin" className="text-2xl font-bold text-[#92400E]">
          SafeGround
        </Link>
        <div className="relative mt-3">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 px-3 bg-[#f5f5f4] rounded-lg text-sm text-[#1c1917] placeholder:text-[#64748B]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/30"
          />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#92f5a4] text-[#007233]'
                  : 'text-[#64748B] hover:bg-[#f5f5f4]'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#d6d3d1]/30 space-y-2">
        <button className="w-full py-3 px-4 bg-[#B91C1C] hover:bg-red-700 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
          <AlertTriangle size={16} />
          <span>PANIC</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:bg-[#f5f5f4] rounded-lg text-sm font-medium transition-colors">
          <LifeBuoy size={18} />
          <span>Support</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:bg-[#f5f5f4] rounded-lg text-sm font-medium transition-colors">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
