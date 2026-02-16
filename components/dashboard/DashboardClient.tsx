"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import { getDashboardData } from "@/lib/dashboard-optimized"
import { type DashboardData } from "@/lib/schemas"
import { isDemo } from '@/lib/demo'
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { GoalsSection } from "@/components/dashboard/GoalsSection"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { PerformanceMonitor } from "@/components/PerformanceMonitor"
import { useTranslation } from '@/hooks/useTranslation'
import useSWR from "swr"

interface DashboardClientProps {
  initialData: DashboardData | null
  children?: React.ReactNode
}

export function DashboardClient({ initialData, children }: DashboardClientProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading } = useSWR(
    user ? ['dashboard', user.id] : (isDemo() ? 'dashboard-demo' : null),
    async () => {
      if (user) {
        return getDashboardData(user.id)
      }
      if (isDemo()) {
          return {
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
              { id: 'a1', type: 'customer', title: '添加客户', subtitle: '示例科技', date: new Date().toISOString() }
            ]
          } as DashboardData
      }
      return null
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false
    }
  )

  if (isLoading && !data) {
    // Return null on server and during initial hydration to avoid mismatch with Suspense
    if (!mounted) return null

    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const customers = data.customers?.total || { current: 0, previous: 0, trendPercent: 0 }
  const visits = data.visits?.thisMonth || { current: 0, previous: 0, trendPercent: 0 }

  return (
    <PerformanceMonitor>
      <div className="space-y-10 pb-10">
      
      <DashboardHeader 
        nickname={data.profile?.nickname} 
        stats={{
          hasCustomers: customers.current > 0,
          hasVisitsRecent: visits.current > 0,
          newCustomersThisWeek: data.customers.recent.length
        }}
      />

      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[var(--fg)] tracking-tight">业务快照</h2>
        </div>

        {children || (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <KpiCard 
              title={t("customer.totalCustomers")}
              value={customers.current || 0}
              previousValue={customers.previous || 0}
              trendPercent={customers.trendPercent}
              emptyLabel={t("empty.noCustomersDesc")}
              emptyAction={t("customer.addCustomer")}
              emptyHref="/add"
            />
            <KpiCard 
              title={t("visit.visitHistory")}
              value={visits.current || 0}
              previousValue={visits.previous || 0}
              trendPercent={visits.trendPercent}
              emptyLabel="记录访问以跟踪活动"
              emptyAction="记录访问"
              emptyHref="/visits" 
            />
            <KpiCard 
               title="转化率"
               value={0}
               previousValue={null}
               trendPercent={0}
               formatValue={(v) => `${v}%`}
               emptyLabel="跟踪交易以查看转化"
            />
            <KpiCard 
               title={t("intentLevels.4") || "高意向客户"}
               value={(data.customers.recent || []).filter((c) => (c.intent_level || 0) >= 4).length}
               previousValue={0}
               trendPercent={0}
               emptyLabel="还没有高意向线索"
            />
          </div>
        )}
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[var(--fg)] tracking-tight">月度目标</h2>
        </div>
        <GoalsSection 
          stats={{
              customers: Math.max(0, (customers.current || 0) - (customers.previous || 0)),
              visits: visits.current || 0
          }}
        />
      </div>

      <div className="pt-4">
        <ActivityFeed activities={data.activity || []} />
      </div>

      </div>
    </PerformanceMonitor>
  )
}
