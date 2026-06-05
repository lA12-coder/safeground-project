'use client'

import { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  icon: ReactNode
  accent?: 'blue' | 'red' | 'amber' | 'green' | 'indigo'
}

const accentStyles: Record<string, { border: string; bg: string; icon: string }> = {
  blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', icon: 'text-blue-600' },
  red: { border: 'border-l-red-500', bg: 'bg-red-50', icon: 'text-red-600' },
  amber: { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: 'text-amber-600' },
  green: { border: 'border-l-green-500', bg: 'bg-green-50', icon: 'text-green-600' },
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-50', icon: 'text-indigo-600' },
}

export function MetricCard({ label, value, sub, icon, accent = 'blue' }: MetricCardProps) {
  const s = accentStyles[accent]
  return (
    <div className={`bg-white rounded-lg border border-[#e5e0db] border-l-4 ${s.border} shadow-sm p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#6f5b4e] uppercase tracking-wider">{label}</span>
        <div className={s.icon}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-[#2c241f]">{value}</div>
      {sub && <div className="text-xs text-[#6f5b4e] mt-0.5">{sub}</div>}
    </div>
  )
}
