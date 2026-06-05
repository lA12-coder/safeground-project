'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

type ErrorStateProps = {
  title?: string
  message?: string
  errorCode?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this data.',
  errorCode,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-6 text-center ${className}`}>
      <div className="mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-[#dc2626]" />
      </div>
      <h3 className="text-base font-semibold text-[#2c241f] mb-1">{title}</h3>
      <p className="text-sm text-[#6f5b4e] max-w-xs mb-4">{message}</p>
      {errorCode && (
        <p className="text-[10px] font-mono text-[#9a8a7d] mb-3">Error: {errorCode}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#92400E] text-white rounded-lg text-sm font-semibold hover:bg-[#a04e14] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  )
}
