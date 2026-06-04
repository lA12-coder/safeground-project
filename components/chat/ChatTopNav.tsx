'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { PanicButton } from '@/components/layout/PanicButton';

export function ChatTopNav() {
  return (
    <header className="h-14 shrink-0 bg-[#121212] border-b border-[#2a2a2a] flex items-center justify-between px-6 md:px-10">
      <Link href="/" className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-[#d97706]" aria-hidden />
        <span className="font-serif text-xl font-bold text-[#d97706]">SafeGround</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/chat" className="text-[#d97706] border-b-2 border-[#d97706] pb-0.5">
          Community
        </Link>
        <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
          Recovery
        </Link>
        <Link href="/directory" className="text-zinc-400 hover:text-white transition-colors">
          Support
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <PanicButton variant="header" />
        <Link
          href="/settings/guardian"
          className="w-9 h-9 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-zinc-400 hover:text-white text-xs font-bold"
          aria-label="Profile settings"
        >
          SG
        </Link>
      </div>
    </header>
  );
}
