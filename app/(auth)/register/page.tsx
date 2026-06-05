import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Sparkles } from 'lucide-react';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Begin your healing"
      icon={<Sparkles className="w-5 h-5" />}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
