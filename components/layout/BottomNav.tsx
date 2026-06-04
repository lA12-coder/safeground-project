'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  MessageCircle,
  Users,
  Sparkles,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Log',
    href: '/log',
    icon: BookOpen,
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: MessageCircle,
  },
  {
    label: 'Providers',
    href: '/directory',
    icon: Users,
  },
  {
    label: 'Spirit',
    href: '/spiritual',
    icon: Sparkles,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.includes(href.split('/')[1]);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs transition-colors ${
                isActive ? 'text-brand-primary font-semibold' : 'text-gray-600'
              }`}
            >
              <Icon size={24} />
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
