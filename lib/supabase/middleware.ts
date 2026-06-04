import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  isProtectedPath,
  ONBOARDING_PATH,
  sanitizeRedirectTo,
} from '@/lib/auth/paths';
import { isOnboardingComplete } from '@/lib/auth/onboarding';
import { AUTH_ENTRY_PATHS, isNextClientNavigation } from '@/lib/auth/middleware-utils';

const EXTRA_PROTECTED_PREFIXES = ['/provider', '/org/portal'];

function isExtraProtectedPath(pathname: string): boolean {
  return EXTRA_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

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

  if (pathname.startsWith('/guardian/') || pathname.startsWith('/org/register')) {
    return supabaseResponse;
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return redirectWithSession(request, '/login', supabaseResponse);
    }
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
      return redirectWithSession(request, '/', supabaseResponse);
    }
    return supabaseResponse;
  }

  let onboardingDone = isOnboardingComplete(user);

  if (user && !onboardingDone) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.onboarding_done) {
      onboardingDone = true;
    }
  }

  const clientNav = isNextClientNavigation(request);

  if (clientNav && AUTH_ENTRY_PATHS.has(pathname)) {
    return supabaseResponse;
  }

  const requiresAuth = isProtectedPath(pathname) || isExtraProtectedPath(pathname);

  if (!user && requiresAuth) {
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
    if (requiresAuth) {
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
