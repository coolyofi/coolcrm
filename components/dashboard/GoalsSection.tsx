"use client"

import { useState, useEffect } from "react"

interface GoalsSectionProps {
  stats: {
    customers: number
    visits: number
  }
}

export function GoalsSection({ stats }: GoalsSectionProps) {
    const [goals, setGoals] = useState({ customerTarget: 20, visitTarget: 50 })

    useEffect(() => {
        const saved = localStorage.getItem('user_goals')
        if (saved) {
            try {
                setGoals(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse goals", e)
            }
        }
    }, [])

    const customerProgress = Math.min(100, (stats.customers / goals.customerTarget) * 100)
    const visitProgress = Math.min(100, (stats.visits / goals.visitTarget) * 100)

    const hasSetGoals = true // Mock state: if false, show CTA

    if (!hasSetGoals) {
        return (
            <div className="glass-strong p-6 rounded-2xl flex items-center justify-between">
                <div>
                     <h3 className="font-semibold text-[var(--fg)]">设置月度目标</h3>
                     <p className="text-sm text-[var(--fg-muted)]">跟踪您的进度并保持动力。</p>
                </div>
                <button className="px-4 py-2 bg-[var(--surface-solid)] border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--bg-elevated)] transition-colors">
                    设置目标
                </button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Goal */}
            <div className="glass-strong p-5 rounded-2xl">
                 <div className="flex justify-between items-end mb-2">
                     <div>
                         <span className="text-xs uppercase tracking-wider text-[var(--fg-muted)] font-semibold">月度客户目标</span>
                         <div className="text-2xl font-bold mt-1 text-[var(--fg)]">
                            {stats.customers} <span className="text-base font-medium text-[var(--fg-muted)]">/ {goals.customerTarget}</span>
                         </div>
                     </div>
                     <span className="text-sm font-medium text-[var(--primary)]">{Math.round(customerProgress)}%</span>
                 </div>
                 {/* Progress Bar */}
                 <div className="h-2 w-full bg-[var(--surface-solid)] rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${customerProgress}%` }}
                     />
                 </div>
            </div>

            {/* Visits Goal */}
             <div className="glass-strong p-5 rounded-2xl">
                 <div className="flex justify-between items-end mb-2">
                     <div>
                         <span className="text-xs uppercase tracking-wider text-[var(--fg-muted)] font-semibold">月度访问目标</span>
                         <div className="text-2xl font-bold mt-1 text-[var(--fg)]">
                            {stats.visits} <span className="text-base font-medium text-[var(--fg-muted)]">/ {goals.visitTarget}</span>
                         </div>
                     </div>
                     <span className="text-sm font-medium text-emerald-500">{Math.round(visitProgress)}%</span>
                 </div>
                 {/* Progress Bar */}
                 <div className="h-2 w-full bg-[var(--surface-solid)] rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${visitProgress}%` }}
                     />
                 </div>
            </div>
        </div>
    )
}
