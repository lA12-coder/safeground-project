'use client';

import { Suspense } from 'react';
import { RegisterForm } from './RegisterForm';
import { AuthLeftPanel } from './AuthLeftPanel';
import { Ghost, PhoneOff, Sparkles, Handshake } from 'lucide-react';

const registerFeatures = [
  { icon: Ghost, title: '100% anonymous identity', desc: 'Your real name stays hidden' },
  { icon: PhoneOff, title: 'No phone number needed', desc: 'Only an email to start' },
  { icon: Sparkles, title: 'Personalized AI recovery tools', desc: 'Tailored to your journey' },
  { icon: Handshake, title: '24/7 community & crisis support', desc: 'Never alone in your recovery' },
];

export function RegisterPageContent() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      <AuthLeftPanel
        headline="Start Your Journey."
        subtitle="Create a private, anonymous account and begin your recovery journey with SafeGround."
        features={registerFeatures}
      />
      <div className="lg:col-span-7 w-full min-h-full bg-white flex items-center justify-center p-8">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#8B3A0F]/30 border-t-[#8B3A0F] rounded-full animate-spin" />
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
