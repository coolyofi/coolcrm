"use client"

import React from "react"
import Link from "next/link"

interface KpiCardProps {
  title: string
  value: number
  previousValue: number | null // null means no previous data
  trendPercent: number | null
  emptyLabel?: string
  emptyAction?: string
  emptyHref?: string
  formatValue?: (v: number) => string
  showStorytelling?: boolean
}

export function KpiCard({
  title,
  value,
  previousValue,
  trendPercent,
  emptyLabel = "Start adding data",
  emptyAction = "Add Now",
  emptyHref = "/add",
  formatValue = (v) => v.toString(),
  showStorytelling = true
}: KpiCardProps) {

    // Memoize storytelling calculation
    const storytelling = React.useMemo(() => {
      if (trendPercent === null || previousValue === null) return null

      const percent = Math.abs(trendPercent)
      const isPositive = trendPercent > 0
      const isSignificant = percent >= 10

      if (isPositive && isSignificant) {
        if (percent >= 50) return "🚀 Wow, massive growth!"
        if (percent >= 25) return "📈 Strong upward trend"
        return "📊 Steady improvement"
      }
      if (!isPositive && isSignificant) {
        if (percent >= 25) return "📉 Let's turn this around"
        return "📊 Slight dip, keep pushing"
      }
      return "📊 Holding steady"
    }, [trendPercent, previousValue])

    // Status: EMPTY
    // Logic: If value is 0 (or specifically "no data" but we simplify to 0 for now)
    if (value === 0 && (previousValue === 0 || previousValue === null)) {
        return (
            <div className="glass-strong p-6 flex flex-col justify-between h-[160px] relative overflow-hidden group">
                <div className="text-sm font-semibold text-[var(--fg-muted)] tracking-wide uppercase">
                    {title}
                </div>
                
                <div className="flex flex-col gap-3 items-start z-10">
                    <span className="text-4xl font-bold text-[var(--fg-muted)]/30">—</span>
                    
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-[var(--fg-muted)]">{emptyLabel}</span>
                        <Link href={emptyHref} className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1">
                             {emptyAction} 
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>

                {/* Subtle Background Pattern for Empty State */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--primary)]/10 transition-colors" />
            </div>
        )
    }

    // Status: HAS DATA (Partial or Full)
    const isPositive = (trendPercent || 0) > 0
    const isNeutral = trendPercent === 0
    const trendColor = isPositive ? "text-emerald-500" : isNeutral ? "text-[var(--fg-muted)]" : "text-amber-500"
    const TrendIcon = isPositive 
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> // Up
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /> // Down (or handle neutral)

    const finalStorytelling = showStorytelling ? storytelling : null

    return (
        <div className="glass-strong p-6 flex flex-col justify-between h-[160px]">
            <div className="text-sm font-semibold text-[var(--fg-muted)] tracking-wide uppercase">
                {title}
            </div>
            
            <div className="flex flex-col gap-1">
                <span className="text-4xl font-bold text-[var(--fg)] tracking-tight">
                    {formatValue(value)}
                </span>
                
                {/* Comparison Logic */}
                {trendPercent !== null && previousValue !== 0 ? (
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${trendColor}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isNeutral 
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                : TrendIcon
                            }
                        </svg>
                        <span>
                            {Math.abs(trendPercent).toFixed(0)}%
                        </span>
                        <span className="text-[var(--fg-muted)] font-normal ml-0.5">
                            vs last month
                        </span>
                    </div>
                ) : (
                    <div className="text-sm text-[var(--fg-muted)] font-normal">
                        No previous month data yet
                    </div>
                )}

                {/* Storytelling */}
                {finalStorytelling && (
                    <div className="text-xs text-[var(--fg-muted)] font-medium mt-1">
                        {finalStorytelling}
                    </div>
                )}
            </div>
        </div>
    )
}
