"use client"

import Link from "next/link"

interface ActivityItem {
  id: string
  type: 'visit' | 'customer'
  title: string
  subtitle: string
  date: string
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
        <div className="glass-strong p-6 rounded-2xl flex flex-col items-center justify-center py-12 text-center text-[var(--fg-muted)]">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-solid)] flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="font-medium">No recent activity</p>
            <p className="text-sm opacity-80 mt-1">Actions you take will appear here timeline.</p>
        </div>
    )
  }

  // Group by day? For simplicty v1, just list them. v2 can group "Today", "Yesterday".
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--fg)]">Recent Activity</h2>
          <Link href="/history" className="text-sm font-medium text-[var(--primary)] hover:opacity-80">View All</Link>
      </div>

      <div className="glass-strong rounded-2xl overflow-hidden">
        {activities.map((item, i) => (
          <div 
            key={item.id} 
            className={`
                p-4 flex items-center gap-4 hover:bg-[var(--surface-solid)]/50 transition-colors
                ${i !== activities.length - 1 ? 'border-b border-[var(--border)]' : ''}
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
                 {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
