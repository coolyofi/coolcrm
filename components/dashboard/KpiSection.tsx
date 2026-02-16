import { Suspense } from "react"
import { getDashboardData } from "@/lib/dashboard-optimized"
import { createServerSupabase } from "@/lib/supabase"
import { KpiCard, KpiCardSkeleton } from "./KpiCard"
import { useTranslation } from "@/hooks/useTranslation"

async function CustomersKpi({ userId, initialData }: { userId: string, initialData: any }) {
  const supabase = await createServerSupabase()
  // In a real optimized app, we'd only fetch what this component needs
  const data = await getDashboardData(userId, supabase)
  const customers = data.customers.total

  return (
    <KpiCard 
      title="总客户数"
      value={customers.current || 0}
      previousValue={customers.previous || 0}
      trendPercent={customers.trendPercent}
      emptyLabel="尚未添加客户"
      emptyAction="添加客户"
      emptyHref="/add"
    />
  )
}

async function VisitsKpi({ userId }: { userId: string }) {
  const supabase = await createServerSupabase()
  const data = await getDashboardData(userId, supabase)
  const visits = data.visits.thisMonth

  return (
    <KpiCard 
      title="本月拜访"
      value={visits.current || 0}
      previousValue={visits.previous || 0}
      trendPercent={visits.trendPercent}
      emptyLabel="本月暂无拜访"
      emptyAction="记录拜访"
      emptyHref="/add"
    />
  )
}

export function KpiSection({ userId, initialData }: { userId?: string, initialData?: any }) {
  if (!userId) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Suspense fallback={<KpiCardSkeleton />}>
        <CustomersKpi userId={userId} initialData={initialData} />
      </Suspense>
      <Suspense fallback={<KpiCardSkeleton />}>
        <VisitsKpi userId={userId} />
      </Suspense>
      {/* Add more KPI cards as needed */}
    </div>
  )
}
