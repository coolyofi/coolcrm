"use client"

import Link from "next/link"

interface GoalsSectionProps {
  stats: {
    customers: number
    visits: number
  }
}

// Mock goals (In a real app, these would come from settings table)
const GOALS = {
  customerTarget: 20, // Monthly target
  visitTarget: 50
}

export function GoalsSection({ stats }: GoalsSectionProps) {
    const customerProgress = Math.min(100, (stats.customers / GOALS.customerTarget) * 100)
    const visitProgress = Math.min(100, (stats.visits / GOALS.visitTarget) * 100)

    const hasSetGoals = true // Mock state: if false, show CTA

    if (!hasSetGoals) {
        return (
            <div className="glass-strong p-6 rounded-2xl flex items-center justify-between">
                <div>
                     <h3 className="font-semibold text-[var(--fg)]">Set Monthly Goals</h3>
                     <p className="text-sm text-[var(--fg-muted)]">Track your progress and stay motivated.</p>
                </div>
                <button className="px-4 py-2 bg-[var(--surface-solid)] border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--bg-elevated)] transition-colors">
                    Set Goals
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
                         <span className="text-xs uppercase tracking-wider text-[var(--fg-muted)] font-semibold">Monthly Customer Goal</span>
                         <div className="text-2xl font-bold mt-1 text-[var(--fg)]">
                            {stats.customers} <span className="text-base font-medium text-[var(--fg-muted)]">/ {GOALS.customerTarget}</span>
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
                         <span className="text-xs uppercase tracking-wider text-[var(--fg-muted)] font-semibold">Monthly Visit Goal</span>
                         <div className="text-2xl font-bold mt-1 text-[var(--fg)]">
                            {stats.visits} <span className="text-base font-medium text-[var(--fg-muted)]">/ {GOALS.visitTarget}</span>
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
