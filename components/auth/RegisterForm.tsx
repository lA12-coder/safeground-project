'use client';

import { useActionState, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAlias } from '@/lib/utils/aliasGenerator';
import { RotateCw, Mail, Lock, Eye, EyeOff, UserPlus, Sparkles, ShieldCheck, ArrowLeft, Loader2, Check, Copy } from 'lucide-react';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { signUpWithEmail, type AuthActionResult } from '@/lib/auth/actions';
import { GoogleSignInButton } from './GoogleSignInButton';

const initialState: AuthActionResult = {};

function PasswordInput({ id, name, placeholder, autoComplete, minLength }: {
  id: string; name: string; placeholder: string; autoComplete: string; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');
  const strength = value.length === 0 ? 0 : value.length < 6 ? 1 : value.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-secondary'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
      {value.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-outline-variant/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(strength / 3) * 100}%` }}
              className={`h-full rounded-full ${strengthColors[strength]} transition-colors`}
            />
          </div>
          <span className="text-xs text-on-surface-variant/70">{strengthLabels[strength]}</span>
        </div>
      )}
    </div>
  );
}

export function RegisterForm() {
  const [alias, setAlias] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAlias(generateAlias());
  }, []);

  const [state, formAction, pending] = useActionState(signUpWithEmail, initialState);

  const handleCopyAlias = async () => {
    if (alias) {
      await navigator.clipboard.writeText(alias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
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
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-serif font-bold text-on-surface">
                Your healing starts <span className="text-primary italic">privately.</span>
              </h1>
              <p className="text-sm text-on-surface-variant">
                Create a secure account with an anonymous alias — your real identity stays protected.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {state.error && (
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
                  <span>{state.error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <GoogleSignInButton label="Sign up with Google" />

            <div className="flex items-center gap-4">
              <div className="grow h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
              <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">or email</span>
              <div className="grow h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
            </div>

            <form action={formAction} className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="alias" className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Anonymous Alias
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyAlias}
                      className="text-xs text-on-surface-variant/70 hover:text-primary font-medium flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <span className="text-on-surface-variant/30">|</span>
                    <button
                      type="button"
                      onClick={() => setAlias(generateAlias())}
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                      <RotateCw className="w-3 h-3" />
                      Regenerate
                    </button>
                  </div>
                </div>
                <input type="hidden" name="alias" value={alias} />
                <motion.div
                  key={alias}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border-2 border-primary/20 text-center min-h-[3.5rem] flex items-center justify-center group cursor-default"
                >
                  <span className="font-serif text-xl font-bold text-primary tracking-wide">
                    {alias || 'Generating alias…'}
                  </span>
                </motion.div>
              </div>

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
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-200"
                    placeholder="you@university.edu.et"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
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
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Begin Your Recovery</>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
            </form>

            <div className="text-center space-y-3 pt-1">
              <p className="text-sm text-on-surface-variant">
                Already have an account?{' '}
                <FullPageLink href="/login" className="text-primary font-semibold hover:text-primary-container transition-colors">
                  Sign in
                </FullPageLink>
              </p>
              <FullPageLink href="/" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to home
              </FullPageLink>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
