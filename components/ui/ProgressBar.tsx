'use client'

import { motion } from 'framer-motion'

type ProgressBarProps = {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'amber' | 'green' | 'blue' | 'red'
  showLabel?: boolean
  className?: string
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
const colorMap = {
  amber: 'bg-[#92400E]',
  green: 'bg-[#16a34a]',
  blue: 'bg-[#2563eb]',
  red: 'bg-[#dc2626]',
}

export function ProgressBar({ value, max = 100, size = 'md', color = 'amber', showLabel = false, className = '' }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-[#6f5b4e]">{value}/{max}</span>
          <span className="text-xs font-semibold text-[#2c241f]">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-[#f6f5f1] rounded-full overflow-hidden ${sizeMap[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorMap[color]}`}
        />
      </div>
    </div>
  )
}
