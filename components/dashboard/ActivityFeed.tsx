"use client"

import React from "react"
import Link from "next/link"
import type { ActivityItem } from "../../lib/dashboard-optimized"

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  // Memoize grouped activities to avoid recalculation on every render
  const groupedActivities = React.useMemo(() => {
    return activities.reduce((groups, activity) => {
      const date = new Date(activity.date).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(activity)
      return groups
    }, {} as Record<string, ActivityItem[]>)
  }, [activities])

  // Memoize relative date labels
  const getRelativeDateLabel = React.useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "今天"
    if (date.toDateString() === yesterday.toDateString()) return "昨天"

    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) return `${diffDays}天前`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--fg)]">最近活动</h2>
          <Link href="/history" className="text-sm font-medium text-[var(--primary)] hover:opacity-80">查看全部</Link>
      </div>

      <div className="glass-strong overflow-hidden">
        {Object.entries(groupedActivities).map(([dateStr, dayActivities], groupIndex) => (
          <div key={dateStr}>
            {/* Date Header */}
            <div className="px-4 py-2 bg-[var(--surface-solid)]/30 border-b border-[var(--border)]">
              <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide">
                {getRelativeDateLabel(dateStr)}
              </span>
            </div>

            {/* Activities for this date */}
            {dayActivities.map((item, i) => (
              <div 
                key={item.id} 
                className={`
                    p-4 flex items-center gap-4 hover:bg-[var(--surface-solid)]/50 transition-colors
                    ${i !== dayActivities.length - 1 || groupIndex !== Object.keys(groupedActivities).length - 1 ? 'border-b border-[var(--border)]' : ''}
                `}
              >
                 {/* Icon */}
                 <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${item.type === 'customer' 
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'bg-indigo-500/10 text-indigo-500' // Visit
                    }
                 `}>
                    {item.type === 'customer' ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                 </div>

                 {/* Content */}
                 <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-[var(--fg)] truncate">{item.title}</p>
                     <p className="text-xs text-[var(--fg-muted)] truncate">{item.subtitle}</p>
                 </div>

                 {/* Time */}
                 <div className="text-xs text-[var(--fg-muted)] whitespace-nowrap">
                     {new Date(item.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                 </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
