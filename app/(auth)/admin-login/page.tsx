import { Suspense } from 'react';
import { AdminLoginContent } from '@/components/auth/AdminLoginContent';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F5F2EE]">
        <div className="w-8 h-8 border-2 border-[#8B3A0F]/30 border-t-[#8B3A0F] rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
