import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPostAuthRedirect } from '@/lib/auth/onboarding';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const destination = getPostAuthRedirect(user, next);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Email confirmation links land here without a code when misconfigured
  const confirmed = searchParams.get('type') === 'signup' || searchParams.get('confirmed') === 'true';
  if (confirmed) {
    return NextResponse.redirect(`${origin}/login?confirmed=1&redirectTo=/onboarding`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Sign-in link expired or invalid. Please try again.')}`
  );
}
