import { SiteHeader } from '@/components/layout/SiteHeader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <SiteHeader />
      <div className="flex-grow">{children}</div>
    </div>
  );
}
