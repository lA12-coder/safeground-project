'use client'

import { useEffect, useState, use } from 'react'
import { Heart, Shield, Lock, Phone, ChevronLeft } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts'
import type { GuardianViewData } from '@/lib/types'

export default function GuardianViewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<GuardianViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [token])

  async function fetchData() {
    try {
      const res = await fetch(`/api/guardian/view/${token}`)
      if (!res.ok) { setError(true); return }
      setData(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function sendEncouragement(type: string) {
    setSending(type)
    try {
      await fetch('/api/guardian/encourage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message_type: type }),
      })
    } catch {}
    setTimeout(() => setSending(null), 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#92400E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md text-center">
          <Shield size={48} className="text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1c1917] mb-2">Link Not Active</h1>
          <p className="text-[#64748B]">This guardian link is no longer active or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <nav className="bg-white border-b border-[#d6d3d1] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronLeft size={20} className="text-gray-400" />
            <span className="text-xl font-bold text-[#92400E]">SafeGround</span>
          </div>
          <div className="flex items-center gap-4">
            <select className="text-sm border border-[#d6d3d1] rounded-lg px-3 py-1.5">
              <option>English</option>
              <option>አማርኛ</option>
            </select>
            <button className="px-4 py-1.5 bg-[#B91C1C] text-white rounded-full font-bold text-sm">PANIC</button>
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1c1917] mb-2">
            Supporting <span className="text-[#92400E]">{data.alias}</span>
          </h1>
          <p className="text-lg text-[#64748B] max-w-xl mx-auto">
            Your presence is their strength. Today, they are choosing recovery one step at a time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-[#d6d3d1] p-8 text-center">
            <p className="text-8xl font-bold text-[#92400E]">{data.current_streak}</p>
            <p className="text-lg text-[#64748B] mt-2">Days of Strength</p>
            <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-green-100 text-[#166534] rounded-full text-sm font-semibold">
              ✓ Safety Plan Active
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#d6d3d1] p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1c1917]">7-Day Mood Flow</h3>
              <span className="px-2 py-0.5 bg-green-100 text-[#166534] rounded-full text-xs font-semibold">
                {data.last_7_days_mood.some(d => d.mood > 5) ? 'IMPROVING' : 'STEADY'}
              </span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.last_7_days_mood}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#92400E"
                    strokeWidth={2}
                    dot={{ fill: '#92400E', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#64748B] text-center mt-2">
              High points indicate times of calm and connection.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#1c1917] text-center mb-6">
            Send Encouragement
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => sendEncouragement('encourage')}
              disabled={sending !== null}
              className="bg-pink-50 border border-pink-200 rounded-xl p-6 text-center hover:shadow-md transition-all disabled:opacity-50"
            >
              <p className="text-sm text-pink-800 italic mb-3">
                &ldquo;I am so proud of your progress today.&rdquo;
              </p>
              <span className="text-xs font-semibold text-pink-600">
                {sending === 'encourage' ? 'Sent!' : 'SEND TAP TO ENCOURAGE'}
              </span>
            </button>
            <button
              onClick={() => sendEncouragement('calm')}
              disabled={sending !== null}
              className="bg-green-50 border border-green-200 rounded-xl p-6 text-center hover:shadow-md transition-all disabled:opacity-50"
            >
              <p className="text-sm text-[#166534] italic mb-3">
                &ldquo;Take a deep breath. You are safe and loved.&rdquo;
              </p>
              <span className="text-xs font-semibold text-[#166534]">
                {sending === 'calm' ? 'Sent!' : 'SEND TAP TO CALM'}
              </span>
            </button>
            <button
              onClick={() => sendEncouragement('faith')}
              disabled={sending !== null}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center hover:shadow-md transition-all disabled:opacity-50"
            >
              <p className="text-sm text-yellow-800 italic mb-3">
                &ldquo;I am praying for your peace this evening.&rdquo;
              </p>
              <span className="text-xs font-semibold text-yellow-600">
                {sending === 'faith' ? 'Sent!' : 'SEND FAITH SUPPORT'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-[#d6d3d1] p-6">
            <h3 className="font-semibold text-[#1c1917] mb-3">Learning to Support</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-[#FAFAF9] rounded-lg hover:bg-stone-100 transition-colors">
                <p className="text-sm font-medium text-[#1c1917]">Understanding Khat Recovery</p>
                <p className="text-xs text-[#64748B]">5-min guide</p>
              </button>
              <button className="w-full text-left p-3 bg-[#FAFAF9] rounded-lg hover:bg-stone-100 transition-colors">
                <p className="text-sm font-medium text-[#1c1917]">Guardian Support Group</p>
                <p className="text-xs text-[#64748B]">Weekly sessions</p>
              </button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 flex items-center">
            <div>
              <p className="text-lg italic text-amber-900 mb-2">
                &ldquo;The greatest gift you can give is your quiet presence.&rdquo;
              </p>
              <div className="flex items-center gap-2 text-xs text-[#92400E]">
                <Heart size={14} />
                <span>Your support matters more than you know</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#d6d3d1] pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>© 2024 SafeGround</span>
              <span>Privacy Policy</span>
              <span>Terms</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#92400E] text-white rounded-full text-sm font-semibold hover:bg-[#78350F]">
                Emergency Support
              </button>
              <Shield size={16} className="text-gray-400" />
              <Lock size={16} className="text-gray-400" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
