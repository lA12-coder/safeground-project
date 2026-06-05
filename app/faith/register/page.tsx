'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, User, Phone, Mail, MapPin, Globe, BookOpen,
  FileText, Check, ChevronRight, ChevronLeft, Loader2,
  ArrowLeft, Sparkles, CheckCircle, XCircle, Upload, Shield,
  Church, Heart, Users, Quote,
} from 'lucide-react'
import { FullPageLink } from '@/components/ui/FullPageLink'

const FAITH_TRADITIONS = [
  { value: 'orthodox', label: 'Orthodox' },
  { value: 'protestant', label: 'Protestant' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'traditional', label: 'Traditional' },
]

const RECOVERY_ACTIVITIES = [
  'Prayer Groups', 'Counseling', 'Meditation',
  'Community Service', 'Study Groups',
]

const STEP_ICONS = [Building2, User, BookOpen, MapPin, Upload, CheckCircle]
const STEP_LABELS = ['Organization', 'Representative', 'Program', 'Location', 'Documents', 'Review']

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
}

type FaithFormData = {
  orgName: string
  faithTradition: string
  repName: string
  repPhone: string
  repEmail: string
  programName: string
  description: string
  recoveryActivities: string[]
  weeklyStructure: string
  city: string
  region: string
  orgLetter: string | null
  authDoc: string | null
  identityDoc: string | null
}

