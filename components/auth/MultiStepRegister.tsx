'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAlias } from '@/lib/utils/aliasGenerator'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles, RotateCw, Mail, Lock, Eye, EyeOff, UserPlus,
  Check, ChevronRight, ChevronLeft, Loader2, Copy, ArrowLeft,
  Shield, LogIn, PartyPopper, Gift, Target, Heart,
  Languages, Brain, Users, Church,
} from 'lucide-react'
import { FullPageLink } from '@/components/ui/FullPageLink'

const LANGUAGES = [
  { code: 'amharic', label: 'Amharic', native: 'አማርኛ' },
  { code: 'english', label: 'English', native: 'English' },
  { code: 'oromifa', label: 'Afaan Oromo', native: 'Afaan Oromoo' },
  { code: 'tigrinya', label: 'Tigrinya', native: 'ትግርኛ' },
]

const TRIGGERS = ['Telegram', 'Stress', 'Loneliness', 'Khat', 'Alcohol', 'Social Media', 'Night Time']

const SUPPORT_OPTIONS = [
  { value: 'clinical', label: 'Clinical', desc: 'Professional therapy & counseling', icon: Brain },
  { value: 'faith-based', label: 'Faith-Based', desc: 'Spiritual & religious guidance', icon: Church },
  { value: 'secular', label: 'Secular', desc: 'Community & peer support', icon: Users },
  { value: 'mixed', label: 'Mixed', desc: 'All approaches combined', icon: Heart },
]

const GOAL_OPTIONS = [
  { value: 7, label: '7 Days', desc: 'One week of strength' },
  { value: 30, label: '30 Days', desc: 'One month milestone' },
  { value: 60, label: '60 Days', desc: 'Two months of progress' },
  { value: 90, label: '90 Days', desc: 'Three months strong' },
]

const STEP_LABELS = ['Welcome', 'Account', 'Language', 'Triggers', 'Support', 'Goal', 'Ready']

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
}

function PasswordInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  const strength = value.length === 0 ? 0 : value.length < 6 ? 1 : value.length < 10 ? 2 : 3
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Good', 'Strong']

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
          placeholder="At least 8 characters"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f5b4e]/60 hover:text-[#6f5b4e] transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[#e5e0db]/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(strength / 3) * 100}%` }}
              className={`h-full rounded-full ${strengthColors[strength]} transition-colors`}
            />
          </div>
          <span className="text-xs text-[#6f5b4e]/70">{strengthLabels[strength]}</span>
        </div>
      )}
    </div>
  )
}

