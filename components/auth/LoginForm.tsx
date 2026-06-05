'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithEmail, type AuthActionResult } from '@/lib/auth/actions';
import { sanitizeRedirectTo } from '@/lib/auth/paths';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmEmailPanel } from './ConfirmEmailPanel';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { Shield, LogIn, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Building2 } from 'lucide-react';

const initialState: AuthActionResult = {};

function needsEmailConfirmation(error: string | undefined): boolean {
  if (!error) return false;
  const msg = error.toLowerCase();
  return msg.includes('confirm') || msg.includes('verified') || msg.includes('not confirmed');
}

type LoginFormProps = {
  defaultRedirectTo?: string;
  mode?: 'user' | 'admin';
};

export function LoginForm({ defaultRedirectTo = '/onboarding', mode = 'user' }: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectTo(searchParams.get('redirectTo')) ?? defaultRedirectTo;
  const urlError = searchParams.get('error');
  const awaitingConfirmation = searchParams.get('confirmEmail') === '1';
  const emailFromUrl = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailFromUrl);
  const [state, formAction, pending] = useActionState(signInWithEmail, initialState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const showResend = Boolean(email && (awaitingConfirmation || needsEmailConfirmation(state.error)));
  const showGenericError =
    (state.error && !needsEmailConfirmation(state.error)) ||
    (urlError && !needsEmailConfirmation(urlError));
  const isAdmin = mode === 'admin';

  return (
    <div className="w-full max-w-[380px]">
      {/* Confirm email panel */}
      {showResend && (
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-3 h-3 text-amber-600" />
            </div>
            <div>
              <p className="font-medium mb-0.5">Check your inbox</p>
              <p className="text-amber-700/80">We sent a confirmation link to <strong>{email}</strong>.</p>
            </div>
          </div>
          <ConfirmEmailPanel email={email} />
        </div>
      )}

      {/* Error */}
      {showGenericError && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700" role="alert">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-bold text-red-600">!</span>
          </div>
          <span>{state.error ?? urlError}</span>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-[52px] h-[52px] bg-[#FDF0E8] rounded-[14px] flex items-center justify-center">
            <Shield className="w-[24px] h-[24px] text-[#8B3A0F]" />
          </div>
        </div>
        <h1 className="text-[22px] font-playfair font-bold text-[#2c241f] mb-2">
          {isAdmin ? 'Admin Portal' : 'Sign in to SafeGround'}
        </h1>
        <p className="text-[13.5px] text-[#7A5740]">
          {isAdmin ? 'Access the SafeGround admin portal to monitor, manage, and support the community.' : 'Your private recovery journey continues here. We protect your identity while you heal.'}
        </p>
      </div>

      {/* Google button */}
      <GoogleSignInButton
        redirectPath={`/auth/callback?next=${encodeURIComponent(redirectTo)}`}
      />

      {/* OR divider */}
      <div className="flex items-center my-6">
        <hr className="flex-1 border-[#E2D5C8]" />
        <span className="text-[#9a8a7d] uppercase shrink-0 text-[12px]">or</span>
        <hr className="flex-1 border-[#E2D5C8]" />
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {/* Email field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-[11.5px] uppercase letter-spacing-[0.6px] font-medium text-[#5C3D1E]">
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[44px] rounded-[9px] border border-[1px] border-[#DDD0C2] bg-white px-4 pl-10 focus:outline-none focus:border-[#8B3A0F] focus:ring-0 focus:ring-offset-0 focus:ring-[#8B3A0F]/20"
              placeholder={isAdmin ? 'admin@safeground.app' : 'you@university.edu.et'}
              onFocus={(e) => {
                e.target.style.borderColor = '#8B3A0F';
                e.target.style.boxShadow = '0 0 0 3px rgba(139,58,15,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(139,90,43,0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-[11.5px] uppercase letter-spacing-[0.6px] font-medium text-[#5C3D1E]">
              Password
            </label>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[12px] font-medium text-[#8B3A0F] hover:underline p-0">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value=""
              onChange={(e) => {
                // We'll handle password in the form action
              }}
              className="w-full h-[44px] rounded-[9px] border border-[1px] border-[#DDD0C2] bg-white px-4 pl-10 pr-10 focus:outline-none focus:border-[#8B3A0F] focus:ring-0 focus:ring-offset-0 focus:ring-[#8B3A0F]/20"
              placeholder="Enter your password"
              onFocus={(e) => {
                e.target.style.borderColor = '#8B3A0F';
                e.target.style.boxShadow = '0 0 0 3px rgba(139,58,15,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(139,90,43,0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8a7d] hover:text-[#6f5b4e] transition-colors p-1"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            className="w-4 h-4 rounded accent-[#8B3A0F]"
          />
          <label htmlFor="remember" className="text-[13px] text-[#7A5740] select-none">
            Remember me
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={pending}
          className="w-full h-[48px] rounded-[10px] bg-[#8B3A0F] text-white font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-[#6F2D0A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              {isAdmin ? 'Enter Admin Portal' : 'Sign In'}
            </>
          )}
        </button>
      </form>

      {/* Bottom links */}
      {isAdmin ? (
        <div className="text-center mt-6">
          <FullPageLink href="/login" className="inline-flex items-center gap-1 text-[13.5px] text-[#6f5b4e] font-medium hover:text-[#92400E] transition-colors">
            Student login <ArrowRight className="w-3.5 h-3.5" />
          </FullPageLink>
        </div>
      ) : (
        <div className="text-center mt-6">
          <p className="text-[13.5px] text-[#6f5b4e] mb-4">
            New here?{' '}
            <FullPageLink href="/register" className="text-[#8B3A0F] font-bold hover:underline">
              Create an account
            </FullPageLink>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FullPageLink
              href="/guest"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f5f1] text-[12px] font-medium text-[#6f5b4e] hover:bg-[#ede6dd] hover:text-[#2c241f] transition-colors border border-[#e5e0db]"
            >
              Continue as guest
            </FullPageLink>
            <FullPageLink
              href="/admin-login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f5f1] text-[12px] font-medium text-[#6f5b4e] hover:bg-[#ede6dd] hover:text-[#2c241f] transition-colors border border-[#e5e0db]"
            >
              <Shield className="w-3 h-3" /> Admin
            </FullPageLink>
            <FullPageLink
              href="/org/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6f5f1] text-[12px] font-medium text-[#6f5b4e] hover:bg-[#ede6dd] hover:text-[#2c241f] transition-colors border border-[#e5e0db]"
            >
              <Building2 className="w-3 h-3" /> Register Org
            </FullPageLink>
          </div>
        </div>
      )}
    </div>
  );
}