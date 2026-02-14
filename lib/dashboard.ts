import { supabase } from "@/lib/supabase"

export type KpiTrend = {
  current: number
  previous: number
  trendPercent: number | null // null if no previous data
}

export type DashboardData = {
  profile: { nickname: string | null } | null
  customers: {
    total: KpiTrend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recent: any[]
  }
  visits: {
    thisMonth: KpiTrend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recent: any[]
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activity: any[] // Mixed timeline
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

  // 1. Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .single()

  // 2. Customers Stats (Current vs Last Month)
  // Total Count (All time)
  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("*", { count: 'exact', head: true })

  // Created Last Month
  // Note: For "Total Customers" trend, typically we compare Total Now vs Total Last Month.
  // Or we compare "New Customers This Month" vs "New Customers Last Month".
  // The user prompt asked for "TOTAL CUSTOMERS ... +12% vs last month".
  // This implies Growth Rate of the TOTAL base, or just Net New.
  // Let's implement active growth: (Net New This Month / Total Start of Month). 
  // BUT the prompt example "36 users, +12%" usually means the total count grew by 12%.
  // Let's fetch Total count as of Start of Current Month.
  
  // Actually, simplest is: count all created before startOfCurrent
  const { count: countBeforeThisMonth } = await supabase
    .from("customers")
    .select("*", { count: 'exact', head: true })
    .lt("created_at", startOfCurrent)

  const currentTotal = totalCustomers || 0
  const prevTotal = countBeforeThisMonth || 0
  
  // Calculate trend based on growth of the total base? 
  // Or maybe "New this month" vs "New last month"? 
  // User example: "Total Customers: 36, +12% vs last month".
  // 36 is the current total. 
  // If it was 32 last month, (36-32)/32 = 12.5%.
  // So Previous is countBeforeThisMonth (Total at end of last month).
  
  const customerTrend = {
    current: currentTotal,
    previous: prevTotal,
    trendPercent: prevTotal > 0 
      ? ((currentTotal - prevTotal) / prevTotal) * 100 
      : null
  }

  // 3. Visits (This Month vs Last Month)
  // Current Month
  const { count: visitsThisMonth } = await supabase
    .from("visits")
    .select("*", { count: 'exact', head: true })
    .gte("visit_date", startOfCurrent)

  // Last Month
  const { count: visitsLastMonth } = await supabase
    .from("visits")
    .select("*", { count: 'exact', head: true })
    .gte("visit_date", startOfLast)
    .lt("visit_date", startOfCurrent)

  const visitTrend = {
    current: visitsThisMonth || 0,
    previous: visitsLastMonth || 0,
    trendPercent: (visitsLastMonth || 0) > 0 
      ? (((visitsThisMonth || 0) - (visitsLastMonth || 0)) / (visitsLastMonth || 0)) * 100 
      : null
  }

  // 4. Activity Feed (Union of recent Customers and Visits)
  // We'll fetch top 5 of each and merge in JS for simplicity
  const { data: recentCustomers } = await supabase
    .from("customers")
    .select("id, company_name, created_at, intent_level")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentVisits } = await supabase
    .from("visits")
    .select("id, visit_date, notes, customers(company_name)")
    .order("visit_date", { ascending: false })
    .limit(5)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customersMapped = (recentCustomers || []).map((c: any) => ({
    type: 'customer',
    id: c.id,
    title: `Added new customer`,
    subtitle: c.company_name,
    date: c.created_at
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitsMapped = (recentVisits || []).map((v: any) => ({
    type: 'visit',
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
