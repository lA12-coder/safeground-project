import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center px-6 py-12">
      <Suspense fallback={<div className="text-on-surface-variant">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
