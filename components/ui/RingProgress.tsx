'use client'

import { motion } from 'framer-motion'

type RingProgressProps = {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function RingProgress({ value, size = 120, strokeWidth = 8, label, className = '' }: RingProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedValue = Math.min(Math.max(value, 0), 100)
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f6f5f1"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#92400E"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-mono font-bold text-[#2c241f] tabular-nums">{clampedValue}%</span>
        {label && <span className="text-[10px] text-[#6f5b4e] mt-0.5">{label}</span>}
      </div>
    </div>
  )
}
