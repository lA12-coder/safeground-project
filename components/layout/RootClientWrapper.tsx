'use client';

import dynamic from 'next/dynamic';
import { AIChatWidget } from '@/components/chat/AIChatWidget';

export function RootClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIChatWidget />
    </>
  );
}
