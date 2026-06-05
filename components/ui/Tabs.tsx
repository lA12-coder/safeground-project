'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Tab = {
  id: string
  label: string
  icon?: ReactNode
  count?: number
}

type TabsProps = {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 border-b border-[#e5e0db] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'text-[#92400E]' : 'text-[#6f5b4e] hover:text-[#92400E]'
            }`}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
            {tab.count != null && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-[#92400E]/10 text-[#92400E]' : 'bg-[#f6f5f1] text-[#6f5b4e]'
              }`}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#92400E]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
