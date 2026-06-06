/** Routes that do not require authentication */
export const PUBLIC_EXACT_PATHS = new Set(['/', '/login', '/admin-login', '/register', '/guest', '/services']);

export const PUBLIC_GUARDIAN_PREFIX = '/guardian';

export const ONBOARDING_PATH = '/onboarding';

export const PUBLIC_PREFIXES = ['/auth'];

/** Routes that require a signed-in user (exact path or nested, e.g. /settings/guardian) */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/log',
  '/checkin',
  '/panic',
  '/profile',
  '/chat',
  '/directory',
  '/spiritual',
  '/settings',
  '/bookings',
] as const;

const AUTH_ENTRY_PATHS = new Set(['/login', '/admin-login', '/register', '/guest', ONBOARDING_PATH]);

export { AUTH_ENTRY_PATHS };

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Match protected routes without false positives (e.g. /login must NOT match /log).
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/** Safe post-login destination — blocks auth pages and redirect loops */
export function sanitizeRedirectTo(redirectTo: string | null | undefined): string | null {
  if (!redirectTo?.startsWith('/')) return null;
  if (AUTH_ENTRY_PATHS.has(redirectTo)) return null;
  if (redirectTo.startsWith('/auth')) return null;
  return redirectTo;
}
