'use client';

import { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import { AuthLeftPanel } from './AuthLeftPanel';
import { Lock, Database, Sparkles, Handshake } from 'lucide-react';

const loginFeatures = [
  { icon: Lock, title: 'End-to-end encrypted', desc: 'Your data stays private, always' },
  { icon: Database, title: 'Zero personal data stored', desc: 'No tracking, no profiling' },
  { icon: Sparkles, title: 'AI-powered support tools', desc: 'Personalized recovery insights' },
  { icon: Handshake, title: '24/7 crisis support', desc: 'Immediate help when you need it' },
];

export function LoginPageContent() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      <AuthLeftPanel
        headline="Welcome Back."
        subtitle="Your private recovery journey continues here. Sign in to pick up where you left off."
        features={loginFeatures}
      />
      <div className="lg:col-span-7 w-full min-h-full bg-white flex items-center justify-center p-8">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#8B3A0F]/30 border-t-[#8B3A0F] rounded-full animate-spin" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
