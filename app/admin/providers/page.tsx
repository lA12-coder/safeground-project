'use client'

import { useState } from 'react'
import { ArrowUpRight, BadgeCheck, ChevronRight, Download, FileText, Gauge, Landmark, Search, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'

const applications = [
  { id: 'rw', initials: 'RW', name: 'Rooted Wellness', city: 'San Francisco, CA', category: 'Therapy', date: 'Oct 24, 2023', score: 96 },
  { id: 'hf', initials: 'HF', name: 'Hope Foundation', city: 'Austin, TX', category: 'Non-Profit', date: 'Oct 23, 2023', score: 72 },
  { id: 'cc', initials: 'CC', name: 'Calm Collective', city: 'Portland, OR', category: 'Spiritual', date: 'Oct 22, 2023', score: 89 },
  { id: 'an', initials: 'AN', name: 'Ascend Network', city: 'New York, NY', category: 'Community', date: 'Oct 21, 2023', score: 45 },
]

const categoryClass: Record<string, string> = {
  Therapy: 'bg-[#d7f4e4] text-[#007a4b]',
  'Non-Profit': 'bg-[#fdecec] text-[#8d1b15]',
  Spiritual: 'bg-[#d7f4e4] text-[#007a4b]',
  Community: 'bg-[#d7f4e4] text-[#007a4b]',
}

export default function AdminProvidersPage() {
  const [selected, setSelected] = useState(applications[0])

  return (
    <div className="-m-8 min-h-screen bg-[#fbfaf8]">
      <header className="flex items-center justify-between border-b border-[#eadfd5] bg-[#fbfaf8] px-10 py-6">
        <div className="flex items-center gap-6">
          <h1 className="font-serif text-3xl font-bold text-[#8a3d08]">Admin Organization Approval Center</h1>
          <span className="rounded-full bg-[#ffd8be] px-5 py-2 font-bold">12 Pending</span>
        </div>
        <div className="flex items-center gap-8">
          <label className="flex w-80 items-center gap-3 rounded-full bg-[#f0f0ef] px-5 py-3 text-[#6d625b]">
            <Search size={18} />
            <input placeholder="Search applications..." className="w-full bg-transparent outline-none" />
          </label>
          <button className="relative">
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#dc2626]" />
            <ShieldCheck size={25} className="text-[#3b2418]" />
          </button>
        </div>
      </header>

      <main className="grid gap-10 px-10 py-12 xl:grid-cols-[1fr_31rem]">
        <section className="space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="inline-flex rounded-2xl bg-[#e7e7e6] p-1">
              {['Pending', 'Approved', 'Rejected'].map((tab) => (
                <button
                  key={tab}
                  className={`min-w-36 rounded-xl px-8 py-3 font-bold ${tab === 'Pending' ? 'bg-white text-[#8a3d08] shadow-sm' : 'text-[#3b2418]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex min-w-64 items-center gap-5 rounded-2xl bg-white px-7 py-6 shadow-[0_16px_40px_rgba(55,36,22,0.08)]">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#9df6bf]">
                  <BadgeCheck size={30} />
                </span>
                <span>
                  <span className="block text-sm text-[#806b5d]">Trust Avg.</span>
                  <strong className="text-3xl text-[#007a4b]">94.2%</strong>
                </span>
              </div>
              <div className="flex min-w-64 items-center gap-5 rounded-2xl bg-white px-7 py-6 shadow-[0_16px_40px_rgba(55,36,22,0.08)]">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffd8be]">
                  <Gauge size={30} />
                </span>
                <span>
                  <span className="block text-sm text-[#806b5d]">Review Speed</span>
                  <strong className="text-3xl text-[#8a3d08]">4.2h</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_55px_rgba(55,36,22,0.08)]">
            <div className="flex items-center justify-between px-8 py-7">
              <h2 className="text-2xl">Application Queue</h2>
              <button className="flex items-center gap-2 font-bold text-[#8a3d08]">
                <SlidersHorizontal size={17} />
                Advanced Filter
              </button>
            </div>
            <div className="grid grid-cols-[1.7fr_1fr_0.8fr_0.7fr_0.3fr] bg-[#f7f7f7] px-8 py-5 text-sm font-bold text-[#3b2418]">
              <span>Organization</span>
              <span>Category</span>
              <span>Date</span>
              <span>Trust Score</span>
              <span>Action</span>
            </div>
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                className={`grid w-full grid-cols-[1.7fr_1fr_0.8fr_0.7fr_0.3fr] items-center border-t border-[#eee8e2] px-8 py-8 text-left transition hover:bg-[#fffaf6] ${
                  selected.id === app.id ? 'border-l-4 border-l-[#9a4f00] bg-[#fffaf8]' : ''
                }`}
              >
                <span className="flex items-center gap-5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eeeeed] text-xl font-bold text-[#8a3d08]">
                    {app.initials}
                  </span>
                  <span>
                    <strong className="block text-xl leading-tight">{app.name}</strong>
                    <span className="text-[#806b5d]">{app.city}</span>
                  </span>
                </span>
                <span>
                  <span className={`rounded-full px-4 py-2 font-bold ${categoryClass[app.category]}`}>
                    {app.category}
                  </span>
                </span>
                <span>{app.date}</span>
                <span className={app.score < 60 ? 'font-bold text-[#dc2626]' : app.score < 80 ? 'font-bold text-[#c2410c]' : 'font-bold text-[#00a862]'}>
                  {app.score}%
                </span>
                <ChevronRight className="text-[#806b5d]" />
              </button>
            ))}
            <button className="w-full border-t border-[#eee8e2] py-8 font-bold text-[#3b2418]">Load more applications</button>
          </div>
        </section>

        <aside className="rounded-3xl bg-[#f0f0ef] shadow-[0_22px_65px_rgba(55,36,22,0.08)]">
          <div className="p-9">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#ffd8be] text-4xl font-bold text-[#8a3d08]">
                  {selected.initials}
                </span>
                <div>
                  <h2 className="font-serif text-3xl">{selected.name}</h2>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-full bg-[#d7f4e4] px-3 py-1 text-sm font-bold text-[#00a862]">NO SPAM DETECTED</span>
                    <span className="text-sm font-bold text-[#8a7160]">EST. 2012</span>
                  </div>
                </div>
              </div>
              <ArrowUpRight size={26} className="text-[#806b5d]" />
            </div>
          </div>

          <div className="bg-white px-9 py-10">
            <h3 className="text-sm uppercase tracking-wide text-[#8a7160]">Mission & Impact</h3>
            <p className="mt-5 text-xl leading-9">
              "To provide trauma-informed, faith-integrated therapeutic support for marginalized communities,
              focusing on grounding techniques that foster long-term emotional resilience and cultural connection."
            </p>

            <h3 className="mt-12 text-sm uppercase tracking-wide text-[#8a7160]">Uploaded Documents (3)</h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[#eadfd5] px-5 py-4">
                <span className="flex items-center gap-4">
                  <span className="rounded-lg bg-[#f4eee9] p-3 text-[#9a4f00]"><FileText size={24} /></span>
                  <span>
                    <strong className="block">Tax_Exemption_501c3.pdf</strong>
                    <span className="text-sm text-[#806b5d]">Verified by AI - 2.4 MB</span>
                  </span>
                </span>
                <Download size={22} className="text-[#806b5d]" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#eadfd5] px-5 py-4">
                <span className="flex items-center gap-4">
                  <span className="rounded-lg bg-[#f4eee9] p-3 text-[#9a4f00]"><Landmark size={24} /></span>
                  <span>
                    <strong className="block">Medical_License_2023.pdf</strong>
                    <span className="text-sm text-[#806b5d]">Verified by AI - 1.1 MB</span>
                  </span>
                </span>
                <Download size={22} className="text-[#806b5d]" />
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-[#f0f0ef] p-7">
              <h3 className="flex items-center gap-2 text-sm uppercase tracking-wide text-[#8a7160]">
                <Sparkles size={18} />
                AI Risk Analysis
              </h3>
              <dl className="mt-6 space-y-5">
                <div className="flex justify-between"><dt>Legitimacy Score</dt><dd className="font-bold text-[#00a862]">High (98/100)</dd></div>
                <div className="flex justify-between"><dt>Conflict of Interest</dt><dd className="font-bold text-[#00a862]">None Detected</dd></div>
                <div className="flex justify-between"><dt>Identity Mismatch</dt><dd className="font-bold text-[#8a3d08]">0.2% Variance</dd></div>
              </dl>
              <p className="mt-8 rounded-lg bg-white p-5 italic text-[#4d362a]">
                "AI Recommendation: Highly reliable entity. All documents match public records and non-profit databases. Recommend immediate approval."
              </p>
            </div>
          </div>

          <div className="space-y-5 p-9">
            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#18764f] px-8 py-5 text-2xl font-bold text-white">
              <BadgeCheck />
              Approve Organization
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              <button className="rounded-xl border border-[#eadfd5] bg-white px-5 py-4 font-bold">Request Changes</button>
              <button className="rounded-xl border border-[#f2b2b2] bg-white px-5 py-4 font-bold text-[#dc2626]">Reject & Block</button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
