/** Canonical app URL for Supabase email links and OAuth redirects */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  return 'http://localhost:3000';
}

export function getAuthCallbackUrl(next = '/onboarding'): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
