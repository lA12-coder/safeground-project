'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, LogOut, User, Settings, HelpCircle,
  ChevronDown, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { signOut } from '@/lib/auth/actions'

type DashboardTopBarProps = {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  pageTitle?: string
  breadcrumb?: string
}

const notifications = [
  { id: '1', title: 'Milestone reached!', body: 'You hit 14 days of strength.', time: '2h ago', type: 'success' },
  { id: '2', title: 'Urge pattern detected', body: 'High risk window predicted for tonight.', time: '5h ago', type: 'warning' },
  { id: '3', title: 'New affirmation ready', body: 'Your daily insight is available.', time: '1d ago', type: 'info' },
]

export function DashboardTopBar({ sidebarCollapsed, onToggleSidebar, pageTitle, breadcrumb }: DashboardTopBarProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const defaultTitle = pathname === '/dashboard' ? 'Recovery Intelligence Center'
    : pathname === '/log' ? 'Daily Check-In'
    : pathname === '/chat' ? 'Community Chat'
    : pathname === '/directory' ? 'Support Directory'
    : pathname === '/spiritual' ? 'Spiritual Support'
    : pathname.startsWith('/settings') ? 'Settings'
    : 'Dashboard'

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5e0db] shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-[#6f5b4e] hover:bg-[#f6f5f1] transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            {breadcrumb && (
              <>
                <span className="text-[#9a8a7d]">{breadcrumb}</span>
                <span className="text-[#9a8a7d]">›</span>
              </>
            )}
            <h1 className="font-semibold text-[#2c241f]">{pageTitle || defaultTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f6f5f1] text-[#6f5b4e] text-sm hover:bg-[#e5e0db] transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-[#9a8a7d]">Search...</span>
              <kbd className="hidden lg:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#e5e0db] text-[#9a8a7d] font-medium">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#6f5b4e] hover:bg-[#f6f5f1]"
            >
              <Search className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#e5e0db] rounded-xl shadow-lg p-3"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a7d]" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users, providers, messages..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#e5e0db] text-sm focus:outline-none focus:ring-2 focus:ring-[#92400E]/20"
                    />
                  </div>
                  {!searchQuery && (
                    <div className="mt-3 space-y-1 text-xs text-[#9a8a7d]">
                      <p className="px-2 py-1">Type to search across the platform...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-lg text-[#6f5b4e] hover:bg-[#f6f5f1] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#dc2626] rounded-full border-2 border-white" />
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#e5e0db] rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-3 border-b border-[#e5e0db]">
                    <p className="text-xs font-semibold text-[#2c241f]">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        className="w-full text-left p-3 hover:bg-[#fdf6ed] transition-colors border-b border-[#e5e0db]/50 last:border-0"
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant={n.type as 'success' | 'warning' | 'info'} size="sm">
                            {n.type === 'success' ? '✓' : n.type === 'warning' ? '!' : 'i'}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#2c241f]">{n.title}</p>
                            <p className="text-[11px] text-[#6f5b4e] truncate">{n.body}</p>
                            <p className="text-[10px] text-[#9a8a7d] mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[#e5e0db]">
                    <button className="w-full text-center text-xs font-semibold text-[#92400E] py-1.5 hover:bg-[#fdf6ed] rounded-lg transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />

          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#f6f5f1] transition-colors"
            >
              <Avatar name="User" size="sm" />
              <ChevronDown className="w-3.5 h-3.5 text-[#6f5b4e] hidden sm:block" />
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#e5e0db] rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-2 space-y-0.5">
                    <MenuItem icon={<User className="w-4 h-4" />} label="Profile" href="/settings" />
                    <MenuItem icon={<Settings className="w-4 h-4" />} label="Settings" href="/settings" />
                    <MenuItem icon={<HelpCircle className="w-4 h-4" />} label="Help" href="#" />
                    <hr className="my-1 border-[#e5e0db]" />
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#dc2626] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

function MenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#2c241f] hover:bg-[#f6f5f1] rounded-lg transition-colors"
    >
      {icon}
      {label}
    </a>
  )
}
