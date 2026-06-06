import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { isOnboardingComplete } from '@/lib/auth/onboarding';
import { ONBOARDING_PATH } from '@/lib/auth/paths';

/** Redirect to login/onboarding unless the user has a valid session. */
export async function requireUser(redirectTo: string): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  let onboardingDone = isOnboardingComplete(user);
  if (!onboardingDone) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .maybeSingle();
    onboardingDone = Boolean(profile?.onboarding_done);
  }

  if (!onboardingDone) {
    redirect(ONBOARDING_PATH);
  }

  return user;
}
