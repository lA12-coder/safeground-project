'use client'

import { HabitLogForm } from '@/components/dashboard/HabitLogForm'
import { UserCircle } from 'lucide-react'

export default function LogPage() {
  const handleSubmit = (data: any) => {
    console.log('[SafeGround] Habit log submitted:', data)
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      <header className="sticky top-0 z-30 border-b border-[#eadfd5] bg-[#fbfaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-serif text-2xl font-bold text-[#8a3d08]">SafeGround</span>
          <div className="flex items-center gap-6 font-serif text-[#8a3d08]">
            <button>Amharic/English</button>
            <button className="rounded-full bg-[#9a4f00] px-6 py-2 font-bold text-white">PANIC</button>
            <UserCircle size={22} className="text-[#2e1f18]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <section className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-[#17120f]">Daily Recovery Log</h1>
          <p className="mt-3 font-serif text-[#4d362a]">
            Take a moment to breathe and reflect. This is your safe, private space.
          </p>
        </section>

        <HabitLogForm onSubmit={handleSubmit} />
      </main>

      <footer className="mt-16 bg-[#dedede] px-6 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 font-serif text-[#3b2418] md:grid-cols-3">
          <div>
            <p>SafeGround</p>
            <p className="mt-5">© 2024 SafeGround. A secure space for healing.</p>
          </div>
          <div>
            <p>Mission Statement</p>
            <p className="mt-4">University Partnerships</p>
          </div>
          <div>
            <p>Support Helpdesk</p>
            <p className="mt-4">Privacy Policy</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
