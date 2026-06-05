'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Menu, X, ArrowRight, LayoutDashboard, ClipboardCheck,
  AlertTriangle, MessageCircle, UserCheck, Search,
  Info, HelpCircle,
  Phone, ChevronDown, Activity, Cross, PanelRight,
} from 'lucide-react';
import { FullPageLink } from '@/components/ui/FullPageLink';

type MegaMenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  desc?: string;
};

type MegaMenuGroup = {
  label: string;
  items: MegaMenuItem[];
};

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  megaMenu?: MegaMenuGroup[];
  href?: string;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  {
    label: 'Features',
    icon: Activity,
    megaMenu: [
      {
        label: 'Recovery',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, desc: 'Track mood, urges & streaks' },
          { label: 'Daily Check-In', href: '/checkin', icon: ClipboardCheck, desc: 'Log your daily progress' },
          { label: 'Panic Button', href: '/panic', icon: AlertTriangle, desc: 'Immediate crisis support' },
        ],
      },
      {
        label: 'Support',
        items: [
          { label: 'Community Chat', href: '/chat', icon: MessageCircle, desc: 'Anonymous peer support' },
          { label: 'Support Directory', href: '/directory', icon: Search, desc: 'Browse verified providers' },
          { label: 'Guardian Support', href: '/settings/guardian', icon: UserCheck, desc: 'Invite a trusted person' },
        ],
      },
    ],
  },
  {
    label: 'About',
    icon: Info,
    megaMenu: [
      {
        label: 'Learn More',
        items: [
          { label: 'How It Works', href: '/#how-it-works', icon: HelpCircle, desc: 'Understand the platform' },
          { label: 'Privacy First', href: '/#faq', icon: Shield, desc: 'Your data stays yours' },
          { label: 'Contact', href: 'mailto:support@safeground.app', icon: Phone, desc: 'Get in touch' },
          { label: 'Our Mission', href: '/#about', icon: Info, desc: 'Our values & vision' },
        ],
      },
    ],
  },
];

