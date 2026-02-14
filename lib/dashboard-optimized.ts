import { supabase } from "@/lib/supabase"

export type KpiTrend = {
  current: number
  previous: number
  trendPercent: number | null // null if no previous data
}

export type ActivityItem = {
  id: string
  type: 'visit' | 'customer'
  title: string
  subtitle: string
  date: string
}

export type DashboardData = {
  profile: { nickname: string | null } | null
  customers: {
    total: KpiTrend
    recent: unknown[]
  }
  visits: {
    thisMonth: KpiTrend
    recent: unknown[]
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
  const [
    profileResult,
    totalCustomersResult,
    countBeforeThisMonthResult,
    visitsThisMonthResult,
    visitsLastMonthResult,
    recentCustomersResult,
    recentVisitsResult
  ] = await Promise.all([
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

  // Extract data from results
  const { data: profile } = profileResult
  const { count: totalCustomers } = totalCustomersResult
  const { count: countBeforeThisMonth } = countBeforeThisMonthResult
  const { count: visitsThisMonth } = visitsThisMonthResult
  const { count: visitsLastMonth } = visitsLastMonthResult
  const { data: recentCustomers } = recentCustomersResult
  const { data: recentVisits } = recentVisitsResult

  const currentTotal = totalCustomers || 0
  const prevTotal = countBeforeThisMonth || 0

  const customerTrend = {
    current: currentTotal,
    previous: prevTotal,
    trendPercent: prevTotal > 0
      ? ((currentTotal - prevTotal) / prevTotal) * 100
      : null
  }

  const visitTrend = {
    current: visitsThisMonth || 0,
    previous: visitsLastMonth || 0,
    trendPercent: (visitsLastMonth || 0) > 0
      ? (((visitsThisMonth || 0) - (visitsLastMonth || 0)) / (visitsLastMonth || 0)) * 100
      : null
  }

  const customersMapped: ActivityItem[] = (recentCustomers || []).map((c: { id: string; company_name: string; created_at: string }) => ({
    type: 'customer' as const,
    id: c.id,
    title: `Added new customer`,
    subtitle: c.company_name,
    date: c.created_at
  }))

  const visitsMapped: ActivityItem[] = (recentVisits || []).map((v: { id: string; customers: { company_name: string } | { company_name: string }[]; notes?: string; visit_date: string }) => ({
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