'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { PanicButton } from './PanicButton';

type NavLink = { label: string; href: string };

type SiteHeaderProps = {
  navLinks?: NavLink[];
  showSignIn?: boolean;
  variant?: 'public' | 'minimal';
};

const defaultNav: NavLink[] = [
  { label: 'Recovery', href: '/#features' },
  { label: 'Community', href: '/chat' },
  { label: 'Providers', href: '/directory' },
  { label: 'Faith', href: '/spiritual' },
];

export function SiteHeader({
  navLinks = defaultNav,
  showSignIn = true,
  variant = 'public',
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/60">
      <nav className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-6xl mx-auto gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Shield className="w-6 h-6 text-primary" aria-hidden />
          <span className="text-2xl font-serif font-bold text-primary">SafeGround</span>
        </Link>

        {variant === 'public' && (
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {showSignIn && (
            <FullPageLink href="/login" className="btn-ghost text-sm hidden sm:inline-flex">
              Sign In
            </FullPageLink>
          )}
          <PanicButton variant="header" />
        </div>
      </nav>
    </header>
  );
}
