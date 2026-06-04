'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Cross, LifeBuoy, MessageCircle, Settings, Shield, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const menuItems = [
  { label: 'Recovery', href: '/log', icon: Cross },
  { label: 'Community', href: '/chat', icon: Users },
  { label: 'Telehealth', href: '/directory', icon: LifeBuoy },
  { label: 'Faith Support', href: '/spiritual', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low transition-colors duration-300 z-30">
      <div className="px-6 pt-10">
        <Link href="/dashboard" className="font-serif text-3xl font-bold text-primary">
          SafeGround
        </Link>
        <p className="mt-1 font-serif text-sm font-bold tracking-widest text-on-surface/70">Privacy-First Recovery</p>
      </div>

      <nav className="mt-12 flex-1 space-y-4 pr-5">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-5 rounded-r-full px-6 py-4 font-serif font-bold tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface/70 hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Icon size={21} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-6 px-4 pb-12">
        <ThemeToggle className="mx-auto" />
        <button className="w-full rounded-full bg-tertiary px-6 py-4 font-serif font-bold text-on-tertiary shadow-sm hover:opacity-90 transition-all active:scale-95">
          Emergency Support
        </button>
        <div className="space-y-4 px-2 text-sm text-on-surface/70">
          <Link href="/settings/guardian" className="flex items-center gap-3 hover:text-on-surface transition-colors">
            <Settings size={18} />
            Settings
          </Link>
          <Link href="/settings/guardian" className="flex items-center gap-3 hover:text-on-surface transition-colors">
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
