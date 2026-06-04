import { SiteHeader } from '@/components/layout/SiteHeader';
import { PrivacyBadges } from '@/components/layout/PrivacyBadges';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <SiteHeader variant="minimal" showSignIn />
      <div className="flex-grow">{children}</div>
      <PrivacyBadges />
    </div>
  );
}
