import { Suspense } from 'react';
import { LoginPageContent } from '@/components/auth/LoginPageContent';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#8B3A0F]/30 border-t-[#8B3A0F] rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
