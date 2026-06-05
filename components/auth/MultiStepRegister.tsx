'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAlias } from '@/lib/utils/aliasGenerator'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles, RotateCw, Mail, Lock, Eye, EyeOff, UserPlus,
  Check, ChevronRight, ChevronLeft, Loader2, Copy, ArrowLeft,
  Shield, LogIn, PartyPopper, Gift, Target, Heart,
  Languages, Brain, Users, Church, UserCheck, Quote, Star,
} from 'lucide-react'
import { FullPageLink } from '@/components/ui/FullPageLink'

const LANGUAGES = [
  { code: 'amharic', label: 'Amharic', native: 'አማርኛ' },
  { code: 'english', label: 'English', native: 'English' },
  { code: 'oromifa', label: 'Afaan Oromo', native: 'Afaan Oromoo' },
  { code: 'tigrinya', label: 'Tigrinya', native: 'ትግርኛ' },
]

const TRIGGERS = ['Telegram', 'Stress', 'Loneliness', 'Khat', 'Alcohol', 'Social Media', 'Night Time', 'Boredom', 'Fatigue']

const SUPPORT_OPTIONS = [
  { value: 'clinical', label: 'Clinical', desc: 'Professional therapy & counseling', icon: Brain },
  { value: 'faith-based', label: 'Faith-Based', desc: 'Spiritual & religious guidance', icon: Church },
  { value: 'secular', label: 'Secular', desc: 'Community & peer support', icon: Users },
  { value: 'mixed', label: 'Mixed', desc: 'All approaches combined', icon: Heart },
]

const GOAL_OPTIONS = [
  { value: 7, label: '7 Days', desc: 'One week of strength' },
  { value: 14, label: '14 Days', desc: 'Two weeks of progress' },
  { value: 30, label: '30 Days', desc: 'One month milestone' },
  { value: 60, label: '60 Days', desc: 'Two months of growth' },
  { value: 90, label: '90 Days', desc: 'Three months strong' },
]

