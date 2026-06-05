'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, BookOpen, MessageCircle, Users, Sparkles, Settings,
  LogOut, Shield, UserRound, Heart, LayoutDashboard, Cross,
  Calendar, ChartBar, ChevronLeft, PanelLeft,
} from 'lucide-react';
import { PanicButton } from './PanicButton';
import { signOut } from '@/lib/auth/actions';

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
};

const userMenu: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Daily Check-In', href: '/checkin', icon: BookOpen },
  { label: 'Panic Center', href: '/panic', icon: Shield },
  { label: 'Chat Rooms', href: '/chat', icon: MessageCircle },
  { label: 'Support Directory', href: '/directory', icon: Users },
  { label: 'Faith Support', href: '/spiritual', icon: Sparkles },
  { label: 'Guardian', href: '/settings/guardian', icon: UserRound },
  { label: 'Profile', href: '/profile', icon: UserRound },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const adminMenu: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Recovery', href: '/admin/recovery', icon: Cross },
  { label: 'Community', href: '/admin/community', icon: Heart },
  { label: 'Telehealth', href: '/admin/telehealth', icon: Calendar },
  { label: 'Moderation', href: '/admin/moderation', icon: Shield },
  { label: 'Providers', href: '/admin/providers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: ChartBar },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const providerMenu: SidebarItem[] = [
  { label: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
  { label: 'Schedule', href: '/provider/dashboard', icon: Calendar },
  { label: 'Patients', href: '/provider/dashboard', icon: Users },
  { label: 'Notes', href: '/provider/dashboard', icon: BookOpen },
  { label: 'Availability', href: '/provider/dashboard', icon: Settings },
];

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  role?: 'user' | 'admin' | 'provider';
};

export function Sidebar({ collapsed = false, onToggle, role = 'user' }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = role === 'admin' ? adminMenu
    : role === 'provider' ? providerMenu
    : userMenu;

  const isActive = (href: string) => {
    if (href === '/settings') return pathname.startsWith('/settings');
    if (role === 'admin') return pathname === href || pathname.startsWith(`${href}/`);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="hidden md:flex flex-col bg-white border-r border-[#e5e0db] fixed left-0 top-0 h-screen z-30 overflow-hidden"
    >
      <div className={`flex items-center h-14 border-b border-[#e5e0db] ${collapsed ? 'justify-center px-2' : 'px-4 justify-between'}`}>
        {!collapsed && (
          <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#92400E]" />
            <span className="font-serif text-lg font-bold text-[#92400E]">SafeGround</span>
          </Link>
        )}
        {collapsed && (
          <Link href={role === 'admin' ? '/admin' : '/dashboard'}>
            <Shield className="w-6 h-6 text-[#92400E]" />
          </Link>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-[#6f5b4e] hover:bg-[#f6f5f1] transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                active
                  ? 'bg-[#fdf6ed] text-[#92400E] font-semibold border-l-4 border-l-[#92400E] rounded-l-none'
                  : 'text-[#6f5b4e] hover:bg-[#f6f5f1] hover:text-[#2c241f] border-l-4 border-l-transparent'
              } ${collapsed ? 'justify-center px-0 border-l-0 rounded-lg' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={active ? 20 : 18} aria-hidden />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-3 border-t border-[#e5e0db] space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <PanicButton variant="sidebar" />
      </div>

      {!collapsed && (
        <div className="p-3 pt-1 border-t border-[#e5e0db]">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6f5b4e] hover:bg-[#f6f5f1] rounded-lg transition-colors text-sm"
            >
              <LogOut size={18} aria-hidden />
              <span>Logout</span>
            </button>
          </form>
        </div>
      )}
      {collapsed && (
        <div className="p-3 pt-1 border-t border-[#e5e0db]">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center justify-center p-2.5 text-[#6f5b4e] hover:bg-[#f6f5f1] rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} aria-hidden />
            </button>
          </form>
        </div>
      )}
    </motion.aside>
  );
}
