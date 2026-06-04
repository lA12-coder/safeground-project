'use client';

import Link from 'next/link';
import { Shield, User } from 'lucide-react';

type GuestTopBarProps = {
  sessionId: string;
};

export function GuestTopBar({ sessionId }: GuestTopBarProps) {
  return (
    <header className="h-16 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-6 md:px-10 shrink-0">
      <Link href="/" className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <span className="font-serif text-xl font-bold text-primary">SafeGround</span>
      </Link>

      <div className="flex items-center gap-3 md:gap-4">
        <span className="hidden sm:inline text-xs font-mono font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
          Session: {sessionId}
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-secondary bg-secondary-container px-3 py-1.5 rounded-full">
          PRIVACY ACTIVE
        </span>
        <div
          className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center"
          aria-hidden
        >
          <User className="w-5 h-5 text-on-surface-variant" />
        </div>
      </div>
    </header>
  );
}
