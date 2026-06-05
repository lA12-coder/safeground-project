'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Church, Home, Plus, ShieldCheck, Upload, UserRound, X, Loader2, XCircle } from 'lucide-react'

const traditions = ['Sufi Recovery Practice', 'Liturgical Grounding', 'Biblical 12-Step Integration']
const ministries = ['Substance Use Support', 'Mental Health Advocacy', 'Grief & Bereavement', 'Holistic Grounding Workshops']

export default function OrgRegistrationPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([])
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([])
  const [mentors, setMentors] = useState<string[]>([])
  const [programTags, setProgramTags] = useState<string[]>(['Daily Prayer', 'Meditative Walking'])
  const [form, setForm] = useState({
    org_name: '',
    org_type: 'religious_org',
    faith_category: 'Orthodox',
    mission: '',
    leader: '',
    mentorInput: '',
    registrationNumber: '',
    city: 'Addis Ababa',
    languages: 'Amharic, English',
    phone: '',
    email: '',
    contactRole: '',
    fee: '',
    online: true,
    inPerson: true,
    proBono: true,
  })
  const steps = ['Basic Info', 'Spiritual Foundation', 'Leadership & Docs', 'Agreement']
  const [currentStep, setCurrentStep] = useState(0)

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addMentor = () => {
    const email = form.mentorInput.trim()
    if (email && mentors.length < 5 && !mentors.includes(email)) {
      setMentors(prev => [...prev, email])
      update('mentorInput', '')
    }
  }

  const removeMentor = (email: string) => setMentors(prev => prev.filter(m => m !== email))

  const toggleTradition = (t: string) =>
    setSelectedTraditions(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const toggleMinistry = (m: string) =>
    setSelectedMinistries(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const addProgramTag = (tag: string) => {
    if (tag && !programTags.includes(tag)) setProgramTags(prev => [...prev, tag])
  }

  const validateStep = () => {
    if (currentStep === 0 && (!form.org_name.trim() || !form.city.trim() || !form.mission.trim())) {
      return 'Please add the organization name, city, and mission statement.'
    }
    if (currentStep === 1 && selectedMinistries.length === 0 && selectedTraditions.length === 0) {
      return 'Select at least one tradition or recovery ministry type.'
    }
    if (currentStep === 2 && (!form.leader.trim() || !form.email.trim())) {
      return 'Please add a lead contact name and email.'
    }
    return null
  }

  const goNext = () => {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  async function handleSubmit() {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const services = selectedMinistries.length > 0 ? selectedMinistries : ['Faith-based recovery support']
      const bio = [
        form.mission,
        `Faith category: ${form.faith_category}.`,
        selectedTraditions.length > 0 ? `Traditions: ${selectedTraditions.join(', ')}.` : '',
        `Recovery services: ${services.join(', ')}.`,
        programTags.length > 0 ? `Current programs: ${programTags.join(', ')}.` : '',
        `Lead contact: ${form.leader}${form.contactRole ? `, ${form.contactRole}` : ''} (${form.email}).`,
        form.registrationNumber ? `Registration number: ${form.registrationNumber}.` : '',
        mentors.length > 0 ? `Mentors: ${mentors.join(', ')}.` : '',
      ].filter(Boolean).join('\n')

      const res = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.leader || form.org_name,
          org_name: form.org_name,
          type: form.org_type,
          faith_category: form.faith_category,
          city: form.city,
          region: 'Ethiopia',
          specialization: services.join(', '),
          bio,
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          traditions: selectedTraditions,
          services,
          ministries: services,
          programs: programTags,
          mentors,
          online: form.online,
          in_person: form.inPerson,
          pro_bono: form.proBono,
          consultation_fee: form.proBono ? null : Number(form.fee) || null,
          phone: form.phone,
          is_verified: false,
          is_active: false,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf8] px-6">
        <motion.section initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg rounded-2xl border border-[#eadfd5] bg-white p-10 text-center shadow-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <CheckCircle size={48} className="mx-auto mb-4 text-[#007233]" />
          </motion.div>
          <h1 className="font-serif text-3xl font-bold">Registration Submitted</h1>
          <p className="mt-3 leading-7 text-[#4d362a]">Your sanctuary profile is in the admin approval queue. We will review and verify your organization shortly.</p>
        </motion.section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fbfaf8]">
      <header className="border-b border-[#eadfd5] bg-[#fbfaf8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-serif text-3xl font-bold text-[#8a3d08]">
            <ShieldCheck size={24} />
            SafeGround
          </div>
          <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
            <a className="hover:text-[#9a4f00] transition-colors cursor-pointer">Our Approach</a>
            <a className="hover:text-[#9a4f00] transition-colors cursor-pointer">Safeguarding</a>
            <a className="hover:text-[#9a4f00] transition-colors cursor-pointer">Help</a>
            <a className="rounded-full bg-[#9a4f00] px-6 py-2 text-white hover:brightness-110 transition-all">Support Hub</a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-14">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-serif text-5xl font-bold text-[#17120f]">Spiritual Registration</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#4d362a]">
            Join our network of verified spiritual organizations dedicated to healing,
            grounding, and recovery within faith traditions.
          </p>
        </motion.section>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <XCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <motion.div
                  initial={false}
                  animate={{ scale: i === currentStep ? 1.1 : 1 }}
                  className={`flex items-center gap-2 ${i <= currentStep ? 'text-[#9a4f00]' : 'text-[#806b5d]'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < currentStep ? 'bg-[#007233] text-white' :
                    i === currentStep ? 'bg-[#9a4f00] text-white' : 'bg-[#e3ddd7] text-[#806b5d]'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-semibold hidden sm:block">{step}</span>
                </motion.div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 transition-colors ${i < currentStep ? 'bg-[#007233]' : 'bg-[#e3ddd7]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_34%]">
                <div className="rounded-lg border-2 border-[#c2512d] bg-white p-8">
                  <div className="mb-7 flex items-center gap-3">
                    <Home size={22} className="text-[#c2512d]" />
                    <h2 className="text-2xl font-bold">Basic Information</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-bold tracking-widest">Organization Name *</span>
                      <input value={form.org_name} onChange={e => update('org_name', e.target.value)}
                        placeholder="e.g. Al-Noor Grounding Center"
                        className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00] transition-colors" required />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-bold tracking-widest">Faith Category *</span>
                      <select value={form.faith_category} onChange={e => update('faith_category', e.target.value)}
                        className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00] transition-colors">
                        <option>Orthodox</option><option>Muslim</option><option>Protestant</option><option>Interfaith</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-bold tracking-widest">City</span>
                      <input value={form.city} onChange={e => update('city', e.target.value)}
                        placeholder="Addis Ababa"
                        className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00] transition-colors" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-bold tracking-widest">Registration No.</span>
                      <input value={form.registrationNumber} onChange={e => update('registrationNumber', e.target.value)}
                        placeholder="Certificate or license number"
                        className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00] transition-colors" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-bold tracking-widest">Languages (comma-sep)</span>
                      <input value={form.languages} onChange={e => update('languages', e.target.value)}
                        placeholder="Amharic, English"
                        className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00] transition-colors" />
                    </label>
                  </div>
                  <label className="mt-6 block space-y-2">
                    <span className="text-sm font-bold tracking-widest">Mission Statement *</span>
                    <textarea value={form.mission} onChange={e => update('mission', e.target.value)}
                      rows={5} placeholder="Describe how your organization supports recovery..."
                      className="w-full resize-none rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00] transition-colors" />
                  </label>
                </div>
                <aside className="relative min-h-80 overflow-hidden rounded-lg">
                  <img src="/org-hero.svg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5a2700]/60 via-transparent to-transparent" />
                  <p className="absolute bottom-8 left-7 max-w-xs font-serif text-xl font-bold italic text-white">
                    "A place where the soul finds its footing."
                  </p>
                </aside>
              </section>
            )}

            {currentStep === 1 && (
              <section className="mt-8 rounded-lg border-2 border-[#00b86b] bg-white p-8">
                <div className="mb-8 flex items-center gap-3">
                  <Church size={22} className="text-[#00a862]" />
                  <h2 className="text-2xl font-bold">Spiritual Foundation</h2>
                </div>
                <div className="grid gap-8 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-4 text-sm font-bold tracking-widest">Faith Tradition</h3>
                    <div className="space-y-3">
                      {traditions.map(item => (
                        <button key={item} onClick={() => toggleTradition(item)}
                          className={`flex w-full items-center gap-3 rounded-lg px-4 py-4 text-left transition-colors ${
                            selectedTraditions.includes(item) ? 'bg-[#e3ddd7] border border-[#9a4f00]' : 'bg-[#f0f0ef] hover:bg-[#e3ddd7]'
                          }`}>
                          <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            selectedTraditions.includes(item) ? 'border-[#9a4f00] bg-[#9a4f00]' : 'border-[#6f7785]'
                          }`}>
                            {selectedTraditions.includes(item) && <span className="text-white text-xs">✓</span>}
                          </span>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-4 text-sm font-bold tracking-widest">Recovery Ministry Type</h3>
                    <div className="space-y-3">
                      {ministries.map(item => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer hover:text-[#9a4f00] transition-colors">
                          <input type="checkbox" checked={selectedMinistries.includes(item)} onChange={() => toggleMinistry(item)}
                            className="h-4 w-4 rounded border-[#6f7785] text-[#9a4f00] focus:ring-[#9a4f00]" />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-4 text-sm font-bold tracking-widest">Current Programs</h3>
                    <input
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProgramTag((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                      placeholder="Add a program tag..."
                      className="w-full rounded-full border border-[#d9b7a4] px-5 py-3 outline-none focus:border-[#9a4f00] transition-colors" />
                    <div className="mt-4 flex flex-wrap gap-3">
                      {programTags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-[#f7c25a] bg-[#fff8e5] px-4 py-2 text-sm font-bold text-[#d97706]">
                          {tag}
                          <button onClick={() => setProgramTags(prev => prev.filter(t => t !== tag))} className="hover:text-[#9a4f00]">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 rounded-xl bg-[#f8f5f0] p-4">
                      <h3 className="mb-3 text-sm font-bold tracking-widest">Service Mode</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 text-sm font-semibold">
                          <input type="checkbox" checked={form.online} onChange={e => update('online', e.target.checked)}
                            className="h-4 w-4 rounded border-[#6f7785] text-[#9a4f00] focus:ring-[#9a4f00]" />
                          Online support
                        </label>
                        <label className="flex items-center gap-3 text-sm font-semibold">
                          <input type="checkbox" checked={form.inPerson} onChange={e => update('inPerson', e.target.checked)}
                            className="h-4 w-4 rounded border-[#6f7785] text-[#9a4f00] focus:ring-[#9a4f00]" />
                          In-person support
                        </label>
                        <label className="flex items-center gap-3 text-sm font-semibold">
                          <input type="checkbox" checked={form.proBono} onChange={e => update('proBono', e.target.checked)}
                            className="h-4 w-4 rounded border-[#6f7785] text-[#9a4f00] focus:ring-[#9a4f00]" />
                          Pro bono available
                        </label>
                        {!form.proBono && (
                          <input value={form.fee} onChange={e => update('fee', e.target.value)} inputMode="numeric"
                            placeholder="Fee in ETB"
                            className="w-full rounded-lg border border-[#d9b7a4] px-4 py-3 outline-none focus:border-[#9a4f00] transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-[#eadfd5] bg-white p-8">
                  <div className="mb-8 flex items-center gap-3">
                    <UserRound size={22} className="text-[#c2512d]" />
                    <h2 className="text-2xl font-bold">Leadership</h2>
                  </div>
                  <label className="flex items-center gap-5 rounded-xl bg-[#f0f0ef] px-5 py-5 hover:bg-[#e3ddd7] transition-colors">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd8be] text-[#9a4f00]">
                      <UserRound />
                    </span>
                    <span>
                      <span className="block text-xs text-[#806b5d]">Lead Spiritual Director *</span>
                      <input value={form.leader} onChange={e => update('leader', e.target.value)} placeholder="Full Name"
                        className="mt-1 bg-transparent outline-none" />
                    </span>
                  </label>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-bold tracking-widest">Contact Email *</span>
                      <input value={form.email} onChange={e => update('email', e.target.value)} type="email" placeholder="leader@example.org"
                        className="w-full rounded-lg border border-[#d9b7a4] px-4 py-3 outline-none focus:border-[#9a4f00] transition-colors" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-bold tracking-widest">Role</span>
                      <input value={form.contactRole} onChange={e => update('contactRole', e.target.value)} placeholder="Director, counselor..."
                        className="w-full rounded-lg border border-[#d9b7a4] px-4 py-3 outline-none focus:border-[#9a4f00] transition-colors" />
                    </label>
                  </div>
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold tracking-widest">Mentors ({mentors.length}/5)</span>
                    </div>
                    <div className="flex gap-3">
                      <input value={form.mentorInput} onChange={e => update('mentorInput', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMentor(); } }}
                        placeholder="Mentor email..." className="flex-1 rounded-lg border border-[#d9b7a4] px-4 py-3 outline-none focus:border-[#9a4f00] transition-colors" />
                      <button type="button" onClick={addMentor} disabled={mentors.length >= 5}
                        className="rounded-lg bg-[#006c43] px-5 text-white hover:brightness-110 disabled:opacity-40 transition-all">
                        <Plus size={22} />
                      </button>
                    </div>
                    {mentors.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {mentors.map(email => (
                          <div key={email} className="flex items-center justify-between bg-[#f0f0ef] rounded-lg px-4 py-2 text-sm">
                            <span>{email}</span>
                            <button onClick={() => removeMentor(email)} className="text-[#c2512d] hover:text-red-700"><X size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-[#eadfd5] bg-white p-8">
                  <div className="mb-8 flex items-center gap-3">
                    <ShieldCheck size={22} className="text-[#ff7a00]" />
                    <h2 className="text-2xl font-bold">Verification</h2>
                  </div>
                  <p className="leading-7 text-[#4d362a]">Upload formal documentation of your religious organization or non-profit status.</p>
                  <label className="mt-8 flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#d9b7a4] text-center hover:border-[#9a4f00] transition-colors">
                    <Upload size={34} className="text-[#8a7160]" />
                    <p className="mt-3 font-bold text-[#8a7160]">Click to Upload Documents</p>
                    <p className="text-xs text-[#d3ad97]">PDF, JPG (Max 5MB)</p>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                  </label>
                  <label className="mt-6 space-y-2 block">
                    <span className="text-sm font-bold tracking-widest">Phone</span>
                    <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+251..."
                      className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00] transition-colors" />
                  </label>
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="mt-8 rounded-lg border border-[#f2c84b] bg-[#fff8d9] p-8">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-[#c2512d]">
                  <ShieldCheck size={22} />
                  Sanctuary Safety & Ethical Agreement
                </h2>
                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_46%]">
                  <div className="space-y-5 text-[#4d362a]">
                    <p>By registering, you commit to the <strong>SafeGround Covenant:</strong></p>
                    <p className="text-[#007233]">Zero tolerance for harmful, coercive, or abusive teachings.</p>
                    <p className="text-[#007233]">Commitment to evidence-based recovery alongside faith practices.</p>
                    <p className="text-[#007233]">Full transparency in leadership and financial structures.</p>
                  </div>
                  <div className="rounded-xl bg-white p-7">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 h-6 w-6 rounded text-[#9a4f00] focus:ring-[#9a4f00]" />
                      <span className="text-lg">We agree to the Sanctuary Safety Rules and Ethical Conduct.</span>
                    </label>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentStep(prev => prev > 0 ? prev - 1 : prev)}
            disabled={currentStep === 0}
            className="px-8 py-4 rounded-lg border border-[#d9b7a4] text-[#4d362a] font-bold disabled:opacity-30 hover:bg-[#f4eee9] transition-all">
            Back
          </motion.button>
          {currentStep < steps.length - 1 ? (
            <motion.button whileTap={{ scale: 0.98 }}
              onClick={goNext}
              disabled={currentStep === 0 && !form.org_name}
              className="px-8 py-4 rounded-lg bg-[#006c43] text-white font-bold hover:brightness-110 disabled:opacity-50 transition-all">
              Next
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!agreed || submitting}
              className="px-8 py-4 rounded-lg bg-[#9a4f00] text-xl font-bold text-white disabled:opacity-50 hover:brightness-110 transition-all flex items-center gap-2">
              {submitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : 'Complete Registration'}
            </motion.button>
          )}
        </div>
      </div>
    </main>
  )
}
