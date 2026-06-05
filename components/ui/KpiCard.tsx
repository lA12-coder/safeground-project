'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

type KpiCardProps = {
  label: string
  value: string | number
  icon?: ReactNode
  delta?: { value: number; label?: string }
  accentColor?: 'amber' | 'green' | 'blue' | 'red' | 'purple'
  sparkline?: ReactNode
  subtitle?: string
}

const accentMap = {
  amber: 'border-l-[#92400E]',
  green: 'border-l-[#16a34a]',
  blue: 'border-l-[#2563eb]',
  red: 'border-l-[#dc2626]',
  purple: 'border-l-[#9333ea]',
}

export function KpiCard({ label, value, icon, delta, accentColor = 'amber', sparkline, subtitle }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-[#e5e0db] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 ${accentMap[accentColor]}`}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6f5b4e]">{label}</span>
        {icon && <span className="text-[#9a8a7d]">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-mono font-semibold text-[#2c241f] tracking-tight tabular-nums">{value}</span>
        {delta && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
            delta.value > 0 ? 'text-[#16a34a]' : delta.value < 0 ? 'text-[#dc2626]' : 'text-[#9a8a7d]'
          }`}>
            {delta.value > 0 ? <TrendingUp className="w-3 h-3" /> : delta.value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {delta.value > 0 ? '+' : ''}{delta.value}%
            {delta.label && <span className="text-[10px] text-[#9a8a7d] ml-0.5">{delta.label}</span>}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[#9a8a7d] mt-0.5">{subtitle}</p>}
      {sparkline && <div className="mt-2 h-6">{sparkline}</div>}
    </motion.div>
  )
}