const mobileNavExtended = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Dashboard', href: '/dashboard', icon: Activity },
  { label: 'Check-In', href: '/checkin', icon: ClipboardCheck },
  { label: 'Panic', href: '/panic', icon: AlertTriangle },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Directory', href: '/directory', icon: Search },
  { label: 'Faith', href: '/spiritual', icon: Cross },
  { label: 'Guardian', href: '/settings/guardian', icon: UserCheck },
  { label: 'Guest', href: '/guest', icon: PanelRight },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node) &&
          navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMega(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMega(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    setOpenMega(null);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isAnyActive = (item: NavItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.megaMenu) {
      return item.megaMenu.some(group =>
        group.items.some(sub => isActive(sub.href))
      );
    }
    return false;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-[#e5e0db] shadow-sm'
        : 'bg-white/80 backdrop-blur-md border-b border-transparent'
    }`}>
      <nav className="flex items-center justify-between w-full px-4 md:px-10 h-14 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-[#92400E] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" aria-hidden />
          </div>
          <span className="text-lg font-serif font-bold text-[#2c241f]">
            Safe<span className="text-[#92400E]">Ground</span>
          </span>
        </Link>

        <div ref={navRef} className="hidden lg:flex items-center h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isAnyActive(item);
            return (
              <div key={item.label} className="relative h-full flex items-center">
                {item.megaMenu ? (
                  <button
                    type="button"
                    onMouseEnter={() => setOpenMega(item.label)}
                    onClick={() => setOpenMega(openMega === item.label ? null : item.label)}
                    className={`flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors ${
                      active
                        ? 'text-[#92400E] border-b-2 border-[#92400E]'
                        : 'text-[#6f5b4e] hover:text-[#2c241f] hover:border-b-2 hover:border-[#e5e0db]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openMega === item.label ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors ${
                      isActive(item.href!)
                        ? 'text-[#92400E] border-b-2 border-[#92400E]'
                        : 'text-[#6f5b4e] hover:text-[#2c241f] hover:border-b-2 hover:border-[#e5e0db]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )}

                {item.megaMenu && (
                  <AnimatePresence>
                    {openMega === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        onMouseEnter={() => setOpenMega(item.label)}
                        onMouseLeave={() => setOpenMega(null)}
                        className="absolute left-0 top-full z-50"
                      >
                        <div className="bg-white border border-[#e5e0db] rounded-lg shadow-xl shadow-black/5 overflow-hidden min-w-[380px] mt-0">
                          <div className="flex gap-0">
                            {item.megaMenu.map((group, gi) => (
                              <div key={group.label} className={`p-3 ${gi < item.megaMenu!.length - 1 ? 'border-r border-[#e5e0db]/50' : ''}`}>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9a8a7d] mb-1.5 px-2">
                                  {group.label}
                                </p>
                                <div className="space-y-0.5 min-w-[160px]">
                                  {group.items.map((sub) => {
                                    const SubIcon = sub.icon;
                                    const isSubActive = isActive(sub.href);
                                    return (
                                      <Link
                                        key={sub.href}
                                        href={sub.href}
                                        onClick={() => setOpenMega(null)}
                                        className={`flex items-center gap-2.5 px-2 py-2 rounded-md transition-colors ${
                                          isSubActive ? 'bg-[#fdf6ed]' : 'hover:bg-[#f6f5f1]'
                                        }`}
                                      >
                                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                                          isSubActive ? 'bg-[#92400E]/10 text-[#92400E]' : 'bg-[#f6f5f1] text-[#6f5b4e]'
                                        }`}>
                                          <SubIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className={`text-xs font-medium ${isSubActive ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                                            {sub.label}
                                          </p>
                                          {sub.desc && (
                                            <p className="text-[10px] text-[#9a8a7d] truncate">{sub.desc}</p>
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1.5">
          <FullPageLink
            href="/login"
            className="px-3.5 py-1.5 rounded-md text-sm font-medium text-[#6f5b4e] hover:text-[#2c241f] hover:bg-[#f6f5f1] transition-colors"
          >
            Sign In
          </FullPageLink>
          <FullPageLink
            href="/register"
            className="px-3.5 py-1.5 rounded-md text-sm font-semibold text-white bg-[#92400E] hover:bg-[#a04e14] transition-colors shadow-sm"
          >
            Start Anonymously
          </FullPageLink>
          <FullPageLink
            href="/panic"
            className="px-3.5 py-1.5 rounded-md text-sm font-semibold text-white bg-[#dc2626] hover:bg-[#b91c1c] transition-colors"
          >
            Panic
          </FullPageLink>
        </div>

        <div className="flex lg:hidden items-center gap-1.5">
          <FullPageLink
            href="/panic"
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#dc2626]"
          >
            Panic
          </FullPageLink>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-md text-[#6f5b4e] hover:text-[#92400E] hover:bg-[#f6f5f1] transition-all"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden bg-white border-t border-[#e5e0db] overflow-hidden shadow-lg"
          >
            <div className="p-3 space-y-0.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {mobileNavExtended.map((link) => {
                const Icon = link.icon;
                const isLinkActive = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isLinkActive
                        ? 'bg-[#fdf6ed] text-[#92400E]'
                        : 'text-[#6f5b4e] hover:bg-[#f6f5f1] hover:text-[#2c241f]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isLinkActive ? 'text-[#92400E]' : ''}`} />
                    {link.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-[#e5e0db]" />
              <FullPageLink
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#92400E] text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-[#a04e14] transition-colors"
              >
                Start Anonymously <ArrowRight size={14} />
              </FullPageLink>
              <FullPageLink
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-3 py-2.5 text-sm text-[#6f5b4e] font-medium hover:text-[#92400E] transition-colors"
              >
                Sign In
              </FullPageLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
