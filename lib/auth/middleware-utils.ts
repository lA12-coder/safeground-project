import type { NextRequest } from 'next/server';

/** True when Next.js is fetching flight/RSC data for client-side routing */
export function isNextClientNavigation(request: NextRequest): boolean {
  return (
    request.headers.get('rsc') === '1' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.has('next-router-state-tree')
  );
}

export const AUTH_ENTRY_PATHS = new Set(['/login', '/register']);
