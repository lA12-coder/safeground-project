'use client';

import { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import { AuthLeftPanel } from './AuthLeftPanel';
import { Shield } from 'lucide-react';

const adminFeatures = [
  { icon: Shield, title: 'Platform monitoring', desc: 'Real-time system oversight' },
  { icon: Shield, title: 'Provider management', desc: 'Verify and review providers' },
  { icon: Shield, title: 'Chat moderation', desc: 'Keep the community safe' },
  { icon: Shield, title: 'Analytics & insights', desc: 'Data-driven decision making' },
];

export function AdminLoginContent() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      <AuthLeftPanel
        headline="Admin Portal."
        subtitle="Secure access for SafeGround administrators to monitor, manage, and support the community."
        features={adminFeatures}
      />
      <div className="lg:col-span-7 w-full min-h-full bg-white flex items-center justify-center p-8">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }>
            <LoginForm mode="admin" defaultRedirectTo="/admin" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
