'use client'

import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type Column<T> = {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
  sortable?: boolean
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyState,
  className = '',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return emptyState ? <>{emptyState}</> : null
  }

  return (
    <div className={`rounded-xl border border-[#e5e0db] overflow-hidden ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#fdf6ed] border-b border-[#e5e0db]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-xs font-semibold uppercase tracking-wider text-[#6f5b4e] px-4 py-3 ${
                    col.sortable ? 'cursor-pointer hover:text-[#92400E] select-none' : ''
                  } ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && <ChevronDown className="w-3 h-3" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e0db]">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`bg-white transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[#fdf6ed]' : 'hover:bg-[#fafafa]'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-[#2c241f] ${col.className || ''}`}>
                    {col.render ? col.render(item) : (item[col.key] as ReactNode) ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
