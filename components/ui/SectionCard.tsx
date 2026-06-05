import type { ReactNode } from 'react'

type SectionCardProps = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function SectionCard({ title, subtitle, actions, children, className = '', padding = 'md' }: SectionCardProps) {
  return (
    <div className={`bg-white border border-[#e5e0db] rounded-xl shadow-sm ${paddingMap[padding]} ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-[#2c241f]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#6f5b4e] mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
