'use client'

import { ChevronDown, ChevronLeft, ChevronRight, Globe2, Laptop, MapPin, UserCircle } from 'lucide-react'

const providers = [
  {
    name: 'Dr. Selamawit Bekele',
    type: 'PSYCHIATRIST',
    languages: 'Amharic, English',
    bio: 'Specializing in trauma-informed care and recovery for first-generation students. I bridge clinical support with cultural understanding.',
    price: '$120 / session',
    mode: 'Online',
    badge: 'Verified',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80',
    action: 'Book Session',
  },
  {
    name: 'St. Mary Recovery',
    type: 'CHURCH-LED',
    languages: 'Amharic',
    bio: 'A safe, spiritual space offering mentorship and group prayer for students struggling with addiction or isolation.',
    price: 'Free (Pro-bono)',
    mode: 'In-person',
    badge: 'Faith Support',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
    action: 'Join Program',
  },
  {
    name: 'Marcus Thorne',
    type: 'COUNSELOR',
    languages: 'English',
    bio: 'Focusing on student anxiety and academic pressure. I provide a judgment-free zone for navigating recovery and family stress.',
    price: '$85 / session',
    mode: 'Hybrid',
    badge: 'Verified',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80',
    action: 'Book Session',
  },
]

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      <header className="sticky top-0 z-30 border-b border-[#eadfd5] bg-[#fbfaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-serif text-2xl font-bold text-[#8a3d08]">Faith Support</h1>
          <div className="flex items-center gap-5 text-sm text-[#3b2418]">
            <button>Amharic/English</button>
            <button className="rounded-full bg-[#9a4f00] px-6 py-2 font-bold text-white">PANIC</button>
            <UserCircle size={22} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="max-w-4xl">
          <h2 className="font-serif text-4xl font-bold text-[#17120f]">Healing through Connection</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#4d362a]">
            Find a path forward with culturally responsive clinical care or grounded spiritual guidance.
            Your journey is private, secure, and supported by those who understand your heritage.
          </p>
        </section>

        <div className="mt-12 inline-flex rounded-full bg-[#f1f0ee] p-2 shadow-sm">
          <button className="min-w-44 rounded-full bg-[#9a4f00] px-8 py-3 font-bold text-white shadow-md">
            Clinical Support
          </button>
          <button className="min-w-56 rounded-full px-8 py-3 font-bold text-[#3b2418]">
            Faith-Based Programs
          </button>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#e2d6cb] bg-white p-8 shadow-[0_22px_60px_rgba(55,36,22,0.08)]">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_2fr_auto]">
            <label className="space-y-3">
              <span className="text-sm font-bold tracking-widest text-[#3b2418]">City or Region</span>
              <span className="flex items-center gap-3 rounded-full bg-[#f0f0ef] px-5 py-3 text-[#6d625b]">
                <MapPin size={18} className="text-[#8a7160]" />
                Addis Ababa, London
              </span>
            </label>
            <label className="space-y-3">
              <span className="text-sm font-bold tracking-widest text-[#3b2418]">Language</span>
              <span className="flex items-center justify-between rounded-full bg-[#f0f0ef] px-5 py-3 text-[#221a16]">
                Any Language
                <ChevronDown size={18} className="text-[#64748b]" />
              </span>
            </label>
            <div className="space-y-3">
              <span className="block text-sm font-bold tracking-widest text-[#3b2418]">Session Type</span>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full border border-[#d6ad92] px-7 py-3 font-bold">Online</button>
                <button className="rounded-full border border-[#d6ad92] px-7 py-3 font-bold">In-person</button>
              </div>
            </div>
            <label className="flex items-end gap-4 pb-3">
              <span className="h-7 w-14 rounded-full bg-[#dedddb] p-1">
                <span className="block h-5 w-5 rounded-full bg-white" />
              </span>
              <span className="whitespace-nowrap font-bold">Pro-bono only</span>
            </label>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-3">
          {providers.map((provider) => (
            <article key={provider.name} className="overflow-hidden rounded-[2rem] border border-[#dfd7d0] bg-white shadow-[0_18px_45px_rgba(55,36,22,0.08)]">
              <div
                className="relative h-52 bg-cover bg-center"
                style={{ backgroundImage: `url("${provider.image}")` }}
              >
                <span className={`absolute right-5 top-5 rounded-full px-4 py-2 text-sm font-bold ${
                  provider.badge === 'Verified' ? 'bg-[#8bf2a1] text-[#006c2f]' : 'bg-[#c3522f] text-white'
                }`}>
                  {provider.badge}
                </span>
              </div>
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="max-w-[12rem] font-serif text-3xl font-bold leading-tight">{provider.name}</h3>
                  <span className="rounded-full bg-[#ece9e6] px-3 py-2 text-xs font-bold text-[#5a4436]">
                    {provider.type}
                  </span>
                </div>
                <p className="mt-4 flex items-center gap-2 font-bold tracking-wider text-[#007a31]">
                  <Globe2 size={17} />
                  {provider.languages}
                </p>
                <p className="mt-5 min-h-24 leading-7 text-[#4d362a]">{provider.bio}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[#e4ddd6] pt-5">
                  <span className={provider.price.startsWith('Free') ? 'font-bold text-[#007a31]' : 'font-bold text-[#8a3d08]'}>
                    {provider.price}
                  </span>
                  <span className="flex items-center gap-2 font-bold text-[#8a7160]">
                    <Laptop size={16} />
                    {provider.mode}
                  </span>
                </div>
                <button className={`mt-6 w-full rounded-full px-6 py-4 font-bold transition ${
                  provider.action === 'Join Program'
                    ? 'border-2 border-[#007a31] text-[#007a31] hover:bg-green-50'
                    : 'bg-[#9a4f00] text-white hover:bg-[#783d00]'
                }`}>
                  {provider.action}
                </button>
              </div>
            </article>
          ))}
        </section>

        <nav className="mt-12 flex items-center justify-center gap-8 text-[#3b2418]">
          <ChevronLeft size={20} />
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9a4f00] font-bold text-white">1</span>
          <span>2</span>
          <span>3</span>
          <span>...</span>
          <span>12</span>
          <ChevronRight size={20} />
        </nav>
      </main>

      <footer className="mt-20 bg-[#dedede] px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-serif text-2xl font-bold">SafeGround</h2>
            <p className="mt-6 leading-7 text-[#4d362a]">© 2024 SafeGround. A secure space for healing and recovery for the Ethiopian diaspora.</p>
          </div>
          <div>
            <h3 className="font-bold tracking-widest">OUR MISSION</h3>
            <p className="mt-6">Mission Statement</p>
            <p className="mt-4">University Partnerships</p>
          </div>
          <div>
            <h3 className="font-bold tracking-widest">SUPPORT</h3>
            <p className="mt-6">Support Helpdesk</p>
            <p className="mt-4">Privacy Policy</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
