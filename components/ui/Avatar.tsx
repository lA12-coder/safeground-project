'use client'

import { motion } from 'framer-motion'

type AvatarProps = {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  className?: string
  active?: boolean
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

function getInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getBgColor(name: string): string {
  const colors = [
    'bg-[#92400E]/10 text-[#92400E]',
    'bg-[#16a34a]/10 text-[#16a34a]',
    'bg-[#2563eb]/10 text-[#2563eb]',
    'bg-[#9333ea]/10 text-[#9333ea]',
    'bg-[#d97706]/10 text-[#d97706]',
    'bg-[#dc2626]/10 text-[#dc2626]',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ name, size = 'md', src, className = '', active }: AvatarProps) {
  if (src) {
    return (
      <div className={`relative ${sizeMap[size]} ${className}`}>
        <img
          src={src}
          alt={name}
          className={`rounded-full object-cover w-full h-full ${active ? 'ring-2 ring-[#16a34a] ring-offset-2' : ''}`}
        />
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative rounded-full flex items-center justify-center font-semibold ${sizeMap[size]} ${getBgColor(name)} ${active ? 'ring-2 ring-[#16a34a] ring-offset-2' : ''} ${className}`}
    >
      {getInitials(name)}
    </motion.div>
  )
}
