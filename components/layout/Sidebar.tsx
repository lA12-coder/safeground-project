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
} from 'lucide-react';
import { PanicButton } from './PanicButton';
import { signOut } from '@/lib/auth/actions';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Habit Log', href: '/log', icon: BookOpen },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Directory', href: '/directory', icon: Users },
  { label: 'Spiritual', href: '/spiritual', icon: Sparkles },
  { label: 'Guardian', href: '/settings/guardian', icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-screen z-30">
      <Link href="/dashboard" className="p-6 border-b border-outline-variant flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <span className="font-serif text-xl font-bold text-primary">SafeGround</span>
      </Link>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant">
        <PanicButton variant="sidebar" />
      </div>

      <div className="p-4 border-t border-outline-variant">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <LogOut size={20} aria-hidden />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
