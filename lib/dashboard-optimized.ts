import { supabase as defaultSupabase } from "@/lib/supabase"
import { 
  CustomerSchema, 
  DashboardDataSchema, 
  type Customer, 
  type DashboardData,
  type DashboardVisit,
  type KpiTrend,
  type ActivityItem 
} from "@/lib/schemas"

// Type for Supabase query errors
type SupabaseError = {
  message: string
  details?: string
  hint?: string
}

// Helper: Get start/end of current and last month
function getMonthRanges() {
  const now = new Date()
  const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfLast = lastMonth.toISOString()
  // endOfLast unused
  // const endOfLast = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  return { startOfCurrent, startOfLast }
}

export async function getCustomerKpi(userId: string, supabaseClient = defaultSupabase) {
  const { startOfCurrent } = getMonthRanges()
  const [total, before] = await Promise.all([
    supabaseClient.from("customers").select("*", { count: 'exact', head: true }),
    supabaseClient.from("customers").select("*", { count: 'exact', head: true }).lt("created_at", startOfCurrent)
  ])
  
  const current = total.count || 0
  const previous = before.count || 0
  
  return {
    current,
    previous,
    trendPercent: previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0)
  }
}

export async function getVisitKpi(userId: string, supabaseClient = defaultSupabase) {
  const { startOfCurrent, startOfLast } = getMonthRanges()
  const [thisMonth, lastMonth] = await Promise.all([
    supabaseClient.from("visits").select("*", { count: 'exact', head: true }).gte("visit_date", startOfCurrent),
    supabaseClient.from("visits").select("*", { count: 'exact', head: true }).gte("visit_date", startOfLast).lt("visit_date", startOfCurrent)
  ])
  
  const current = thisMonth.count || 0
  const previous = lastMonth.count || 0
  
  return {
    current,
    previous,
    trendPercent: previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0)
  }
}

export async function getHighIntentKpi(userId: string, supabaseClient = defaultSupabase) {
  const { count } = await supabaseClient
    .from("customers")
    .select("*", { count: 'exact', head: true })
    .gte("intent_level", 4)
  
  return {
    current: count || 0,
    previous: null,
    trendPercent: 0
  }
}

