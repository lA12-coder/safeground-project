'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, MapPin, AlertTriangle, BarChart3, Activity, Target, Flame } from 'lucide-react'

const userGrowth = [
  { month: 'Jan', count: 45 }, { month: 'Feb', count: 68 }, { month: 'Mar', count: 92 },
  { month: 'Apr', count: 110 }, { month: 'May', count: 145 }, { month: 'Jun', count: 182 },
  { month: 'Jul', count: 210 }, { month: 'Aug', count: 268 }, { month: 'Sep', count: 305 },
  { month: 'Oct', count: 342 }, { month: 'Nov', count: 389 }, { month: 'Dec', count: 420 },
]

const recoverySuccess = [
  { label: '30 Days', rate: 68 }, { label: '60 Days', rate: 52 }, { label: '90 Days', rate: 41 },
  { label: '6 Months', rate: 29 }, { label: '1 Year', rate: 18 },
]

const avgStreakDistribution = [
  { label: '0-7 days', value: 35 }, { label: '8-14 days', value: 25 },
  { label: '15-30 days', value: 20 }, { label: '31-60 days', value: 12 },
  { label: '60+ days', value: 8 },
]

const commonTriggers = [
  { trigger: 'Friends using khat', count: 87 },
  { trigger: 'Evening boredom', count: 72 },
  { trigger: 'Exam stress', count: 65 },
  { trigger: 'Social pressure', count: 58 },
  { trigger: 'Financial stress', count: 44 },
  { trigger: 'Family conflict', count: 38 },
  { trigger: 'Morning routine', count: 31 },
  { trigger: 'Workplace availability', count: 27 },
  { trigger: 'Post-meal craving', count: 22 },
  { trigger: 'Habitual tea time', count: 18 },
]

const activeRegions = [
  { region: 'Addis Ababa', count: 156 },
  { region: 'Oromia', count: 112 },
  { region: 'Amhara', count: 89 },
  { region: 'Sidama', count: 54 },
  { region: 'SNNPR', count: 48 },
  { region: 'Dire Dawa', count: 35 },
  { region: 'Tigray', count: 28 },
  { region: 'Harari', count: 12 },
]

const statCards = [
  { label: 'Total Users', value: '420', change: '+22%', icon: Users, color: 'bg-blue-100 text-blue-700', border: 'border-l-blue-500' },
  { label: 'Avg Streak', value: '14.3d', change: '+8%', icon: Flame, color: 'bg-amber-100 text-amber-700', border: 'border-l-amber-500' },
  { label: 'Success Rate (30d)', value: '68%', change: '+5%', icon: Target, color: 'bg-green-100 text-green-700', border: 'border-l-green-500' },
  { label: 'Active Regions', value: '8', change: 'Stable', icon: MapPin, color: 'bg-purple-100 text-purple-700', border: 'border-l-purple-500' },
]

const maxGrowth = Math.max(...userGrowth.map(d => d.count))
const maxSuccess = Math.max(...recoverySuccess.map(d => d.rate))
const maxStreak = Math.max(...avgStreakDistribution.map(d => d.value))
const maxTrigger = Math.max(...commonTriggers.map(d => d.count))
const maxRegion = Math.max(...activeRegions.map(d => d.count))

