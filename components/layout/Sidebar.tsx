'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  MessageCircle,
  Users,
  Sparkles,
  Settings,
  LogOut,
  Shield,
  UserRound,
} from 'lucide-react';
import { PanicButton } from './PanicButton';
import { signOut } from '@/lib/auth/actions';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Habit Log', href: '/log', icon: BookOpen },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Directory', href: '/directory', icon: Users },
  { label: 'Spiritual', href: '/spiritual', icon: Sparkles },
  { label: 'Guardian', href: '/settings/guardian', icon: UserRound },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/settings') return pathname.startsWith('/settings');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-screen z-30">
      <Link href="/dashboard" className="p-6 border-b border-outline-variant flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <span className="font-serif text-xl font-bold text-primary">SafeGround</span>
      </Link>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <Icon size={18} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant">
        <PanicButton variant="sidebar" />
      </div>

      <div className="p-4 pt-2 border-t border-outline-variant">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} aria-hidden />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