export async function getDashboardData(userId: string, supabaseClient = defaultSupabase): Promise<DashboardData> {
  const { startOfCurrent, startOfLast } = getMonthRanges()

  // Execute all queries in parallel for better performance
  // Use Promise.allSettled to prevent one failure from breaking the entire dashboard
  const results = await Promise.allSettled([
    // 1. Profile
    supabaseClient
      .from("profiles")
      .select("nickname")
      .eq("id", userId)
      .single(),

    // 2. Total customers count
    supabaseClient
      .from("customers")
      .select("*", { count: 'exact', head: true }),

    // 3. Customers before this month
    supabaseClient
      .from("customers")
      .select("*", { count: 'exact', head: true })
      .lt("created_at", startOfCurrent),

    // 4. Visits this month
    supabaseClient
      .from("visits")
      .select("*", { count: 'exact', head: true })
      .gte("visit_date", startOfCurrent),

    // 5. Visits last month
    supabaseClient
      .from("visits")
      .select("*", { count: 'exact', head: true })
      .gte("visit_date", startOfLast)
      .lt("visit_date", startOfCurrent),

    // 6. Recent customers
    supabaseClient
      .from("customers")
      .select("id, company_name, created_at, intent_level")
      .order("created_at", { ascending: false })
      .limit(5),

    // 7. Recent visits
    supabaseClient
      .from("visits")
      .select("id, visit_date, notes, customers(company_name)")
      .order("visit_date", { ascending: false })
      .limit(5)
  ])

  // Extract data from results with error handling
  const profileResult = results[0] as PromiseSettledResult<{ data: { nickname: string | null } | null, error: SupabaseError | null }>
  const totalCustomersResult = results[1] as PromiseSettledResult<{ count: number | null, error: SupabaseError | null }>
  const countBeforeThisMonthResult = results[2] as PromiseSettledResult<{ count: number | null, error: SupabaseError | null }>
  const visitsThisMonthResult = results[3] as PromiseSettledResult<{ count: number | null, error: SupabaseError | null }>
  const visitsLastMonthResult = results[4] as PromiseSettledResult<{ count: number | null, error: SupabaseError | null }>
  const recentCustomersResult = results[5] as PromiseSettledResult<{ data: Customer[] | null, error: SupabaseError | null }>
  const recentVisitsResult = results[6] as PromiseSettledResult<{ data: DashboardVisit[] | null, error: SupabaseError | null }>

  // Helper function to safely extract data with defaults
  // DON'T throw on single query failures — return sensible defaults and log useful diagnostics.
  const safeExtract = <T>(
    result: PromiseSettledResult<{ data?: T | null; count?: number | null; error?: SupabaseError | null }>,
    defaultValue: T,
    label?: string
  ): T => {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        // Log and send lightweight telemetry for failed queries
        console.warn(`Supabase query error for ${label ?? 'unknown'}:`, result.value.error)
        try {
          import('./telemetry')
            .then(({ reportSupabaseError }) => void reportSupabaseError(result.value.error, { label }))
            .catch(() => {})
        } catch {
          // ignore telemetry failures
        }
        return defaultValue
      }

      // For count queries, return count; for data queries, return data
      return ('count' in result.value ? ((result.value.count ?? defaultValue) as unknown as T) : (result.value.data ?? defaultValue) as T) as T
    }

    // If the promise was rejected, log and return default instead of throwing
    if (result.status === 'rejected') {
      console.warn(`Supabase promise rejected for ${label ?? 'unknown'}:`, result.reason)
      return defaultValue
    }

    return defaultValue
  }

  const profile = safeExtract(profileResult, null, 'profile')
  const totalCustomers = safeExtract(totalCustomersResult, 0, 'totalCustomers') as number
  const countBeforeThisMonth = safeExtract(countBeforeThisMonthResult, 0, 'countBeforeThisMonth') as number
  const visitsThisMonth = safeExtract(visitsThisMonthResult, 0, 'visitsThisMonth') as number
  const visitsLastMonth = safeExtract(visitsLastMonthResult, 0, 'visitsLastMonth') as number
  const recentCustomers = safeExtract(recentCustomersResult, [], 'recentCustomers') as Customer[]
  const recentVisits = safeExtract(recentVisitsResult, [], 'recentVisits') as DashboardVisit[]

  const currentTotal = totalCustomers || 0
  const prevTotal = countBeforeThisMonth || 0

  const customerTrend = {
    current: currentTotal,
    previous: prevTotal,
    trendPercent: prevTotal > 0
      ? ((currentTotal - prevTotal) / prevTotal) * 100
      : currentTotal > 0 ? 100 : 0
  }

  const visitTrend = {
    current: visitsThisMonth || 0,
    previous: visitsLastMonth || 0,
    trendPercent: (visitsLastMonth || 0) > 0
      ? (((visitsThisMonth || 0) - (visitsLastMonth || 0)) / (visitsLastMonth || 0)) * 100
      : (visitsThisMonth || 0) > 0 ? 100 : 0
  }

  // Type-safe mapping using Customer type
  const customersMapped: ActivityItem[] = (recentCustomers || []).map((c: Customer) => ({
    type: 'customer' as const,
    id: c.id || '',
    title: `新增客户`,
    subtitle: c.company_name,
    date: c.created_at || ''
  }))

  // Type-safe mapping using DashboardVisit type (partial Visit with only queried fields)
  const visitsMapped: ActivityItem[] = (recentVisits || []).map((v: DashboardVisit) => ({
    type: 'visit' as const,
    id: v.id,
    title: `拜访客户: ${v.customers?.[0]?.company_name || '未知'}`,
    subtitle: v.notes || '暂无备注',
    date: v.visit_date
  }))

  const activity = [...customersMapped, ...visitsMapped]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const result: DashboardData = {
    profile,
    customers: {
      total: customerTrend,
      recent: recentCustomers || []
    },
    visits: {
      thisMonth: visitTrend,
      recent: recentVisits || []
    },
    activity
  }
  return DashboardDataSchema.parse(result)
}