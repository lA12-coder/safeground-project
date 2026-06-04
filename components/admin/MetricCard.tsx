'use client'

import { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  trend?: string
  trendColor?: string
  badge?: string
  badgeColor?: string
  borderColor?: string
  icon: ReactNode
}

export function MetricCard({
  label, value, trend, trendColor = 'text-[#166534]',
  badge, badgeColor = 'bg-red-50 text-[#B91C1C]',
  borderColor = 'border-[#d6d3d1]/30', icon,
}: MetricCardProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl border ${borderColor} shadow-sm p-6`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-on-surface-variant">{label}</span>
        <div className="text-on-surface-variant">{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-on-surface">{value}</span>
        {trend && <span className={`text-sm font-semibold ${trendColor}`}>{trend}</span>}
      </div>
      {badge && (
        <div className="flex items-center mt-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
        </div>
      )}
    </div>
  )
}
