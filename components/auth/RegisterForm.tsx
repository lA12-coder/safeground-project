'use client';

import { useActionState, useEffect, useState } from 'react';
import { generateAlias } from '@/lib/utils/aliasGenerator';
import { RotateCw } from 'lucide-react';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { signUpWithEmail, type AuthActionResult } from '@/lib/auth/actions';
import { GoogleSignInButton } from './GoogleSignInButton';

const initialState: AuthActionResult = {};

export function RegisterForm() {
  const [alias, setAlias] = useState('');

  useEffect(() => {
    setAlias(generateAlias());
  }, []);
  const [state, formAction, pending] = useActionState(signUpWithEmail, initialState);

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="heading-hero">
          Your healing starts <span className="text-primary italic">privately.</span>
        </h1>
        <p className="body-lg">Create a secure account with an anonymous alias — your real identity stays protected.</p>
      </div>

      <div className="card p-8 md:p-10 space-y-8 parchment-glow">
        {state.error && (
          <p className="text-sm text-error bg-error-container/30 rounded-lg px-4 py-3" role="alert">
            {state.error}
          </p>
        )}

        <GoogleSignInButton />

        <div className="flex items-center gap-4">
          <div className="flex-grow h-px bg-outline-variant" />
          <span className="text-xs text-on-surface-variant font-semibold uppercase">or email</span>
          <div className="flex-grow h-px bg-outline-variant" />
        </div>

        <form action={formAction} className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <label htmlFor="alias" className="label-caps">
                Anonymous Alias
              </label>
              <button
                type="button"
                onClick={() => setAlias(generateAlias())}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                <RotateCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>
            <input type="hidden" name="alias" value={alias} />
            <div className="bg-surface-container-low rounded-lg p-4 border-2 border-outline-variant text-center min-h-[3.25rem] flex items-center justify-center">
              <span className="font-serif text-xl font-bold text-primary tracking-wide">
                {alias || 'Generating alias…'}
              </span>
            </div>
          </div>

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
              minLength={8}
              autoComplete="new-password"
              className="input-field"
              placeholder="At least 8 characters"
            />
          </div>

          <button type="submit" disabled={pending} className="w-full btn-primary disabled:opacity-60">
            {pending ? 'Creating account…' : 'Begin Your Recovery'}
          </button>
        </form>

        <p className="text-center body-md">
          Already have an account?{' '}
          <FullPageLink href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </FullPageLink>
        </p>
      </div>

      <div className="flex justify-center">
        <FullPageLink href="/" className="text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors">
          ← Back to home
        </FullPageLink>
      </div>
    </div>
  );
}
