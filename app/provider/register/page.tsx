'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, Mail, MapPin, Globe, Briefcase, Stethoscope,
  Wifi, UserCheck, FileText, Check, ChevronRight, ChevronLeft,
  Loader2, Shield, ArrowLeft, Sparkles, Clock, CheckCircle,
  XCircle, GraduationCap, HeartHandshake, Brain,
  Languages, BookOpen, Building2, Upload,
} from 'lucide-react'
import { FullPageLink } from '@/components/ui/FullPageLink'

const PROFESSIONAL_ROLES = [
  { value: 'psychiatrist', label: 'Psychiatrist', icon: Stethoscope },
  { value: 'counselor', label: 'Counselor', icon: HeartHandshake },
  { value: 'psychologist', label: 'Psychologist', icon: Brain },
  { value: 'mentor', label: 'Mentor', icon: GraduationCap },
]

const LANGUAGES = ['Amharic', 'English', 'Afaan Oromo', 'Tigrinya']

const SPECIALIZATIONS = [
  'CSBD', 'Pornography Addiction', 'Anxiety', 'Depression', 'Youth Counseling',
]

const STEP_ICONS = [
  User, Briefcase, Phone, Stethoscope, Clock, Upload, CheckCircle,
]

const STEP_LABELS = [
  'Personal Info', 'Contact', 'Professional', 'Availability', 'Documents', 'Review',
]

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
}

type FormData = {
  fullName: string
  licenseNumber: string
  role: string
  phone: string
  email: string
  city: string
  languages: string[]
  yearsOfExperience: number
  specializations: string[]
  online: boolean
  inPerson: boolean
  startHour: string
  endHour: string
  licenseFile: string | null
  idFile: string | null
  certificateFile: string | null
}

