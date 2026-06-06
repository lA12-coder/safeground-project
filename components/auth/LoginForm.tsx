'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmail, type AuthActionResult } from '@/lib/auth/actions';
import { sanitizeRedirectTo } from '@/lib/auth/paths';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmEmailPanel } from './ConfirmEmailPanel';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { Shield, LogIn, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Building2, Mail, Lock, Sparkles, FlaskConical } from 'lucide-react';

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

const demoAccounts = [
  { label: 'Student Demo', email: 'demo.student@safeground.test', password: 'SafeGroundStudent123!', role: 'student' },
  { label: 'Admin Panel', email: 'admin@gmail.com', password: 'SafeGroundAdmin123!', role: 'admin' },
  { label: 'Provider Demo', email: 'provider@safeground.test', password: 'SafeGroundProvider123!', role: 'provider' },
];

const inputClass = "w-full h-[46px] rounded-[10px] border border-[#DDD0C2] bg-white px-4 transition-all duration-200 text-[14px] text-[#2c241f] outline-none placeholder:text-[#B09880]/50 focus:border-[#8B3A0F] focus:shadow-[0_0_0_3px_rgba(139,58,15,0.10)]";

export function LoginForm({ defaultRedirectTo = '/onboarding', mode = 'user' }: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectTo(searchParams.get('redirectTo')) ?? defaultRedirectTo;
  const urlError = searchParams.get('error');
  const awaitingConfirmation = searchParams.get('confirmEmail') === '1';
  const emailFromUrl = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailFromUrl);
  const [state, formAction, pending] = useActionState(signInWithEmail, initialState);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const showResend = Boolean(email && (awaitingConfirmation || needsEmailConfirmation(state.error)));
  const showGenericError =
    (state.error && !needsEmailConfirmation(state.error)) ||
    (urlError && !needsEmailConfirmation(urlError));
  const isAdmin = mode === 'admin';

  const fillDemo = (acct: typeof demoAccounts[0]) => {
    setEmail(acct.email);
    setPassword(acct.password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-[420px] mx-auto"
    >
      {/* Confirm email panel */}
      <AnimatePresence>
        {showResend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[12px] p-4">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-amber-800 mb-0.5">Check your inbox</p>
                <p className="text-[12px] text-amber-700/80">We sent a confirmation link to <strong className="font-semibold">{email}</strong>.</p>
                <ConfirmEmailPanel email={email} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {showGenericError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-[12px] p-4 text-xs text-red-700" role="alert">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[12px] font-bold text-red-600">!</span>
              </div>
              <div>
                <p className="text-[13px] font-medium text-red-800 mb-0.5">Unable to sign in</p>
                <span className="text-[12px] text-red-600">{state.error ?? urlError}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="text-center mb-7"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-[56px] h-[56px] bg-gradient-to-br from-[#FDF0E8] to-[#F5E0D0] rounded-[16px] flex items-center justify-center mx-auto mb-5 shadow-sm"
        >
          <Shield className="w-[26px] h-[26px] text-[#8B3A0F]" />
        </motion.div>
        <h1 className="text-[26px] font-playfair font-bold text-[#2c241f] mb-2 leading-tight">
          {isAdmin ? 'Admin Portal' : 'Welcome back.'}
        </h1>
        <p className="text-[14px] text-[#7A5740] leading-relaxed max-w-[320px] mx-auto">
          {isAdmin
            ? 'Access the SafeGround admin portal to monitor, manage, and support the community.'
            : 'Your private recovery journey continues here. Sign in to pick up where you left off.'}
        </p>
      </motion.div>

      {/* Demo accounts helper */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-6"
        >
          <button
            type="button"
            onClick={() => setShowDemoHint(!showDemoHint)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] bg-[#F5F0EB] border border-[#E2D5C8] text-[12px] text-[#6f5b4e] hover:bg-[#EDE6DD] transition-all group"
          >
            <span className="flex items-center gap-2 font-medium">
              <FlaskConical className="w-3.5 h-3.5 text-[#8B3A0F]" />
              Quick Demo Access
            </span>
            <motion.span
              animate={{ rotate: showDemoHint ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-[#B09880]"
            >
              ▼
            </motion.span>
          </button>
          <AnimatePresence>
            {showDemoHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-1.5">
                  {demoAccounts.map((acct) => (
                    <button
                      key={acct.label}
                      type="button"
                      onClick={() => fillDemo(acct)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] bg-white border border-[#E2D5C8] hover:border-[#8B3A0F]/30 hover:bg-[#FDF8F4] transition-all text-left group"
                    >
                      <div className="w-7 h-7 rounded-md bg-[#FDF0E8] flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#8B3A0F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#2c241f]">{acct.label}</p>
                        <p className="text-[10px] text-[#B09880] truncate">{acct.email}</p>
                      </div>
                      <span className="text-[10px] font-medium text-[#8B3A0F] opacity-0 group-hover:opacity-100 transition-opacity">Fill</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Google button */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
        >
          <GoogleSignInButton
            redirectPath={`/auth/callback?next=${encodeURIComponent(redirectTo)}`}
          />
          {/* OR divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="flex items-center my-6"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2D5C8] to-transparent" />
            <span className="text-[#B09880] uppercase text-[11px] font-semibold tracking-[1.5px] mx-4">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2D5C8] to-transparent" />
          </motion.div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[11px] uppercase tracking-[0.8px] font-semibold text-[#5C3D1E]">
              Email address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B09880] group-focus-within:text-[#8B3A0F] transition-colors pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass + ' pl-10'}
                placeholder={isAdmin ? 'admin@safeground.app' : 'you@university.edu.et'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-[11px] uppercase tracking-[0.8px] font-semibold text-[#5C3D1E]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-medium text-[#8B3A0F] hover:underline p-0"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B09880] group-focus-within:text-[#8B3A0F] transition-colors pointer-events-none" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass + ' pl-10 pr-11'}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B09880] hover:text-[#6f5b4e] transition-colors p-1"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember + Submit row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="w-4 h-4 rounded accent-[#8B3A0F] cursor-pointer"
              />
              <span className="text-[13px] text-[#7A5740]">Remember me</span>
            </label>
          </div>

          {/* Submit */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              type="submit"
              disabled={pending}
              className="w-full h-[50px] rounded-[12px] bg-gradient-to-r from-[#8B3A0F] to-[#6F2D0A] text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:from-[#7A2F08] hover:to-[#5E2506] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:shadow-none"
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
          </motion.div>
        </form>
      </motion.div>

      {/* Bottom links */}
      <AnimatePresence mode="wait">
        {isAdmin ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6"
          >
            <FullPageLink href="/login" className="inline-flex items-center gap-1 text-[13.5px] text-[#6f5b4e] font-medium hover:text-[#92400E] transition-colors">
              Student login <ArrowRight className="w-3.5 h-3.5" />
            </FullPageLink>
          </motion.div>
        ) : (
          <motion.div
            key="user"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-center mt-6"
          >
            <p className="text-[14px] text-[#6f5b4e] mb-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
