"use client"

import { useScrollProgress } from "../hooks/useScrollProgress"
import { UI_CONTRACT, calculateTitleSize } from "./navigation/constants"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const { p } = useScrollProgress("content-scroll", UI_CONTRACT.PAGE_HEADER_SCROLL_DISTANCE)

  const titleSize = calculateTitleSize(p)
  const subtitleOpacity = 1 - p

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in" style={{ height: `${UI_CONTRACT.TOPBAR_HEIGHT_PX}px`, paddingTop: '16px' }}>
      <div>
        <h1
          className="font-bold tracking-tight text-[var(--fg)] transition-all duration-200"
          style={{ fontSize: `${titleSize}px` }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-[var(--fg-muted)] mt-2 text-lg transition-opacity duration-200"
            style={{ opacity: subtitleOpacity }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}