"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { getDashboardData, type DashboardData } from "@/lib/dashboard"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { GoalsSection } from "@/components/dashboard/GoalsSection"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"

export default function Home() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

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

  const customers = data.customers.total
  const visits = data.visits.thisMonth

  return (
    <div className="space-y-10 pb-10">
      
      {/* 1. Header with Intelligence */}
      <DashboardHeader 
        nickname={data.profile?.nickname} 
        email={user?.email}
        stats={{
          hasCustomers: customers.current > 0,
          hasVisitsRecent: visits.current > 0,
          newCustomersThisWeek: data.customers.recent.length // Rough proxy for "this week" context just for the greeting
        }}
      />

      {/* 2. KPI Row with State Machine */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Customers"
          value={customers.current}
          previousValue={customers.previous}
          trendPercent={customers.trendPercent}
          emptyLabel="Start by creating your first customer"
          emptyAction="Add Customer"
        />
        
        <KpiCard 
          title="Visits This Month"
          value={visits.current}
          previousValue={visits.previous}
          trendPercent={visits.trendPercent}
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
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             value={data.customers.recent.filter((c: any) => (c.intent_level || 0) >= 4).length} // Rough proxy
             previousValue={0} // No trend yet
             trendPercent={null}
             emptyLabel="No high intent leads yet"
        />
      </div>

      {/* 3. Goals Progress */}
      <GoalsSection 
        stats={{
            customers: Math.max(0, customers.current - (customers.previous || 0)), // Net new this month
            visits: visits.current
        }}
      />

      {/* 4. Activity Feed Timeline */}
      <ActivityFeed activities={data.activity} />

    </div>
  )
}
