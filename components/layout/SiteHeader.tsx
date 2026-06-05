'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
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

const mobileNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Recovery', href: '/#features' },
  { label: 'Community', href: '/chat' },
  { label: 'Providers', href: '/directory' },
  { label: 'Faith', href: '/spiritual' },
  { label: 'Guest Access', href: '/guest' },
];

export function SiteHeader({
  navLinks = defaultNav,
  showSignIn = true,
  variant = 'public',
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/60">
      <nav className="flex justify-between items-center w-full px-4 md:px-12 py-3 md:py-4 max-w-6xl mx-auto gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Shield className="w-6 h-6 text-primary" aria-hidden />
          <span className="text-xl md:text-2xl font-serif font-bold text-primary">SafeGround</span>
        </Link>

        {variant === 'public' && (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="hidden sm:flex items-center gap-3">
          {variant === 'public' && showSignIn && (
            <>
              <FullPageLink href="/login" className="btn-ghost text-sm">
                Sign In
              </FullPageLink>
              <FullPageLink
                href="/register"
                className="bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-full hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
              >
                Get Started <ArrowRight size={14} />
              </FullPageLink>
            </>
          )}
          <PanicButton variant="header" />
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <PanicButton variant="header" />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && variant === 'public' && (
        <div className="fixed inset-0 top-[57px] z-40 bg-surface md:hidden">
          <div className="flex flex-col p-6 gap-2">
            {mobileNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-4 border-outline-variant" />
            <FullPageLink
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="bg-primary text-on-primary text-center font-semibold px-5 py-3 rounded-full hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </FullPageLink>
            <FullPageLink
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="btn-ghost text-center py-3"
            >
              Sign In
            </FullPageLink>
          </div>
        </div>
      )}
    </header>
  );
}