export default function ProviderRegisterPage() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    fullName: '',
    licenseNumber: '',
    role: '',
    phone: '',
    email: '',
    city: '',
    languages: [],
    yearsOfExperience: 5,
    specializations: [],
    online: false,
    inPerson: true,
    startHour: '09:00',
    endHour: '17:00',
    licenseFile: null,
    idFile: null,
    certificateFile: null,
  })

  const update = (field: keyof FormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleArray = (field: 'languages' | 'specializations', value: string) =>
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
      case 0: return form.fullName.length > 0 && form.licenseNumber.length > 0 && form.role.length > 0
      case 1: return form.phone.length > 0 && form.email.length > 0 && form.city.length > 0
      case 2: return form.yearsOfExperience > 0 && form.specializations.length > 0
      case 3: return true
      case 4: return true
      default: return true
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/provider/register', {
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
            Registration Submitted
          </h1>
          <p className="text-[#6f5b4e]">
            Your application has been received. Our team will review your credentials
            and verify your documents. You will be notified once your account is approved.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
            <Shield className="w-4 h-4" />
            <span>Pending Verification — typically reviewed within 48 hours</span>
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
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Personal Information</h2>
              <p className="text-sm text-[#6f5b4e]">Tell us about yourself</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="Dr. Abebe Kebede"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">License Number</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.licenseNumber}
                  onChange={(e) => update('licenseNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="MOH-LIC-2024-XXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Professional Role</label>
              <div className="grid grid-cols-2 gap-3">
                {PROFESSIONAL_ROLES.map((role) => {
                  const Icon = role.icon
                  const selected = form.role === role.value
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => update('role', role.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-[#92400E] bg-[#92400E]/5'
                          : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                      <span className={`text-sm font-medium ${selected ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                        {role.label}
                      </span>
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
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Contact Information</h2>
              <p className="text-sm text-[#6f5b4e]">How clients can reach you</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="+251 91X XXX XXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] placeholder:text-[#9a8a7d]/50 focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  placeholder="dr.abebe@example.com"
                />
              </div>
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
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const selected = form.languages.includes(lang)
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArray('languages', lang)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selected
                          ? 'border-[#92400E] bg-[#92400E]/5 text-[#92400E]'
                          : 'border-[#e5e0db] bg-white text-[#6f5b4e] hover:border-[#92400E]/30'
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      {lang}
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Professional Information</h2>
              <p className="text-sm text-[#6f5b4e]">Your expertise and experience</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">
                Years of Experience: {form.yearsOfExperience}
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={form.yearsOfExperience}
                onChange={(e) => update('yearsOfExperience', parseInt(e.target.value))}
                className="w-full accent-[#92400E]"
              />
              <div className="flex justify-between text-xs text-[#9a8a7d]">
                <span>1 year</span>
                <span>50 years</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Specializations</label>
              <div className="grid grid-cols-2 gap-3">
                {SPECIALIZATIONS.map((spec) => {
                  const selected = form.specializations.includes(spec)
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleArray('specializations', spec)}
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
                      {spec}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Availability</h2>
              <p className="text-sm text-[#6f5b4e]">Set your consultation preferences</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => update('online', !form.online)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  form.online
                    ? 'border-[#92400E] bg-[#92400E]/5'
                    : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30'
                }`}
              >
                <Wifi className={`w-8 h-8 ${form.online ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                <span className={`text-sm font-semibold ${form.online ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                  Online
                </span>
                <span className="text-xs text-[#6f5b4e]">Video consultations</span>
                {form.online && <CheckCircle className="w-5 h-5 text-green-600" />}
              </button>

              <button
                type="button"
                onClick={() => update('inPerson', !form.inPerson)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  form.inPerson
                    ? 'border-[#92400E] bg-[#92400E]/5'
                    : 'border-[#e5e0db] bg-white hover:border-[#92400E]/30'
                }`}
              >
                <Building2 className={`w-8 h-8 ${form.inPerson ? 'text-[#92400E]' : 'text-[#9a8a7d]'}`} />
                <span className={`text-sm font-semibold ${form.inPerson ? 'text-[#92400E]' : 'text-[#2c241f]'}`}>
                  In-Person
                </span>
                <span className="text-xs text-[#6f5b4e]">Face to face sessions</span>
                {form.inPerson && <CheckCircle className="w-5 h-5 text-green-600" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                  <input
                    type="time"
                    value={form.startHour}
                    onChange={(e) => update('startHour', e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#92400E]">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5b4e]/60 pointer-events-none" />
                  <input
                    type="time"
                    value={form.endHour}
                    onChange={(e) => update('endHour', e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e0db] bg-white text-[#2c241f] focus:outline-none focus:ring-2 focus:ring-[#92400E]/25 focus:border-[#92400E]/60"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-bold text-[#2c241f]">Verification Documents</h2>
              <p className="text-sm text-[#6f5b4e]">Upload your credentials for verification</p>
            </div>

            {[
              { key: 'licenseFile' as const, label: 'Professional License', desc: 'Valid practicing license PDF or image' },
              { key: 'idFile' as const, label: 'Government ID', desc: 'Passport, national ID, or driver license' },
              { key: 'certificateFile' as const, label: 'Professional Certificate', desc: 'Degree or specialized training certificate' },
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
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Full Name</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Role</span>
                  <span className="text-sm font-medium text-[#2c241f] capitalize">{form.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">License</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.licenseNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Email</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">City</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.city}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Experience</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.yearsOfExperience} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Languages</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.languages.join(', ') || 'None'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Specializations</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.specializations.join(', ') || 'None'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Mode</span>
                  <span className="text-sm font-medium text-[#2c241f]">
                    {[form.online && 'Online', form.inPerson && 'In-Person'].filter(Boolean).join(' + ') || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Hours</span>
                  <span className="text-sm font-medium text-[#2c241f]">{form.startHour} - {form.endHour}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9a8a7d] uppercase tracking-wider">Documents</span>
                  <span className="text-sm font-medium text-[#2c241f]">
                    {[form.licenseFile && 'License', form.idFile && 'ID', form.certificateFile && 'Certificate'].filter(Boolean).join(', ') || 'None'}
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
            <Stethoscope className="w-7 h-7 text-[#92400E]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2c241f]">Provider Registration</h1>
          <p className="text-sm text-[#6f5b4e]">Join our network of recovery professionals</p>
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
                      <><CheckCircle className="w-4 h-4" /> Submit Registration</>
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
