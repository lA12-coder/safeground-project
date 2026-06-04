'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const demoAccounts = [
  { label: 'Admin', email: 'admin@gmail.com', password: 'SafeGroundAdmin123!', redirect: '/admin' },
  { label: 'Student', email: 'demo.student@safeground.test', password: 'SafeGroundStudent123!', redirect: '/dashboard' },
  { label: 'Provider', email: 'provider@safeground.test', password: 'SafeGroundProvider123!', redirect: '/provider/dashboard' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signIn(targetEmail = email, targetPassword = password, redirectTo?: string) {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    })

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials') && redirectTo) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, password: targetPassword, alias: targetEmail.split('@')[0] }),
        })
        if (res.ok) {
          setLoading(false)
          router.push(redirectTo)
          router.refresh()
          return
        }
      }
      setLoading(false)
      setError(signInError.message)
      return
    }

    setLoading(false)

    if (redirectTo) {
      router.push(redirectTo)
      router.refresh()
      return
    }

    const adminEmails = ['admin@gmail.com', 'superadmin@gmail.com']
    if (adminEmails.includes(targetEmail.trim().toLowerCase())) router.push('/admin')
    else if (targetEmail.includes('provider')) router.push('/provider/dashboard')
    else router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-outline-variant bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <h1 className="font-serif text-3xl font-bold text-primary">SafeGround</h1>
            </div>
            <h2 className="text-xl font-semibold text-on-surface">Sign In</h2>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              void signIn()
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary"
                placeholder="your@email.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary"
                placeholder="Password"
                required
              />
            </label>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-container disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-7 space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Demo Accounts
            </p>
            <div className="grid gap-2">
              {demoAccounts.map(account => (
                <button
                  key={account.email}
                  onClick={() => void signIn(account.email, account.password, account.redirect)}
                  disabled={loading}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-container-low disabled:opacity-60"
                >
                  Continue as {account.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-on-surface-variant">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Register here
              </Link>
            </p>
            <Link href="/guest" className="text-sm text-on-surface-variant hover:text-primary">
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