export default function FaithRegisterPage() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FaithFormData>({
    orgName: '',
    faithTradition: '',
    repName: '',
    repPhone: '',
    repEmail: '',
    programName: '',
    description: '',
    recoveryActivities: [],
    weeklyStructure: '',
    city: '',
    region: '',
    orgLetter: null,
    authDoc: null,
    identityDoc: null,
  })

  const update = (field: keyof FaithFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleArray = (field: 'recoveryActivities', value: string) =>
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))

  const goTo = (s: number) => {
    setDirection(s > step ? 1 : -1)
    setStep(s)
  }

  const next = () => goTo(Math.min(step + 1, 5))
  const prev = () => goTo(Math.max(step - 1, 0))

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return form.orgName.length > 0 && form.faithTradition.length > 0
      case 1: return form.repName.length > 0 && form.repPhone.length > 0 && form.repEmail.length > 0
      case 2: return form.programName.length > 0 && form.description.length > 0
      case 3: return form.city.length > 0 && form.region.length > 0
      case 4: return true
      default: return true
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/faith/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg mx-auto text-center space-y-6"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2c241f]">
            Application Submitted
          </h1>
          <p className="text-[#6f5b4e]">
            Thank you for registering your faith organization. Our team will review your
            application and verify your documents. You will be notified once approved.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
            <Shield className="w-4 h-4" />
            <span>Pending Review — typically reviewed within 72 hours</span>
          </div>
          <FullPageLink
            href="/directory"
            className="inline-flex items-center gap-2 bg-[#92400E] text-white rounded-md text-sm font-semibold px-6 py-3 hover:bg-[#a04e14] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </FullPageLink>
        </motion.div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Organization Information</h2>
              <p className="text-sm text-[#6f5b4e]">Tell us about your faith organization</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.orgName}
                  onChange={(e) => update('orgName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="St. Michael's Recovery Ministry"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Faith Tradition</label>
              <div className="grid grid-cols-2 gap-3">
                {FAITH_TRADITIONS.map((tradition) => {
                  const Icon = tradition.value === 'orthodox' ? Church
                    : tradition.value === 'protestant' ? Church
                    : tradition.value === 'muslim' ? Quote
                    : Heart
                  const selected = form.faithTradition === tradition.value
                  return (
                    <button
                      key={tradition.value}
                      type="button"
                      onClick={() => update('faithTradition', tradition.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-[#92400E] bg-[#92400E]/5'
                          : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                      <div className="text-left">
                        <p className={`text-sm font-medium ${selected ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                          {tradition.label}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Representative Information</h2>
              <p className="text-sm text-[#6f5b4e]">Who we will contact regarding your application</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Representative Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.repName}
                  onChange={(e) => update('repName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="Father Tadesse Haile"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.repPhone}
                  onChange={(e) => update('repPhone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="+251 91X XXX XXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  type="email"
                  value={form.repEmail}
                  onChange={(e) => update('repEmail', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="father.tadesse@example.com"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Program Information</h2>
              <p className="text-sm text-[#6f5b4e]">Describe your recovery program</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Program Name</label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.programName}
                  onChange={(e) => update('programName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="Restoration Fellowship Program"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60 resize-none"
                placeholder="Describe your program's mission, approach, and how it supports recovery..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Recovery Activities</label>
              <div className="grid grid-cols-2 gap-3">
                {RECOVERY_ACTIVITIES.map((activity) => {
                  const selected = form.recoveryActivities.includes(activity)
                  return (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => toggleArray('recoveryActivities', activity)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        selected
                          ? 'border-[#92400E] bg-[#92400E]/5 text-[#92400E]'
                          : 'border-[#e5e0db] bg-white text-[#6f5b4e] hover:border-[#92400E]/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selected ? 'border-[#92400E] bg-[#92400E]' : 'border-[#9a8a7d]'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {activity}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Weekly Structure</label>
              <textarea
                value={form.weeklyStructure}
                onChange={(e) => update('weeklyStructure', e.target.value)}
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60 resize-none"
                placeholder="Describe a typical weekly schedule for participants..."
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Location</h2>
              <p className="text-sm text-[#6f5b4e]">Where is your organization based?</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="Addis Ababa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Region</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.region}
                  onChange={(e) => update('region', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="Addis Ababa / Oromia / SNNPR"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Verification Uploads</h2>
              <p className="text-sm text-[#6f5b4e]">Upload documents to verify your organization</p>
            </div>

            {[
              { key: 'orgLetter' as const, label: 'Organization Letter', desc: 'Official letter from your organization' },
              { key: 'authDoc' as const, label: 'Authorization Document', desc: 'Government or religious body authorization' },
              { key: 'identityDoc' as const, label: 'Identity Verification', desc: 'Representative government ID' },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  form[key] ? 'border-green-400 bg-green-50/30' : 'border-[#e5e0db] hover:border-[#92400E]/30'
                }`}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${form[key] ? 'text-green-600' : 'text-[#9a8a7d]'}`} />
                <p className="text-sm font-semibold text-[#2c241f]">{label}</p>
                <p className="text-xs text-[#9a8a7d] mt-1">{desc}</p>
                {form[key] ? (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>File attached</span>
                    <button
                      type="button"
                      onClick={() => update(key, null)}
                      className="text-red-500 hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#9a8a7d] mt-2 italic">File upload UI (not functional)</p>
                )}
              </div>
            ))}
          </div>
        )

      case 5:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Review & Submit</h2>
              <p className="text-sm text-[#6f5b4e]">Please verify your information before submitting</p>
            </div>

            <div className="space-y-3">
              <div className="bg-[#f6f5f1] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Organization</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.orgName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Faith Tradition</span>
                  <span className="text-sm font-medium text-[#2c241f] capitalize">{form.faithTradition}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Representative</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.repName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Phone</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.repPhone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Email</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.repEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Program</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.programName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">City / Region</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.city}, {form.region}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Activities</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.recoveryActivities.join(', ') || 'None'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Documents</span>
                  <span className="text-sm font-medium text-[#2c241f]">
                    {[form.orgLetter && 'Letter', form.authDoc && 'Authorization', form.identityDoc && 'ID'].filter(Boolean).join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#92400E]/10 flex items-center justify-center">
            <Church className="w-7 h-7 text-[#92400E]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2c241f]">Faith Organization Registration</h1>
          <p className="text-sm text-[#6f5b4e]">Register your faith-based recovery program</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#e5e0db] bg-white shadow-xl shadow-[#92400E]/5">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#92400E] via-[#d97706] to-[#92400E]" />

            <div className="p-8 md:p-10 space-y-7">
              <div className="flex items-center justify-between">
                {STEP_LABELS.map((label, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i < step
                          ? 'bg-[#92400E] text-white'
                          : i === step
                          ? 'bg-[#92400E]/10 text-[#92400E] border-2 border-[#92400E]'
                          : 'bg-[#f6f5f1] text-[#9a8a7d]'
                      }`}
                    >
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </button>
                    <span className={`text-[9px] font-medium hidden sm:block ${
                      i <= step ? 'text-[#92400E]' : 'text-[#9a8a7d]'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

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

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={prev}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#6f5b4e] bg-[#f6f5f1] hover:bg-[#e5e0db] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#92400E] hover:bg-[#a04e14] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Submit Application</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <FullPageLink href="/directory" className="inline-flex items-center gap-1 text-sm text-[#6f5b4e] hover:text-[#92400E] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
            </FullPageLink>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
