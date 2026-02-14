"use client"

import { useScrollProgress } from "../hooks/useScrollProgress"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const { p } = useScrollProgress("content-scroll", 56)

  const titleSize = 34 - (34 - 17) * p
  const subtitleOpacity = 1 - p

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in" style={{ height: '72px', paddingTop: '16px' }}>
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