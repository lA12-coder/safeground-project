/** Live production deployment (Render). */
export const PRODUCTION_SITE_URL = 'https://safeground-project.onrender.com';

/** Resolve the public app URL for auth, guardian links, and metadata. */
export function resolvePublicSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.RENDER_EXTERNAL_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const raw of candidates) {
    const url = raw?.trim();
    if (url) return url.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') return PRODUCTION_SITE_URL;
  return 'http://localhost:3000';
}