function SimpleLineChart({ data, height = 32 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.value / max) * 100,
    value: d.value,
    label: d.label,
  }))
  return (
    <div className="relative" style={{ height: `${height * 4}px` }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#92400E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          className="opacity-30"
        />
        <polyline
          fill="none"
          stroke="#92400E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          className="opacity-80"
        />
      </svg>
      <div className="flex justify-between mt-1">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map(d => (
          <span key={d.label} className="text-[9px] text-on-surface-variant">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

function SimpleBarChart({ data, color = 'bg-secondary', height = 28 }: { data: { label: string; value: number; sub?: string }[]; color?: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2">
      {data.map(d => {
        const pct = (d.value / max) * 100
        return (
          <div key={d.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-on-surface font-medium">{d.label}</span>
              <span className="text-on-surface-variant">{d.value}{d.sub || ''}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                className={`h-full rounded-full ${color} transition-all`}
                style={{ transitionDuration: '0.8s' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RankedBarChart({ data, color = 'bg-primary', max }: { data: { label: string; count: number }[]; color?: string; max: number }) {
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-6 text-xs font-bold text-on-surface-variant text-right">{i + 1}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-on-surface">{d.label}</span>
              <span className="text-on-surface-variant">{d.count}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(d.count / max) * 100}%` }}
                className={`h-full rounded-full ${color}`}
                style={{ transitionDuration: '0.8s' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, className = '' }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-5 ${className}`}>
      <h3 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-4 flex items-center gap-2">
        <Icon size={14} /> {title}
      </h3>
      {children}
    </motion.div>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary">Analytics Center</h1>
        <p className="text-on-surface-variant mt-1">Platform-wide recovery metrics and insights</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
            className={`bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 ${s.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
                <p className="text-2xl font-bold text-on-surface">{s.value}</p>
                <p className="text-xs text-secondary font-semibold">{s.change}</p>
              </div>
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon size={20} /></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="User Growth (2026)" icon={TrendingUp}>
          <SimpleLineChart data={userGrowth.map(d => ({ label: d.month, value: d.count }))} height={28} />
          <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant">
            <TrendingUp size={14} className="text-secondary" />
            <span>Total: 420 users &middot; <strong className="text-secondary">+22%</strong> from last year</span>
          </div>
        </SectionCard>

        <SectionCard title="Recovery Success Rate" icon={Target}>
          <SimpleBarChart data={recoverySuccess.map(d => ({ label: d.label, value: d.rate, sub: '%' }))} color="bg-secondary" />
          <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant">
            <Activity size={14} className="text-primary" />
            <span>68% reach 30 days &middot; 18% sustain 1 year</span>
          </div>
        </SectionCard>

        <SectionCard title="Average Streak Distribution" icon={Award}>
          <SimpleBarChart data={avgStreakDistribution.map(d => ({ label: d.label, value: d.value, sub: '%' }))} color="bg-amber-500" />
          <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant">
            <Flame size={14} className="text-amber-700" />
            <span>Average: <strong className="text-on-surface">14.3 days</strong> &middot; Longest: 187 days</span>
          </div>
        </SectionCard>

        <SectionCard title="Most Common Triggers" icon={AlertTriangle}>
          <RankedBarChart data={commonTriggers.map(t => ({ label: t.trigger, count: t.count }))} color="bg-error" max={maxTrigger} />
        </SectionCard>

        <SectionCard title="Most Active Regions" icon={MapPin} className="md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <RankedBarChart data={activeRegions.map(r => ({ label: r.region, count: r.count }))} color="bg-primary" max={maxRegion} />
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs text-on-surface-variant mb-4">
                  <MapPin size={14} /> Regional Distribution
                </div>
                <div className="relative w-48 h-48 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {activeRegions.slice(0, 5).map((r, i) => {
                      const total = activeRegions.slice(0, 5).reduce((a, b) => a + b.count, 0)
                      const pct = r.count / total
                      const startAngle = activeRegions.slice(0, i).reduce((a, b) => a + b.count / total, 0) * 360
                      const endAngle = startAngle + pct * 360
                      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                      const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                      const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)
                      const largeArc = pct > 0.5 ? 1 : 0
                      const colors = ['#92400E', '#166534', '#B91C1C', '#A23917', '#64748B']
                      return (
                        <path key={r.region}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[i]} opacity="0.8" />
                      )
                    })}
                    <circle cx="50" cy="50" r="20" fill="#FAFAF9" />
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
                      fill="#1c1917" fontSize="10" fontWeight="bold">420</text>
                  </svg>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {activeRegions.slice(0, 5).map((r, i) => {
                    const colors = ['bg-[#92400E]', 'bg-[#166534]', 'bg-[#B91C1C]', 'bg-[#A23917]', 'bg-[#64748B]']
                    return (
                      <div key={r.region} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${colors[i]}`} />
                        <span className="text-[10px] text-on-surface-variant">{r.region}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  )
}
