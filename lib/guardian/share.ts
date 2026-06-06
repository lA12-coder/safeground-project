import { resolvePublicSiteUrl } from '@/lib/site/config';

export function guardianShareUrl(token: string): string {
  const base = resolvePublicSiteUrl();
  return `${base}/guardian/view?token=${token}`;
}

export function guardianShareText(url: string): string {
  return `I'm working on something important for my wellbeing. I've given you a private link: ${url}. Thank you.`;
}
