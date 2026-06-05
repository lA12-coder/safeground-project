'use client';

import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { BackButton } from '@/components/layout/BackButton';

export function RootClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BackButton />
      <AIChatWidget />
    </>
  );
}
