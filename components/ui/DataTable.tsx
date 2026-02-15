"use client"

import React from "react"
import { EmptyState } from "./EmptyState"

interface Header { label: string }

interface DataTableProps {
  id?: string
  headers: Header[]
  data: Array<Array<React.ReactNode>>
  loading?: boolean
  minHeight?: string
  rowStyle?: "zebra" | "border"
  className?: string
  emptyState?: {
    title: string
    description?: string
    action?: {
      label: string
      href?: string
      onClick?: () => void
    }
  }
}

export default function DataTable({
  id,
  headers,
  data,
  loading = false,
  minHeight = "150px",
  rowStyle = "zebra",
  className = "",
  emptyState
}: DataTableProps) {
  if (loading) {
    return (
      <div id={id} className={`ui-table-loading ${className}`} style={{ minHeight }}>
        <div className="p-4">
          <div className="h-4 bg-[var(--surface-solid)] rounded w-1/3 mb-4 animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 mb-3">
              <div className="h-8 bg-[var(--surface-solid)] rounded col-span-1 animate-pulse" />
              <div className="h-8 bg-[var(--surface-solid)] rounded col-span-1 animate-pulse" />
              <div className="h-8 bg-[var(--surface-solid)] rounded col-span-1 animate-pulse" />
              <div className="h-8 bg-[var(--surface-solid)] rounded col-span-1 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    if (emptyState) {
      return (
        <div id={id} className={className} style={{ minHeight }}>
          <EmptyState
            variant="inline"
            size="sm"
            title={emptyState.title}
            description={emptyState.description}
            action={emptyState.action}
          />
        </div>
      )
    }
    return (
      <div id={id} className={className} style={{ minHeight }}>
        <EmptyState
          variant="inline"
          size="sm"
          title="暂无数据"
          description="这里还没有任何数据"
        />
      </div>
    )
  }

  const tableClass = `ui-table w-full ${rowStyle === "border" ? "ui-table-bordered" : "ui-table-zebra"} ${className}`

  return (
    <div id={id} className="overflow-x-auto">
      <table className={tableClass}>
        <thead className="bg-[var(--surface-solid)]">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {data.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[var(--surface-solid)] transition-all duration-200">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm text-[var(--fg)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
