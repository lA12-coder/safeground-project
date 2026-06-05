type SkeletonProps = {
  className?: string
  variant?: 'text' | 'circle' | 'rect' | 'card'
  width?: string
  height?: string
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const base = 'animate-pulse bg-gradient-to-r from-[#f6f5f1] via-[#efe9e2] to-[#f6f5f1] bg-[length:200%_100%]'

  const variants = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
    card: 'rounded-xl border border-[#e5e0db]',
  }

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-[#e5e0db] rounded-xl p-5 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <Skeleton width="40%" height="14px" />
        <Skeleton width="24px" height="24px" variant="circle" />
      </div>
      <Skeleton width="60%" height="32px" />
      <Skeleton width="30%" height="12px" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white border border-[#e5e0db] rounded-xl p-5 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <Skeleton width="30%" height="16px" />
        <Skeleton width="80px" height="24px" variant="rect" />
      </div>
      <Skeleton width="100%" height="220px" variant="rect" />
    </div>
  )
}
