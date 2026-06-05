'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User, Shield, Bell, Lock, ChevronRight, Globe, Target,
  Brain, Heart, ArrowLeft, AlertTriangle, Download, Trash2,
  Check, RotateCw, Copy,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SectionCard } from '@/components/ui/SectionCard'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [streak, setStreak] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [profileRes, streakRes] = await Promise.all([
          fetch('/api/auth/profile'),
          fetch('/api/habits/streak'),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data)
        }
        if (streakRes.ok) {
          const data = await streakRes.json()
          setStreak(data)
        }
      } catch (e) {
        console.error('Failed to load profile', e)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <DashboardShell pageTitle="Profile">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#e5e0db] rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-[#f6f5f1] rounded w-1/3 mb-4" />
              <div className="h-10 bg-[#f6f5f1] rounded w-2/3" />
            </div>
          ))}
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell pageTitle="Profile" breadcrumb="Settings">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.alias || 'User'} size="xl" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2c241f]">{profile?.alias || 'Anonymous User'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="success">Privacy Active</Badge>
              {streak && <Badge variant="amber">{streak.currentStreak ?? 0}d streak</Badge>}
            </div>
          </div>
        </div>

        <SectionCard title="User Information" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#e5e0db]/50">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#9a8a7d]" />
                <span className="text-sm text-[#6f5b4e]">Alias</span>
              </div>
              <span className="text-sm font-semibold text-[#2c241f]">{profile?.alias || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#e5e0db]/50">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#9a8a7d]" />
                <span className="text-sm text-[#6f5b4e]">Language</span>
              </div>
              <span className="text-sm font-semibold text-[#2c241f] capitalize">{profile?.language_pref || 'English'}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#9a8a7d]" />
                <span className="text-sm text-[#6f5b4e]">Account Type</span>
              </div>
              <Badge variant="info">Anonymous</Badge>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recovery Preferences" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#e5e0db]/50">
              <div className="flex items-center gap-3">
                <Brain className="w-4 h-4 text-[#9a8a7d]" />
                <span className="text-sm text-[#6f5b4e]">Support Type</span>
              </div>
              <Badge variant="amber">{profile?.support_preference || 'Not set'}</Badge>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#e5e0db]/50">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-[#9a8a7d]" />
                <span className="text-sm text-[#6f5b4e]">Current Goal</span>
              </div>
              <span className="text-sm font-semibold text-[#2c241f]">{streak?.goal ? `${streak.goal} days` : '—'}</span>
            </div>
            <div className="py-3">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-4 h-4 text-[#9a8a7d]" />
                <span className="text-sm text-[#6f5b4e]">Triggers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile?.trigger_tags || []).length > 0 ? (
                  profile.trigger_tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#fdf6ed] text-[#92400E] border border-[#e5d5c4]">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#9a8a7d]">No triggers configured</span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security & Privacy" padding="lg">
          <div className="space-y-2">
            <Link
              href="/settings/guardian"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-[#f6f5f1] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#92400E]" />
                <span className="text-sm font-medium text-[#2c241f]">Manage Guardian</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9a8a7d] group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#f6f5f1] transition-colors group">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-[#6f5b4e]" />
                <span className="text-sm font-medium text-[#2c241f]">Export My Data</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9a8a7d] group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors group">
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-[#dc2626]" />
                <span className="text-sm font-medium text-[#dc2626]">Delete Account</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#dc2626] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </SectionCard>

        <p className="text-[10px] text-[#9a8a7d] text-center">
          Your identity is protected. No personal data is stored.
        </p>
      </div>
    </DashboardShell>
  )
}
