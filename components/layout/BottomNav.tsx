'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, Users, Sparkles, Shield } from 'lucide-react';

const menuItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Log', href: '/log', icon: BookOpen },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Care', href: '/directory', icon: Users },
  { label: 'Faith', href: '/spiritual', icon: Sparkles },
  { label: 'Guardian', href: '/settings/guardian', icon: Shield },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 text-[10px] transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon size={20} aria-hidden />
              <span className="mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