const STEP_LABELS = ['Welcome', 'Account', 'Language', 'Triggers', 'Support', 'Guardian', 'Goal', 'Ready']

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
      <div className="relative group">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a7d] pointer-events-none group-focus-within:text-[#92400E] transition-colors" />
        <input
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60 transition-all text-sm"
          placeholder="At least 8 characters"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a8a7d] hover:text-[#6f5b4e] transition-colors"
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
  const [guardianOptIn, setGuardianOptIn] = useState<boolean | null>(null)
  const [goal, setGoal] = useState(0)

  useEffect(() => {
    setAlias(generateAlias())
  }, [])

  const goTo = useCallback((s: number) => {
    setDirection(s > step ? 1 : -1)
    setStep(s)
  }, [step])

  const next = useCallback(() => goTo(Math.min(step + 1, 7)), [goTo, step])
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
      case 5: return true
      case 6: return goal > 0
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
            <p className="text-sm text-[#6f5b4e] max-w-sm mx-auto leading-relaxed">
              Create a private, anonymous account and begin your recovery journey with SafeGround.
            </p>
            <div className="space-y-3 pt-2 max-w-xs mx-auto">
              <button
                type="button"
                onClick={next}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#92400E] to-[#a04e14] text-white font-semibold py-4 rounded-xl hover:shadow-lg hover:shadow-[#92400E]/25 transition-all shadow-md shadow-[#92400E]/20"
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
              <p className="text-sm text-[#6f5b4e]">Your identity stays anonymous — no personal data collected</p>
            </div>

            <div className="bg-[#fdf6ed] rounded-xl p-4 border border-[#92400E]/15">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#6f5b4e]">Your Alias</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyAlias}
                    className="text-xs text-[#6f5b4e] hover:text-[#92400E] font-medium flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <span className="text-[#92400E]/30">|</span>
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
                className="bg-white rounded-lg border border-[#92400E]/20 p-3 text-center"
              >
                <span className="font-serif text-lg font-bold text-[#92400E] tracking-wide">
                  {alias || 'Generating…'}
                </span>
              </motion.div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#6f5b4e]">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a7d] pointer-events-none group-focus-within:text-[#92400E] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60 transition-all text-sm"
                  placeholder="you@university.edu.et"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#6f5b4e]">Password</label>
              <PasswordInput value={password} onChange={setPassword} />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Choose Your Language</h2>
              <p className="text-sm text-[#6f5b4e]">Select the language you're most comfortable with</p>
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
                        ? 'border-[#92400E] bg-[#fdf6ed] shadow-sm'
                        : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30 hover:bg-[#faf9f7]'
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

            <div className="flex flex-wrap justify-center gap-2.5">
              {TRIGGERS.map((trigger) => {
                const selected = triggers.includes(trigger)
                return (
                  <motion.button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      selected
                        ? 'border-[#92400E] bg-[#fdf6ed] text-[#92400E] shadow-sm'
                        : 'border-[#e5e0db] bg-white text-[#6f5b4e] hover:border-[#92400E]/30 hover:bg-[#faf9f7]'
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
                {triggers.length} trigger{triggers.length !== 1 ? 's' : ''} selected
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
                        ? 'border-[#92400E] bg-[#fdf6ed] shadow-sm'
                        : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30 hover:bg-[#faf9f7]'
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
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Guardian Support</h2>
              <p className="text-sm text-[#6f5b4e]">Would you like a trusted person to support you?</p>
            </div>

            <div className="bg-[#fdf6ed] rounded-xl p-5 border border-[#92400E]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#92400E]">
                <UserCheck className="w-5 h-5" />
                <span className="text-sm font-semibold">What is a Guardian?</span>
              </div>
              <p className="text-xs text-[#6f5b4e] leading-relaxed">
                A guardian is a trusted person — a friend, family member, or mentor — who can see your recovery
                progress and offer encouragement. They never see your personal details or identity, only your alias
                and anonymized progress data.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGuardianOptIn(true)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  guardianOptIn === true
                    ? 'border-[#92400E] bg-[#fdf6ed] shadow-sm'
                    : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30 hover:bg-[#faf9f7]'
                }`}
              >
                <UserCheck className={`w-8 h-8 ${guardianOptIn === true ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                <span className={`text-sm font-semibold ${guardianOptIn === true ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                  Yes, Add Guardian
                </span>
                <span className="text-[10px] text-[#6f5b4e] text-center">Invite a trusted supporter</span>
                {guardianOptIn === true && (
                  <div className="w-5 h-5 rounded-full bg-[#92400E] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setGuardianOptIn(false)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  guardianOptIn === false
                    ? 'border-[#16a34a] bg-green-50/50 shadow-sm'
                    : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30 hover:bg-[#faf9f7]'
                }`}
              >
                <Shield className={`w-8 h-8 ${guardianOptIn === false ? 'text-[#16a34a]' : 'text-[#9a8a7d]'}`} />
                <span className={`text-sm font-semibold ${guardianOptIn === false ? 'text-[#16a34a]' : 'text-[#2c241f]'}`}>
                  Skip
                </span>
                <span className="text-[10px] text-[#6f5b4e] text-center">You can add one later</span>
                {guardianOptIn === false && (
                  <div className="w-5 h-5 rounded-full bg-[#16a34a] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            </div>

            {guardianOptIn === true && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[#f6f5f1] rounded-xl p-4 text-xs text-[#6f5b4e] border border-[#e5e0db]"
              >
                <p>You can set up the guardian link and customize access levels after onboarding in your Settings.</p>
              </motion.div>
            )}
          </div>
        )

      case 6:
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
                        ? 'border-[#92400E] bg-[#fdf6ed] shadow-sm'
                        : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30 hover:bg-[#faf9f7]'
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

            <p className="text-center text-[10px] text-[#9a8a7d]">
              You can always adjust your goal in settings
            </p>
          </div>
        )

      case 7:
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
              className="bg-[#f6f5f1] rounded-xl p-5 space-y-3 border border-[#e5e0db]"
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
                <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Guardian</span>
                <span className="text-sm font-semibold text-[#2c241f]">
                  {guardianOptIn === true ? 'Yes' : 'Skipped'}
                </span>
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#92400E] to-[#a04e14] text-white font-semibold py-3.5 px-8 rounded-xl hover:shadow-lg hover:shadow-[#92400E]/25 transition-all shadow-md shadow-[#92400E]/20"
              >
                <Sparkles className="w-4 h-4" /> Go to Dashboard
              </FullPageLink>
            </motion.div>
          </div>
        )
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto grid md:grid-cols-5 min-h-screen">
      {/* Left Panel — Brand Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:flex md:col-span-2 bg-gradient-to-br from-[#92400E] via-[#a04e14] to-[#92400E] flex-col relative overflow-hidden"
        style={{ padding: '40px 32px', minHeight: '100vh' }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col min-h-0 flex-1">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm mb-6">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-3 leading-tight">
              Start Your Journey
            </h2>
            <p className="text-white/80 text-sm lg:text-base leading-relaxed max-w-xs" style={{ maxWidth: '200px' }}>
              Create a private, anonymous account in under 2 minutes. No personal data required.
            </p>
          </div>

          <div className="space-y-3 mb-auto">
            {[
              { text: '100% anonymous identity' },
              { text: 'No real name or phone needed' },
              { text: 'Personalized AI recovery tools' },
              { text: '24/7 community & crisis support' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={
                    i === 0
                      ? 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
                      : i === 1
                      ? 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
                      : i === 2
                      ? 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z'
                      : 'M12 12v3.75m-2.25-9.75L12 3l2.25 2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  } />
                </svg>
                <span style={{ fontSize: '13px' }} className="text-white/80">{item.text}</span>
              </div>
            ))}
          </div>

          <div
            className="mt-6"
            style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '16px',
              borderRadius: '12px',
            }}
          >
            <Quote className="w-5 h-5 text-white/40 mb-2" />
            <p className="text-sm text-white/90 italic leading-relaxed">
              &ldquo;SafeGround gave me a space where I didn't have to explain myself. That privacy changed everything.&rdquo;
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/60">Student, Addis Ababa University</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel — Register Form */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        className="md:col-span-3 flex items-center justify-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="w-full" style={{ maxWidth: '480px', padding: '40px' }}>
          {step < 7 && step > 0 && (
            <div className="flex items-center justify-between mb-6">
              {STEP_LABELS.slice(1, 7).map((label, i) => {
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
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mt-4"
            >
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-red-600">!</span>
              </div>
              <span>{error}</span>
            </motion.div>
          )}

          {step > 0 && step < 7 && (
            <div className="flex items-center justify-between pt-4 mt-4">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#6f5b4e] bg-[#f6f5f1] hover:bg-[#e5e0db] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {step < 7 ? (
                step === 6 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !canProceed()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
            <div className="text-center pt-4">
              <p className="text-sm text-[#6f5b4e]">
                Already have an account?{' '}
                <FullPageLink href="/login" className="text-[#92400E] font-semibold hover:text-[#a04e14] transition-colors">
                  Sign in
                </FullPageLink>
              </p>
            </div>
          )}

          {step < 7 && (
            <div className="text-center mt-4">
              <FullPageLink href="/" className="inline-flex items-center gap-1 text-sm text-[#6f5b4e] hover:text-[#92400E] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to home
              </FullPageLink>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
