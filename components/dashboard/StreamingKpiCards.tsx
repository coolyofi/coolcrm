import { Suspense } from "react"
import { getCustomerKpi, getVisitKpi, getHighIntentKpi } from "@/lib/dashboard-optimized"
import { createServerSupabase } from "@/lib/supabase"
import { KpiCard, KpiCardSkeleton } from "./KpiCard"
import { translations } from "@/lib/i18n"

async function CustomerCard({ userId }: { userId: string }) {
  const supabase = await createServerSupabase()
  const data = await getCustomerKpi(userId, supabase)
  
  return (
    <KpiCard 
      title={translations.customer.totalCustomers}
      value={data.current}
      previousValue={data.previous}
      trendPercent={data.trendPercent}
      emptyLabel={translations.empty.noCustomersDesc}
    />
  )
}

async function VisitCard({ userId }: { userId: string }) {
  const supabase = await createServerSupabase()
  const data = await getVisitKpi(userId, supabase)
  
  return (
    <KpiCard 
      title={translations.visit.visitHistory}
      value={data.current}
      previousValue={data.previous}
      trendPercent={data.trendPercent}
      emptyLabel="记录访问以跟踪活动"
      emptyAction="记录访问"
      emptyHref="/visits"
    />
  )
}

async function HighIntentCard({ userId }: { userId: string }) {
  const supabase = await createServerSupabase()
  const data = await getHighIntentKpi(userId, supabase)
  
  return (
    <KpiCard 
      title={translations.intentLevels[4]}
      value={data.current}
      previousValue={null}
      trendPercent={0}
      showStorytelling={false}
      formatValue={(v) => `${v} 位`}
      emptyLabel="还没有高意向线索"
    />
  )
}

export function StreamingKpiCards({ userId }: { userId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Suspense fallback={<KpiCardSkeleton />}>
        <CustomerCard userId={userId} />
      </Suspense>
      <Suspense fallback={<KpiCardSkeleton />}>
        <VisitCard userId={userId} />
      </Suspense>
      <Suspense fallback={<KpiCardSkeleton />}>
        <HighIntentCard userId={userId} />
      </Suspense>
      <Suspense fallback={<KpiCardSkeleton />}>
        <KpiCard 
           title="转化率 (演示)"
           value={0}
           previousValue={null}
           trendPercent={0}
           formatValue={(v) => `${v}%`}
           showStorytelling={false}
           emptyLabel="集成 CRM 模块后开启"
           emptyAction="了解详情"
           emptyHref="/settings"
        />
      </Suspense>
    </div>
  )
}
