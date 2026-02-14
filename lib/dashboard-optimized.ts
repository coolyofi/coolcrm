import { supabase } from "@/lib/supabase"
import type { Customer } from "@/lib/api/customers"

// Type for Supabase query errors
type SupabaseError = {
  message: string
  details?: string
  hint?: string
}

// Partial Visit type for dashboard use (only includes fields we query)
export type DashboardVisit = {
  id: string
  visit_date: string
  notes: string | null
  customers: { company_name: string } | Array<{ company_name: string }>
}

export type KpiTrend = {
  current: number
  previous: number
  trendPercent: number // percentage change, 100 for initial growth from 0
}

export type ActivityItem = {
  id: string
  type: 'visit' | 'customer'
  title: string
  subtitle: string
  date: string
}

// Fixed: Replaced unknown[] with proper Customer[] and DashboardVisit[] types for type safety
export type DashboardData = {
  profile: { nickname: string | null } | null
  customers: {
    total: KpiTrend
    recent: Customer[]
  }
  visits: {
    thisMonth: KpiTrend
    recent: DashboardVisit[]
  }
  activity: ActivityItem[] // Mixed timeline
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

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const { startOfCurrent, startOfLast } = getMonthRanges()

  // Execute all queries in parallel for better performance
  // Use Promise.allSettled to prevent one failure from breaking the entire dashboard
  const results = await Promise.allSettled([
    // 1. Profile
    supabase
      .from("profiles")
      .select("nickname")
      .eq("id", userId)
      .single(),

    // 2. Total customers count
    supabase
      .from("customers")
      .select("*", { count: 'exact', head: true }),

    // 3. Customers before this month
    supabase
      .from("customers")
      .select("*", { count: 'exact', head: true })
      .lt("created_at", startOfCurrent),

    // 4. Visits this month
    supabase
      .from("visits")
      .select("*", { count: 'exact', head: true })
      .gte("visit_date", startOfCurrent),

    // 5. Visits last month
    supabase
      .from("visits")
      .select("*", { count: 'exact', head: true })
      .gte("visit_date", startOfLast)
      .lt("visit_date", startOfCurrent),

    // 6. Recent customers
    supabase
      .from("customers")
      .select("id, company_name, created_at, intent_level")
      .order("created_at", { ascending: false })
      .limit(5),

    // 7. Recent visits
    supabase
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
  const safeExtract = <T>(result: PromiseSettledResult<{ data?: T; count?: number; error?: SupabaseError | null }>, defaultValue: T): T => {
    if (result.status === 'fulfilled' && !result.value.error) {
      // For count queries, return count; for data queries, return data
      return ('count' in result.value ? (result.value.count ?? defaultValue) : (result.value.data ?? defaultValue)) as T
    }
    return defaultValue
  }

  const profile = safeExtract(profileResult, null)
  const totalCustomers = safeExtract(totalCustomersResult, 0) as number
  const countBeforeThisMonth = safeExtract(countBeforeThisMonthResult, 0) as number
  const visitsThisMonth = safeExtract(visitsThisMonthResult, 0) as number
  const visitsLastMonth = safeExtract(visitsLastMonthResult, 0) as number
  const recentCustomers = safeExtract(recentCustomersResult, []) as Customer[]
  const recentVisits = safeExtract(recentVisitsResult, []) as DashboardVisit[]

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
    title: `Added new customer`,
    subtitle: c.company_name,
    date: c.created_at || ''
  }))

  // Type-safe mapping using DashboardVisit type (partial Visit with only queried fields)
  const visitsMapped: ActivityItem[] = (recentVisits || []).map((v: DashboardVisit) => ({
    type: 'visit' as const,
    id: v.id,
    title: `Visited ${Array.isArray(v.customers) ? v.customers[0]?.company_name : v.customers?.company_name || 'Unknown'}`,
    subtitle: v.notes || 'No notes',
    date: v.visit_date
  }))

  const activity = [...customersMapped, ...visitsMapped]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return {
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
}