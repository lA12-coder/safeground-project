import { Shield, Sparkles } from 'lucide-react';

type AuthLayoutProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthLayout({ title, icon, children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            {icon || <Shield className="w-7 h-7 text-primary" />}
          </div>
          <h1 className="text-3xl font-serif font-bold text-on-surface">
            {title}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
