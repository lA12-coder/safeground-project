'use client';

import { useActionState, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAlias } from '@/lib/utils/aliasGenerator';
import {
  RotateCw, Mail, Lock, Eye, EyeOff, UserPlus, Sparkles, Shield,
  ArrowLeft, Loader2, Check, Copy, User,   AlertCircle, ShieldCheck, Key, Building2,
} from 'lucide-react';
import { FullPageLink } from '@/components/ui/FullPageLink';
import { signUpWithEmail, type AuthActionResult } from '@/lib/auth/actions';
import { GoogleSignInButton } from './GoogleSignInButton';

const initialState: AuthActionResult = {};

function PasswordStrength({ value }: { value: string }) {
  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['8+ chars', 'Uppercase', 'Number', 'Special'];
  const barColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-500', 'bg-green-500'];
  const labelColors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'];

  if (!value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
    >
      <div className="flex gap-1 mb-1.5">
        {checks.map((pass, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className={`h-1.5 rounded-full transition-all duration-300 ${pass ? barColors[i] : 'bg-[#EDE4DA]'}`}
          />
        ))}
      </div>
      <div className="flex gap-3">
        {labels.map((label, i) => (
          <span key={i} className={`text-[10px] font-medium ${checks[i] ? labelColors[i] : 'text-[#B09880]'}`}>
            {checks[i] ? '✓' : '○'} {label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

const inputClass = "w-full h-[46px] rounded-[10px] border border-[#DDD0C2] bg-white px-4 transition-all duration-200 text-[14px] text-[#2c241f] outline-none placeholder:text-[#B09880]/50 focus:border-[#8B3A0F] focus:shadow-[0_0_0_3px_rgba(139,58,15,0.10)]";

export function RegisterForm() {
  const [alias, setAlias] = useState('');
  const [copied, setCopied] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-[420px] mx-auto"
    >
      {/* Privacy banner */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 bg-gradient-to-r from-[#F0F9EE] to-[#E8F5E5] border border-[#C8E6C0] rounded-[12px] p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#DCEED8] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#2D5010]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#2D5010] leading-snug">
              Your information is never shared, sold, or shown publicly. You can delete your account at any time.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-[12px] p-4 text-xs text-red-700"
            role="alert"
          >
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <span className="text-[13px] leading-snug">{state.error}</span>
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
          <Sparkles className="w-[26px] h-[26px] text-[#8B3A0F]" />
        </motion.div>
        <h1 className="text-[26px] font-playfair font-bold text-[#2c241f] mb-2 leading-tight">
          Your healing starts <span className="text-[#8B3A0F] italic">privately.</span>
        </h1>
        <p className="text-[14px] text-[#7A5740] leading-relaxed max-w-[320px] mx-auto">
          Create a secure account with an anonymous alias — your real identity stays protected.
        </p>
      </motion.div>

      {/* Google */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
      >
        <GoogleSignInButton label="Sign up with Google" />
      </motion.div>

      {/* OR divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center my-6"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2D5C8] to-transparent" />
        <span className="text-[#B09880] uppercase text-[11px] font-semibold tracking-[1.5px] mx-4">or</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2D5C8] to-transparent" />
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value="/onboarding" />

          {/* Anonymous Alias */}
          <div>
            <label htmlFor="alias" className="mb-1.5 block text-[11px] uppercase tracking-[0.8px] font-semibold text-[#8B3A0F]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Anonymous Alias
              </span>
            </label>
            <div className="relative group">
              <input
                id="alias"
                name="alias"
                type="text"
                readOnly
                value={alias}
                className="w-full h-[46px] rounded-[10px] border border-[#DDD0C2] bg-[#FDF8F4] px-4 pl-11 pr-28 text-[14px] text-[#2c241f] outline-none font-medium"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B09880] group-hover:text-[#8B3A0F] transition-colors">
                <Key className="w-4 h-4" />
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyAlias}
                  className="px-2 py-1.5 rounded-md text-xs font-medium text-[#6f5b4e] hover:text-[#92400E] hover:bg-white/80 transition-all flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <span className="w-px h-4 bg-[#DDD0C2]" />
                <button
                  type="button"
                  onClick={() => setAlias(generateAlias())}
                  className="px-2 py-1.5 rounded-md text-xs font-semibold text-[#92400E] hover:bg-white/80 transition-all flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  New
                </button>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="first_name" className="mb-1.5 block text-[11px] uppercase tracking-[0.8px] font-semibold text-[#5C3D1E]">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B09880] pointer-events-none" />
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass + ' pl-10'}
                  placeholder="Abebe"
                />
              </div>
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1.5 block text-[11px] uppercase tracking-[0.8px] font-semibold text-[#5C3D1E]">
                Last name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B09880] pointer-events-none" />
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass + ' pl-10'}
                  placeholder="Kebede"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[11px] uppercase tracking-[0.8px] font-semibold text-[#5C3D1E]">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B09880] pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass + ' pl-10'}
                placeholder="you@university.edu.et"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[11px] uppercase tracking-[0.8px] font-semibold text-[#5C3D1E]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B09880] pointer-events-none" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass + ' pl-10 pr-11'}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B09880] hover:text-[#6f5b4e] transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength value={password} />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded mt-0.5 accent-[#8B3A0F] cursor-pointer"
            />
            <label htmlFor="terms" className="text-[12.5px] text-[#7A5740] leading-relaxed cursor-pointer select-none">
              I agree to the{' '}
              <FullPageLink href="#" className="text-[#8B3A0F] font-medium hover:underline">Terms of Service</FullPageLink>
              {' '}and{' '}
              <FullPageLink href="#" className="text-[#8B3A0F] font-medium hover:underline">Privacy Policy</FullPageLink>
            </label>
          </div>

          {/* Submit */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="pt-1"
          >
            <button
              type="submit"
              disabled={pending || !agreeTerms}
              className="w-full h-[50px] rounded-[12px] bg-gradient-to-r from-[#8B3A0F] to-[#6F2D0A] text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:from-[#7A2F08] hover:to-[#5E2506] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:shadow-none"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Begin Your Recovery
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Anonymous option */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-3"
        >
          <FullPageLink
            href="/guest"
            className="w-full h-[48px] rounded-[12px] bg-[#F5F0EB] border border-[#DDD0C2] text-[14px] font-medium text-[#2D1200] flex items-center justify-center gap-2 hover:bg-[#EDE6DD] transition-all duration-200"
          >
            <span>Start Anonymously</span>
            <span className="text-[#8B3A0F] font-semibold">— No Account Needed</span>
          </FullPageLink>
        </motion.div>

        {/* Trust indicators row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-5"
        >
          {[
            { icon: Lock, label: 'Encrypted' },
            { icon: Shield, label: 'Anonymous' },
            { icon: ShieldCheck, label: 'Zero-Log' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] font-medium text-[#B09880] uppercase tracking-wide">
              <Icon className="w-3 h-3" />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-center mt-6 pb-2"
      >
        <p className="text-[14px] text-[#6f5b4e]">
          Already have an account?{' '}
          <FullPageLink
            href="/login"
            className="text-[#8B3A0F] font-bold hover:underline inline-flex items-center gap-1 group"
          >
            Sign in
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-0.5 transition-transform" />
          </FullPageLink>
        </p>
        <FullPageLink
          href="/org/register"
          className="inline-flex items-center justify-center gap-1.5 text-[12.5px] text-[#B09880] hover:text-[#8B3A0F] transition-colors mt-2"
        >
          <Building2 className="w-3.5 h-3.5" /> Register your organization
        </FullPageLink>
      </motion.div>
    </motion.div>
  );
}
