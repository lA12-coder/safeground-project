import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isOnboardingComplete } from '@/lib/auth/onboarding';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/onboarding');
  }

  if (isOnboardingComplete(user)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
