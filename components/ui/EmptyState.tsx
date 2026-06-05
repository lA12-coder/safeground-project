import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-6 text-center ${className}`}>
      <div className="mb-4 text-[#9a8a7d]">
        {icon || <Inbox className="w-16 h-16 opacity-40" />}
      </div>
      <h3 className="text-base font-semibold text-[#2c241f] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#6f5b4e] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
