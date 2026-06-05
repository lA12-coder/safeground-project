'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
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

function PasswordInput({ id, name, placeholder, autoComplete }: {
  id: string; name: string; placeholder: string; autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        required
        autoComplete={autoComplete}
        className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-200"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
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

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const showResend = Boolean(email && (awaitingConfirmation || needsEmailConfirmation(state.error)));
  const showGenericError =
    (state.error && !needsEmailConfirmation(state.error)) ||
    (urlError && !needsEmailConfirmation(urlError));
  const isAdmin = mode === 'admin';

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xl shadow-primary/5">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary" />

          <div className="p-8 md:p-10 space-y-7">
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              >
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-serif font-bold text-on-surface">
                {isAdmin ? 'Admin login' : 'Welcome back'}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {isAdmin
                  ? 'Use an email listed in ADMIN_EMAILS to access the SafeGround command center.'
                  : 'Sign in to continue your private recovery journey.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {showResend && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-medium mb-1">Check your inbox</p>
                    <p className="text-amber-700">We sent a confirmation link to <strong>{email}</strong>. Please click it to activate your account.</p>
                  </div>
                  <ConfirmEmailPanel email={email} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {showGenericError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
                  role="alert"
                >
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-red-600">!</span>
                  </div>
                  <span>{state.error ?? urlError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <GoogleSignInButton redirectPath={`/auth/callback?next=${encodeURIComponent(redirectTo)}`} />

            <div className="flex items-center gap-4">
              <div className="grow h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
              <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">or</span>
              <div className="grow h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
            </div>

            <form action={formAction} className="space-y-5">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-200"
                    placeholder={isAdmin ? 'admin@safeground.app' : 'you@university.edu.et'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Password
                  </label>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              <motion.button
                type="submit"
                disabled={pending}
                whileHover={{ scale: pending ? 1 : 1.01 }}
                whileTap={{ scale: pending ? 1 : 0.98 }}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold py-3.5 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {pending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  ) : (
                    <><LogIn className="w-4 h-4" /> {isAdmin ? 'Enter Admin Portal' : 'Sign In'}</>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
            </form>

            {isAdmin ? (
              <div className="text-center space-y-3 pt-1">
                <FullPageLink href="/login" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
                  Student login <ArrowRight className="w-3.5 h-3.5" />
                </FullPageLink>
              </div>
            ) : (
              <div className="text-center space-y-3 pt-1">
                <p className="text-sm text-on-surface-variant">
                  New here?{' '}
                  <FullPageLink href="/register" className="text-primary font-semibold hover:text-primary-container transition-colors">
                    Create an account
                  </FullPageLink>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  <FullPageLink href="/guest" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Continue as guest <ArrowRight className="w-3.5 h-3.5" />
                  </FullPageLink>
                  <FullPageLink href="/admin-login" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container transition-colors">
                    Admin portal <ShieldCheck className="w-3.5 h-3.5" />
                  </FullPageLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
