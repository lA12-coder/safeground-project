import type { User } from '@supabase/supabase-js';
import { sanitizeRedirectTo } from '@/lib/auth/paths';

export function isOnboardingComplete(user: User | null | undefined): boolean {
  return user?.user_metadata?.onboarding_complete === true;
}

function isAdminEmail(user: User | null | undefined): boolean {
  if (!user?.email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(user.email.toLowerCase());
}

/** Where to send the user immediately after a successful sign-in */
export function getPostAuthRedirect(
  user: User | null | undefined,
  requestedRedirect?: string | null
): string {
  if (!isOnboardingComplete(user)) {
    return '/onboarding';
  }

  const safe = sanitizeRedirectTo(requestedRedirect);
  if (safe) return safe;

  return isAdminEmail(user) ? '/admin' : '/dashboard';
}
