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
} from 'lucide-react';
import { PanicButton } from './PanicButton';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Habit Log',
    href: '/log',
    icon: BookOpen,
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: MessageCircle,
  },
  {
    label: 'Directory',
    href: '/directory',
    icon: Users,
  },
  {
    label: 'Spiritual',
    href: '/spiritual',
    icon: Sparkles,
  },
  {
    label: 'Settings',
    href: '/settings/guardian',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand-primary">SafeGround</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.includes(href.split('/')[1]);
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Panic Button */}
      <div className="p-4 border-t border-gray-200">
        <PanicButton />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
