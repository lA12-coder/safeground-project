'use client';

import { useEffect, useState } from 'react';
import { generateGuestSessionId } from '@/lib/guest/constants';
import { GuestTopBar } from './GuestTopBar';
import { GuestChatPanel } from './GuestChatPanel';
import { GuestRightPanel } from './GuestRightPanel';
import { GuestPanicFab } from './GuestPanicFab';

export function GuestSanctuary() {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('sg_guest_session');
    if (stored) {
      setSessionId(stored);
    } else {
      const id = generateGuestSessionId();
      sessionStorage.setItem('sg_guest_session', id);
      setSessionId(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <GuestTopBar sessionId={sessionId || 'SG-ANON-…'} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <GuestChatPanel />
          </div>
          <div className="lg:col-span-2">
            <GuestRightPanel />
          </div>
        </div>
      </main>
      <GuestPanicFab />
    </div>
  );
}
