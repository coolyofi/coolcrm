"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Typography } from "@/components/ui/Typography"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  variant?: "default" | "card" | "inline"
  size?: "sm" | "md" | "lg"
}

const defaultIcons = {
  customers: (
    <svg className="w-12 h-12 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  visits: (
    <svg className="w-12 h-12 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  data: (
    <svg className="w-12 h-12 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  search: (
    <svg className="w-12 h-12 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  size = "md"
}: EmptyStateProps) {
  const sizeClasses = {
    sm: "py-8",
    md: "py-12",
    lg: "py-20"
  }

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }

  const content = (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${sizeClasses[size]}`}>
      <div className={`bg-[var(--glass-bg)] rounded-full flex items-center justify-center mb-6 ring-1 ring-[var(--border)] ${iconSizes[size]}`}>
        {icon || defaultIcons.data}
      </div>

      <Typography variant="h3" className="mb-2">
        {title}
      </Typography>

      {description && (
        <Typography variant="muted" className="max-w-sm mb-8">
          {description}
        </Typography>
      )}

      {action && (
        <div className="flex gap-3">
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  if (variant === "card") {
    return (
      <Card>
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    )
  }

  if (variant === "inline") {
    return (
      <div className="text-center py-8 text-[var(--fg-muted)]">
        {content}
      </div>
    )
  }

  return content
}