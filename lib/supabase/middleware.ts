import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  isProtectedPath,
  ONBOARDING_PATH,
  sanitizeRedirectTo,
} from '@/lib/auth/paths';
import { isOnboardingComplete } from '@/lib/auth/onboarding';
import { AUTH_ENTRY_PATHS, isNextClientNavigation } from '@/lib/auth/middleware-utils';

/** Preserve session cookies set during getUser() on redirect responses */
function redirectWithSession(request: NextRequest, pathname: string, sessionResponse: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  const redirectResponse = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectResponse.cookies.set(name, value, options);
  });
  return redirectResponse;
}

function redirectWithSessionAndSearch(
  request: NextRequest,
  pathname: string,
  searchParams: Record<string, string>,
  sessionResponse: NextResponse
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const redirectResponse = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectResponse.cookies.set(name, value, options);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const onboardingDone = isOnboardingComplete(user);
  const clientNav = isNextClientNavigation(request);

  if (clientNav && AUTH_ENTRY_PATHS.has(pathname)) {
    return supabaseResponse;
  }

  // Protected app routes (not onboarding — checked in onboarding/layout.tsx)
  if (!user && isProtectedPath(pathname)) {
    const safeRedirect = sanitizeRedirectTo(pathname) ?? '/dashboard';
    return redirectWithSessionAndSearch(
      request,
      '/login',
      { redirectTo: safeRedirect },
      supabaseResponse
    );
  }

  if (user && !onboardingDone) {
    if (pathname === '/login' || pathname === '/register') {
      return redirectWithSession(request, ONBOARDING_PATH, supabaseResponse);
    }
    if (isProtectedPath(pathname)) {
      return redirectWithSession(request, ONBOARDING_PATH, supabaseResponse);
    }
  }

  if (user && onboardingDone && pathname === ONBOARDING_PATH) {
    return redirectWithSession(request, '/dashboard', supabaseResponse);
  }

  if (user && onboardingDone && (pathname === '/login' || pathname === '/register')) {
    return redirectWithSession(request, '/dashboard', supabaseResponse);
  }

  return supabaseResponse;
}
