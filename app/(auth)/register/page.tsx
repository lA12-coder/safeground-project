'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Shield, Lock, RotateCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const languages = [
  { code: 'en', name: 'English', script: '' },
  { code: 'am', name: 'አማርኛ', script: 'Amharic' },
  { code: 'om', name: 'Oromifa', script: '' },
  { code: 'ti', name: 'ትግርኛ', script: 'Tigrinya' },
]

const amharicNames = ['Selam', 'Abenezer', 'Aster', 'Desta', 'Fikir', 'Kidus', 'Meba', 'Nardos', 'Rahel', 'Tewodros']
const animals = ['Lion', 'Eagle', 'Leopard', 'Crane', 'Ibex', 'Fox', 'Wolf', 'Dove', 'Falcon', 'Lynx']

function generateAlias(): string {
  const name = amharicNames[Math.floor(Math.random() * amharicNames.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const num = Math.floor(Math.random() * 100)
  return `${name}-${animal}-${num}`
}

export default function RegisterPage() {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [alias, setAlias] = useState(generateAlias())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please enter an email and password')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { alias, language_pref: selectedLanguage } },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md px-6 md:px-12 py-6 flex justify-between items-center border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-serif font-bold text-2xl text-primary">SafeGround</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant font-semibold text-sm px-4 py-2 hover:text-primary transition-colors">
            English
          </button>
          <button className="bg-error text-on-error font-semibold px-6 py-2 rounded-full hover:opacity-90 transition-all active:scale-95">
            PANIC
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 md:px-12 py-12">
        <div className="max-w-2xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h1 className="heading-hero">Your healing journey starts <span className="text-primary italic">privately.</span></h1>
            <p className="body-lg">No names, no phone numbers. Just a safe space for you to be yourself.</p>
          </div>

          <div className="card p-8 md:p-12 space-y-10 parchment-glow">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <section className="space-y-4">
              <label className="label-caps block">Email (for login)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary bg-surface-container-lowest"
                placeholder="your@email.com"
                required
              />
            </section>

            <section className="space-y-4">
              <label className="label-caps block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary bg-surface-container-lowest"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </section>

            <section className="space-y-4">
              <label className="label-caps block">Choose Your Language</label>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`chip ${selectedLanguage === lang.code ? 'chip-active' : 'chip-inactive'}`}
                  >
                    {lang.name} {lang.script && `(${lang.script})`}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="label-caps block">Your Anonymous Alias</label>
                <span className="text-on-surface-variant text-xs italic">Generated just for you</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow w-full bg-surface-container-low rounded-lg p-6 text-center md:text-left border-2 border-outline-variant">
                  <span className="font-serif text-2xl font-bold text-primary tracking-wide">{alias}</span>
                </div>
                <button
                  onClick={() => setAlias(generateAlias())}
                  className="w-full md:w-auto bg-surface-container-highest text-on-surface p-4 rounded-lg hover:bg-outline-variant/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="md:hidden font-semibold text-sm">New Alias</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant/70 text-center md:text-left">
                This name will be your identity within the community. You can change this later.
              </p>
            </section>

            <section className="bg-surface-container-low/50 rounded-lg p-6 border-l-4 border-secondary flex gap-6 items-start">
              <div className="bg-secondary-container p-3 rounded-full text-on-secondary-container shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="heading-md text-lg text-on-surface">The Seal of Trust</h3>
                <p className="body-md text-on-surface-variant">
                  Your data is stored locally on this device and encrypted with military-grade protocols. We never sell your data, and we don&apos;t even know who you are. Healing happens best when you are safe.
                </p>
              </div>
            </section>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
            <Link href="/login" className="text-on-surface-variant hover:text-primary font-semibold flex items-center gap-2 transition-colors">
              ← Already have an account? Sign In
            </Link>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full md:w-auto btn-primary flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account & Begin Recovery'}
              <span>→</span>
            </button>
          </div>
        </div>
      </main>

      <section className="bg-surface-container-highest py-12 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant mx-auto">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-on-surface">Local Encryption</span>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant mx-auto">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-on-surface">Zero-Log Policy</span>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant mx-auto">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-on-surface">Private Keys</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
