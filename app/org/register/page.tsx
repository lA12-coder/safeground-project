'use client'

import { useState } from 'react'
import { CheckCircle, Church, Home, Plus, ShieldCheck, Upload, UserRound } from 'lucide-react'

const traditions = ['Sufi Recovery Practice', 'Liturgical Grounding', 'Biblical 12-Step Integration']
const ministries = ['Substance Use Support', 'Mental Health Advocacy', 'Grief & Bereavement', 'Holistic Grounding Workshops']

export default function OrgRegistrationPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    org_name: '',
    org_type: 'religious_org',
    faith_category: 'Orthodox',
    mission: '',
    leader: '',
    mentor: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.leader || form.org_name,
          org_name: form.org_name,
          type: form.org_type,
          city: 'Addis Ababa',
          region: 'Ethiopia',
          bio: form.mission || 'Faith-based recovery and spiritual grounding organization.',
          languages: ['Amharic', 'English'],
          online: true,
          in_person: true,
          pro_bono: true,
          consultation_fee: null,
          is_verified: false,
          is_active: false,
        }),
      })

      if (res.ok) setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf8] px-6">
        <section className="max-w-lg rounded-2xl border border-[#eadfd5] bg-white p-10 text-center shadow-sm">
          <CheckCircle size={48} className="mx-auto mb-4 text-[#007233]" />
          <h1 className="font-serif text-3xl font-bold">Registration Submitted</h1>
          <p className="mt-3 leading-7 text-[#4d362a]">Your sanctuary profile is in the admin approval queue.</p>
        </section>
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
            <a>Our Approach</a>
            <a>Safeguarding</a>
            <a>Help</a>
            <a className="rounded-full bg-[#9a4f00] px-6 py-2 text-white">Support Hub</a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-14">
        <section className="text-center">
          <h1 className="font-serif text-5xl font-bold text-[#17120f]">Spiritual Registration - Community Verification</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#4d362a]">
            Welcome to the Sanctuary. Join our network of verified spiritual organizations dedicated to healing,
            grounding, and recovery within faith traditions.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_34%]">
          <div className="rounded-lg border-2 border-[#c2512d] bg-white p-8">
            <div className="mb-7 flex items-center gap-3">
              <Home size={22} className="text-[#c2512d]" />
              <h2 className="text-2xl font-bold">Basic Information</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold tracking-widest">Organization Name</span>
                <input
                  value={form.org_name}
                  onChange={event => update('org_name', event.target.value)}
                  placeholder="e.g. Al-Noor Grounding Center"
                  className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold tracking-widest">Faith Category</span>
                <select
                  value={form.faith_category}
                  onChange={event => update('faith_category', event.target.value)}
                  className="w-full rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00]"
                >
                  <option>Orthodox</option>
                  <option>Muslim</option>
                  <option>Protestant</option>
                  <option>Interfaith</option>
                </select>
              </label>
            </div>
            <label className="mt-6 block space-y-2">
              <span className="text-sm font-bold tracking-widest">Mission Statement</span>
              <textarea
                value={form.mission}
                onChange={event => update('mission', event.target.value)}
                rows={5}
                placeholder="Describe how your organization supports grounding and spiritual well-being..."
                className="w-full resize-none rounded-lg border border-[#d9b7a4] px-4 py-4 outline-none focus:border-[#9a4f00]"
              />
            </label>
          </div>

          <aside className="relative min-h-80 overflow-hidden rounded-lg bg-[url('https://images.unsplash.com/photo-1528538090384-1b5bb505bf4e?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-t from-[#5a2700] via-[#5a2700]/35 to-transparent" />
            <p className="absolute bottom-8 left-7 max-w-xs font-serif text-xl font-bold italic text-white">
              "A place where the soul finds its footing."
            </p>
          </aside>
        </section>

        <section className="mt-6 rounded-lg border-2 border-[#00b86b] bg-white p-8">
          <div className="mb-8 flex items-center gap-3">
            <Church size={22} className="text-[#00a862]" />
            <h2 className="text-2xl font-bold">Spiritual Foundation</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-widest">Faith Tradition</h3>
              <div className="space-y-3">
                {traditions.map(item => (
                  <button key={item} className="flex w-full items-center gap-3 rounded-lg bg-[#f0f0ef] px-4 py-4 text-left">
                    <span className="h-5 w-5 rounded-full border border-[#6f7785]" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-widest">Recovery Ministry Type</h3>
              <div className="space-y-3">
                {ministries.map(item => (
                  <label key={item} className="flex items-center gap-3">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#6f7785]" />
                    {item}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold tracking-widest">Current Programs</h3>
              <input placeholder="Add a program tag..." className="w-full rounded-full border border-[#d9b7a4] px-5 py-3 outline-none" />
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full border border-[#f7c25a] bg-[#fff8e5] px-4 py-2 text-sm font-bold text-[#d97706]">Daily Prayer x</span>
                <span className="rounded-full border border-[#f7c25a] bg-[#fff8e5] px-4 py-2 text-sm font-bold text-[#d97706]">Meditative Walking x</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[#eadfd5] bg-white p-8">
            <div className="mb-8 flex items-center gap-3">
              <UserRound size={22} className="text-[#c2512d]" />
              <h2 className="text-2xl font-bold">Leadership</h2>
            </div>
            <label className="flex items-center gap-5 rounded-xl bg-[#f0f0ef] px-5 py-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd8be] text-[#9a4f00]">
                <UserRound />
              </span>
              <span>
                <span className="block text-xs text-[#806b5d]">Lead Spiritual Director</span>
                <input
                  value={form.leader}
                  onChange={event => update('leader', event.target.value)}
                  placeholder="Full Name"
                  className="mt-1 bg-transparent outline-none"
                />
              </span>
            </label>
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold tracking-widest">Mentor List</span>
                <span className="text-sm font-bold">(Max 5)</span>
              </div>
              <div className="flex gap-3">
                <input
                  value={form.mentor}
                  onChange={event => update('mentor', event.target.value)}
                  placeholder="Mentor email..."
                  className="flex-1 rounded-lg border border-[#d9b7a4] px-4 py-3 outline-none"
                />
                <button className="rounded-lg bg-[#006c43] px-5 text-white">
                  <Plus size={22} />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#eadfd5] bg-white p-8">
            <div className="mb-8 flex items-center gap-3">
              <ShieldCheck size={22} className="text-[#ff7a00]" />
              <h2 className="text-2xl font-bold">Verification</h2>
            </div>
            <p className="leading-7 text-[#4d362a]">
              Please upload formal documentation of your religious organization or non-profit status.
            </p>
            <div className="mt-8 flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#d9b7a4] text-center">
              <Upload size={34} className="text-[#8a7160]" />
              <p className="mt-3 font-bold text-[#8a7160]">Drag & Drop Documents</p>
              <p className="text-xs text-[#d3ad97]">PDF, JPG (Max 5MB)</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#f2c84b] bg-[#fff8d9] p-8">
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
              <label className="flex items-start gap-4">
                <input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} className="mt-1 h-6 w-6" />
                <span className="text-lg">We agree to the Sanctuary Safety Rules and Ethical Conduct.</span>
              </label>
              <button
                onClick={handleSubmit}
                disabled={!agreed || submitting}
                className="mt-6 w-full rounded-lg bg-[#9a4f00] px-7 py-4 text-xl font-bold text-white disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        </section>

        <footer className="py-14 text-center text-sm font-bold tracking-widest text-[#806b5d]">
          © 2024 SafeGround Collective - A Therapeutic Grounding Initiative
        </footer>
      </div>
    </main>
  )
}
