import { resolvePublicSiteUrl } from '@/lib/site/config';

/** Canonical app URL for Supabase email links and OAuth redirects */
export function getSiteUrl(): string {
  return resolvePublicSiteUrl();
}

export function getAuthCallbackUrl(next = '/onboarding'): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