export function MultiStepRegister() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const [alias, setAlias] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [language, setLanguage] = useState('')
  const [triggers, setTriggers] = useState<string[]>([])
  const [supportMode, setSupportMode] = useState('')
  const [goal, setGoal] = useState(0)

  useEffect(() => {
    setAlias(generateAlias())
  }, [])

  const goTo = useCallback((s: number) => {
    setDirection(s > step ? 1 : -1)
    setStep(s)
  }, [step])

  const next = useCallback(() => goTo(Math.min(step + 1, 6)), [goTo, step])
  const prev = useCallback(() => goTo(Math.max(step - 1, 0)), [goTo, step])

  const toggleTrigger = (t: string) =>
    setTriggers((prev) => prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t])

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return true
      case 1: return alias.length > 0 && email.length > 0 && password.length >= 8
      case 2: return language.length > 0
      case 3: return triggers.length > 0
      case 4: return supportMode.length > 0
      case 5: return goal > 0
      default: return true
    }
  }

  const handleCopyAlias = async () => {
    if (alias) {
      await navigator.clipboard.writeText(alias)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            alias,
            display_name: alias,
            onboarding_complete: false,
          },
        },
      })

      if (signUpError) throw new Error(signUpError.message)
      if (!data.user) throw new Error('Failed to create account')

      const profileRes = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias,
          language_pref: language,
          support_preference: supportMode,
          trigger_tags: triggers,
          streak_goal: goal,
        }),
      })

      if (!profileRes.ok) {
        const profileData = await profileRes.json()
        throw new Error(profileData.error || 'Failed to save profile')
      }

      next()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#92400E] to-[#d97706] flex items-center justify-center shadow-lg shadow-[#92400E]/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-serif font-bold text-[#2c241f]">
              Your healing starts <span className="text-[#92400E] italic">here.</span>
            </h1>
            <p className="text-sm text-[#6f5b4e] max-w-sm mx-auto">
              Create a private, anonymous account and begin your recovery journey with SafeGround.
            </p>
            <div className="space-y-3 pt-2 max-w-xs mx-auto">
              <button
                type="button"
                onClick={next}
                className="w-full flex items-center justify-center gap-3 bg-[#92400E] text-white font-semibold py-4 rounded-xl hover:bg-[#a04e14] transition-all shadow-md shadow-[#92400E]/20"
              >
                <UserPlus className="w-5 h-5" /> Start Anonymously
              </button>
              <FullPageLink
                href="/guest"
                className="w-full flex items-center justify-center gap-3 bg-[#f6f5f1] text-[#6f5b4e] font-semibold py-4 rounded-xl hover:bg-[#e5e0db] transition-all border border-[#e5e0db]"
              >
                <LogIn className="w-5 h-5" /> Continue as Guest
              </FullPageLink>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Create Your Account</h2>
              <p className="text-sm text-[#6f5b4e]">Your identity stays anonymous</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Anonymous Alias</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyAlias}
                    className="text-xs text-[#6f5b4e]/70 hover:text-[#92400E] font-medium flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <span className="text-[#6f5b4e]/30">|</span>
                  <button
                    type="button"
                    onClick={() => setAlias(generateAlias())}
                    className="text-xs text-[#92400E] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <RotateCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>
              <motion.div
                key={alias}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-[#92400E]/5 to-[#92400E]/10 rounded-xl p-4 border-2 border-[#92400E]/20 text-center min-h-[3.5rem] flex items-center justify-center"
              >
                <span className="font-serif text-xl font-bold text-[#92400E] tracking-wide">
                  {alias || 'Generating…'}
                </span>
              </motion.div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="you@university.edu.et"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Password</label>
              <PasswordInput value={password} onChange={setPassword} />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Choose Your Language</h2>
              <p className="text-sm text-[#6f5b4e]">Select your preferred language</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => {
                const selected = language === lang.code
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-[#92400E] bg-[#92400E]/5 shadow-sm'
                        : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30'
                    }`}
                  >
                    <Languages className={`w-6 h-6 ${selected ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                    <span className={`text-sm font-semibold ${selected ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                      {lang.label}
                    </span>
                    <span className={`text-xs ${selected ? 'text-[#92400E]/70' : 'text-[#9a8a7d]'}`}>
                      {lang.native}
                    </span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-[#92400E] flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Your Triggers</h2>
              <p className="text-sm text-[#6f5b4e]">What situations challenge your recovery?</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {TRIGGERS.map((trigger) => {
                const selected = triggers.includes(trigger)
                return (
                  <motion.button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    whileTap={{ scale: 0.95 }}
                    className={`px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      selected
                        ? 'border-[#92400E] bg-[#92400E]/5 text-[#92400E] shadow-sm'
                        : 'border-[#e5e0db] bg-white text-[#6f5b4e] hover:border-[#92400E]/30 hover:bg-[#f6f5f1]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {trigger}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {triggers.length > 0 && (
              <p className="text-center text-xs text-[#6f5b4e]">
                Selected {triggers.length} trigger{triggers.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Support Preference</h2>
              <p className="text-sm text-[#6f5b4e]">What type of support do you prefer?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SUPPORT_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = supportMode === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSupportMode(option.value)}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center ${
                      selected
                        ? 'border-[#92400E] bg-[#92400E]/5 shadow-sm'
                        : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${selected ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                    <span className={`text-sm font-semibold ${selected ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                      {option.label}
                    </span>
                    <span className="text-[10px] text-[#6f5b4e] leading-tight">{option.desc}</span>
                    {selected && (
                      <div className="w-4 h-4 rounded-full bg-[#92400E] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Set Your Goal</h2>
              <p className="text-sm text-[#6f5b4e]">Choose your first recovery milestone</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((option) => {
                const selected = goal === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGoal(option.value)}
                    className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-[#92400E] bg-[#92400E]/5 shadow-sm'
                        : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30'
                    }`}
                  >
                    <Target className={`w-6 h-6 ${selected ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                    <span className={`text-lg font-bold font-serif ${selected ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                      {option.label}
                    </span>
                    <span className="text-[10px] text-[#6f5b4e]">{option.desc}</span>
                    {selected && (
                      <div className="w-5 h-5 rounded-full bg-[#92400E] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <PartyPopper className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-serif font-bold text-[#2c241f]">
                Account Created!
              </h1>
              <p className="text-[#6f5b4e] mt-2">
                Welcome to SafeGround, <span className="font-bold text-[#92400E]">{alias}</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-[#f6f5f1] rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Alias</span>
                <span className="text-sm font-semibold text-[#2c241f]">{alias}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Language</span>
                <span className="text-sm font-semibold text-[#2c241f] capitalize">{language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Support</span>
                <span className="text-sm font-semibold text-[#2c241f] capitalize">{supportMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Goal</span>
                <span className="text-sm font-semibold text-[#2c241f]">{goal} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Triggers</span>
                <span className="text-sm font-semibold text-[#2c241f]">{triggers.join(', ')}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <FullPageLink
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#92400E] text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-[#a04e14] transition-all shadow-md shadow-[#92400E]/20"
              >
                <Sparkles className="w-4 h-4" /> Go to Dashboard
              </FullPageLink>
            </motion.div>
          </div>
        )
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#e5e0db] bg-white shadow-xl shadow-[#92400E]/5">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#92400E] via-[#d97706] to-[#92400E]" />

          <div className="p-8 md:p-10 space-y-7">
            {step < 6 && step > 0 && (
              <div className="flex items-center justify-between">
                {STEP_LABELS.slice(1, 6).map((label, i) => {
                  const actualStep = i + 1
                  return (
                    <div key={actualStep} className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => goTo(actualStep)}
                        disabled={actualStep > step}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          actualStep < step
                            ? 'bg-[#92400E] text-white cursor-pointer'
                            : actualStep === step
                            ? 'bg-[#92400E]/10 text-[#92400E] border-2 border-[#92400E]'
                            : 'bg-[#f6f5f1] text-[#9a8a7d] cursor-default'
                        }`}
                      >
                        {actualStep < step ? <Check className="w-4 h-4" /> : actualStep}
                      </button>
                      <span className={`text-[9px] font-medium hidden sm:block ${
                        actualStep <= step ? 'text-[#92400E]' : 'text-[#9a8a7d]'
                      }`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
              >
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-red-600">!</span>
                </div>
                <span>{error}</span>
              </motion.div>
            )}

            {step > 0 && step < 6 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={prev}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#6f5b4e] bg-[#f6f5f1] hover:bg-[#e5e0db] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {step < 6 ? (
                  step === 5 ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || !canProceed()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</>
                      ) : (
                        <><PartyPopper className="w-4 h-4" /> Complete Setup</>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!canProceed()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#92400E] hover:bg-[#a04e14] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  )
                ) : null}
              </div>
            )}

            {step === 0 && (
              <div className="text-center pt-1">
                <p className="text-sm text-[#6f5b4e]">
                  Already have an account?{' '}
                  <FullPageLink href="/login" className="text-[#92400E] font-semibold hover:text-[#a04e14] transition-colors">
                    Sign in
                  </FullPageLink>
                </p>
              </div>
            )}
          </div>
        </div>

        {step < 6 && (
          <div className="text-center mt-6">
            <FullPageLink href="/" className="inline-flex items-center gap-1 text-sm text-[#6f5b4e] hover:text-[#92400E] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </FullPageLink>
          </div>
        )}
      </motion.div>
    </div>
  )
}
