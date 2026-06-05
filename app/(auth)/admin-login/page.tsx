import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <AuthLayout
      title="Admin login"
      icon={<ShieldCheck className="w-5 h-5" />}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }>
        <LoginForm mode="admin" defaultRedirectTo="/admin" />
      </Suspense>
    </AuthLayout>
  );
}
