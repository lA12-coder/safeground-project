import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  height?: number
  actions?: ReactNode
}

export function ChartCard({ title, subtitle, children, height = 300, actions }: ChartCardProps) {
  return (
    <div className="bg-white border border-[#e5e0db] rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#2c241f]">{title}</h3>
          {subtitle && <p className="text-xs text-[#6f5b4e] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  )
}
