"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { getDashboardData, type DashboardData } from "@/lib/dashboard-optimized"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { GoalsSection } from "@/components/dashboard/GoalsSection"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { PerformanceMonitor } from "@/components/PerformanceMonitor"

export default function Home() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [kpiCollapsed, setKpiCollapsed] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const dashboardData = await getDashboardData(user.id)
        setData(dashboardData)
      } catch (e) {
        console.error("Failed to load dashboard", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Fallback if data failed significantly, though getDashboardData handles nulls
  if (!data) return null

  // Safe access with null coalescing for KPI data
  const customers = data.customers?.total || { current: 0, previous: 0, trendPercent: null }
  const visits = data.visits?.thisMonth || { current: 0, previous: 0, trendPercent: null }

  return (
    <PerformanceMonitor>
      <div className="space-y-10 pb-10">
      
      {/* 1. Header with Intelligence */}
      <DashboardHeader 
        nickname={data.profile?.nickname} 
        stats={{
          hasCustomers: customers.current > 0,
          hasVisitsRecent: visits.current > 0,
          newCustomersThisWeek: data.customers.recent.length // Rough proxy for "this week" context just for the greeting
        }}
      />

      {/* 2. KPI Row with State Machine */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--fg)] tracking-tight">Key Metrics</h2>
          <button
            onClick={() => setKpiCollapsed(!kpiCollapsed)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-lg hover:bg-[var(--surface-solid)]/50"
          >
            <span>{kpiCollapsed ? 'Show' : 'Hide'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${kpiCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className={`
          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${kpiCollapsed ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[200px]'}
        `}>
          <KpiCard 
            title="Total Customers"
            value={customers?.current || 0}
            previousValue={customers?.previous || 0}
            trendPercent={customers?.trendPercent || null}
            emptyLabel="Start by creating your first customer"
            emptyAction="Add Customer"
          />
          
          <KpiCard 
            title="Visits This Month"
            value={visits?.current || 0}
            previousValue={visits?.previous || 0}
            trendPercent={visits?.trendPercent || null}
            emptyLabel="Log a visit to track activity"
            emptyAction="Log Visit"
            // In real app, log visit might open a modal or go to visits page
            emptyHref="/visits" 
          />

          {/* Placeholder KPIs for completeness as per designs often have 3-4 cards (Conversion, etc) */}
          {/* We can use dummy for now or logic similar to above */}
          <KpiCard 
               title="Conversion Rate"
               value={0}
               previousValue={null}
               trendPercent={null}
               formatValue={(v) => `${v}%`}
               emptyLabel="Track deals to see conversion"
          />

          {/* Quick Goal Glance (Mini) or just another metric */}
           <KpiCard 
               title="High Intent"
               value={(data.customers?.recent || []).filter((c) => (c.intent_level || 0) >= 4).length} // Safe access with default array
               previousValue={0} // No trend yet
               trendPercent={null}
               emptyLabel="No high intent leads yet"
          />
        </div>
      </div>

      {/* 3. Goals Progress */}
      <GoalsSection 
        stats={{
            customers: Math.max(0, (customers?.current || 0) - (customers?.previous || 0)), // Safe calculation with defaults
            visits: visits?.current || 0
        }}
      />

      {/* 4. Activity Feed Timeline */}
      <ActivityFeed activities={data.activity || []} />

      </div>
    </PerformanceMonitor>
  )
}
