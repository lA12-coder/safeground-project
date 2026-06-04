'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithEmail, type AuthActionResult } from '@/lib/auth/actions';
import { sanitizeRedirectTo } from '@/lib/auth/paths';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmEmailPanel } from './ConfirmEmailPanel';

const initialState: AuthActionResult = {};

function needsEmailConfirmation(error: string | undefined): boolean {
  if (!error) return false;
  const msg = error.toLowerCase();
  return msg.includes('confirm') || msg.includes('verified') || msg.includes('not confirmed');
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectTo(searchParams.get('redirectTo')) ?? '/onboarding';
  const urlError = searchParams.get('error');
  const awaitingConfirmation = searchParams.get('confirmEmail') === '1';
  const emailFromUrl = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailFromUrl);
  const [state, formAction, pending] = useActionState(signInWithEmail, initialState);

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const showResend = Boolean(email && (awaitingConfirmation || needsEmailConfirmation(state.error)));
  const showGenericError =
    (state.error && !needsEmailConfirmation(state.error)) ||
    (urlError && !needsEmailConfirmation(urlError));

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="card p-8 md:p-10 space-y-8 parchment-glow">
        <div className="text-center space-y-2">
          <h1 className="heading-md">Welcome back</h1>
          <p className="body-md">Sign in to continue your private recovery journey.</p>
        </div>

        {showResend && <ConfirmEmailPanel email={email} />}

        {showGenericError && (
          <p className="text-sm text-error bg-error-container/30 rounded-lg px-4 py-3" role="alert">
            {state.error ?? urlError}
          </p>
        )}

        <GoogleSignInButton redirectPath="/auth/callback?next=/onboarding" />

        <div className="flex items-center gap-4">
          <div className="flex-grow h-px bg-outline-variant" />
          <span className="text-xs text-on-surface-variant font-semibold uppercase">or</span>
          <div className="flex-grow h-px bg-outline-variant" />
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <label htmlFor="email" className="label-caps block mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@university.edu.et"
            />
          </div>
          <div>
            <label htmlFor="password" className="label-caps block mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={pending} className="w-full btn-primary disabled:opacity-60">
            {pending ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="text-center space-y-3 pt-2">
          <p className="body-md">
            New here?{' '}
            <FullPageLink href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </FullPageLink>
          </p>
          <FullPageLink href="/guest" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            Continue as guest →
          </FullPageLink>
        </div>
      </div>
    </div>
  );
}
