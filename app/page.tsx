"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { getDashboardData, type DashboardData } from "@/lib/dashboard-optimized"
import { isDemo } from '@/lib/demo'
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { GoalsSection } from "@/components/dashboard/GoalsSection"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { PerformanceMonitor } from "@/components/PerformanceMonitor"
import { Button } from "@/components/ui/Button"

export default function Home() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [kpiCollapsed, setKpiCollapsed] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) {
        if (isDemo()) {
          // Provide lightweight demo data for browsing
          const demoData: DashboardData = {
            profile: { nickname: '演示用户' },
            customers: {
              total: { current: 12, previous: 8, trendPercent: 50 },
              recent: [
                { id: 'demo-c1', company_name: '示例科技', intent_level: 4, created_at: new Date().toISOString() },
                { id: 'demo-c2', company_name: '示例零售', intent_level: 3, created_at: new Date().toISOString() }
              ] as any
            },
            visits: {
              thisMonth: { current: 5, previous: 2, trendPercent: 150 },
              recent: [
                { id: 'v1', visit_date: new Date().toISOString(), notes: 'Demo 访问记录', customers: [{ company_name: '示例科技' }] }
              ] as any
            },
            activity: [
              { id: 'a1', type: 'customer', title: '新增客户', subtitle: '示例科技', date: new Date().toISOString() }
            ]
          }
          setData(demoData)
          setLoading(false)
          return
        }
        return
      }

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
  const customers = data.customers?.total || { current: 0, previous: 0, trendPercent: 0 }
  const visits = data.visits?.thisMonth || { current: 0, previous: 0, trendPercent: 0 }

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
          <h2 className="text-2xl font-bold text-[var(--fg)] tracking-tight">关键指标</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setKpiCollapsed(!kpiCollapsed)}
          >
            <span>{kpiCollapsed ? '显示' : '隐藏'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${kpiCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>

        <div className={`
          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${kpiCollapsed ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[200px]'}
        `}>
          <KpiCard 
            title="总客户数"
            value={customers.current || 0}
            previousValue={customers.previous || 0}
            trendPercent={customers.trendPercent}
            emptyLabel="从创建您的第一个客户开始"
            emptyAction="添加客户"
          />
          
          <KpiCard 
            title="本月访问"
            value={visits.current || 0}
            previousValue={visits.previous || 0}
            trendPercent={visits.trendPercent}
            emptyLabel="记录访问以跟踪活动"
            emptyAction="记录访问"
            // In real app, log visit might open a modal or go to visits page
            emptyHref="/visits" 
          />

          {/* Placeholder KPIs for completeness as per designs often have 3-4 cards (Conversion, etc) */}
          {/* We can use dummy for now or logic similar to above */}
          <KpiCard 
               title="转化率"
               value={0}
               previousValue={null}
               trendPercent={0}
               formatValue={(v) => `${v}%`}
               emptyLabel="跟踪交易以查看转化"
          />

          {/* Quick Goal Glance (Mini) or just another metric */}
             <KpiCard 
               title="高意向"
               value={(data.customers.recent || []).filter((c) => (c.intent_level || 0) >= 4).length} // Safe access with default array
               previousValue={0} // No trend yet
               trendPercent={0}
               emptyLabel="还没有高意向线索"
            />
        </div>
      </div>

      {/* 3. Goals Progress */}
      <GoalsSection 
        stats={{
            customers: Math.max(0, (customers.current || 0) - (customers.previous || 0)), // Safe calculation with defaults
            visits: visits.current || 0
        }}
      />

      {/* 4. Activity Feed Timeline */}
      <ActivityFeed activities={data.activity || []} />

      </div>
    </PerformanceMonitor>
  )
}
