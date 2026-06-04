'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Cross, LifeBuoy, MessageCircle, Settings, Shield, Users } from 'lucide-react'

const menuItems = [
  { label: 'Recovery', href: '/log', icon: Cross },
  { label: 'Community', href: '/chat', icon: Users },
  { label: 'Telehealth', href: '/directory', icon: LifeBuoy },
  { label: 'Faith Support', href: '/spiritual', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-[#decfc4] bg-[#f5f5f4]">
      <div className="px-6 pt-10">
        <Link href="/dashboard" className="font-serif text-3xl font-bold text-[#8a3d08]">
          SafeGround
        </Link>
        <p className="mt-1 font-serif text-sm font-bold tracking-widest text-[#2e1f18]">Privacy-First Recovery</p>
      </div>

      <nav className="mt-12 flex-1 space-y-4 pr-5">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-5 rounded-r-full px-6 py-4 font-serif font-bold tracking-wider transition ${
                isActive
                  ? 'bg-[#8bf2a1] text-[#007233]'
                  : 'text-[#3b2418] hover:bg-white'
              }`}
            >
              <Icon size={21} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-8 px-4 pb-12">
        <button className="w-full rounded-full bg-[#c7532b] px-6 py-4 font-serif font-bold text-white shadow-sm">
          Emergency Support
        </button>
        <div className="space-y-4 px-2 text-sm text-[#3b2418]">
          <Link href="/settings/guardian" className="flex items-center gap-3">
            <Settings size={18} />
            Settings
          </Link>
          <Link href="/settings/guardian" className="flex items-center gap-3">
            <Shield size={18} />
            Privacy
          </Link>
          <Link href="/chat" className="hidden items-center gap-3">
            <MessageCircle size={18} />
            Chat
          </Link>
        </div>
      </div>
    </aside>
  )
}
