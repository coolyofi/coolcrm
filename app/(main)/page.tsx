"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Customer {
  id: string
  company_name: string
  industry: string
  created_at: string
  intent_level: number
  contact: string | null
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [kpiData, setKpiData] = useState({
    totalCustomers: 0,
    highIntent: 0,
    todayVisits: 0
  })

  // 1. Dynamic Greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    
    // Fetch Recent Customers with more fields
    const { data: recentCustomers, error: customersError } = await supabase
      .from("customers")
      .select("id, company_name, industry, created_at, intent_level, contact")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentCustomers) {
      setCustomers(recentCustomers)
    }

    // Fetch KPIs (Parallel requests for performance)
    // 1. Total Customers
    const { count: totalCount } = await supabase
      .from("customers")
      .select("*", { count: 'exact', head: true })

    // 2. High Intent Customers (Level 4 or 5)
    // Supabase JS client doesn't support 'count' only easily without data return unless headcount is true,
    // but head:true returns null data.
    const { count: highIntentCount } = await supabase
      .from("customers")
      .select("*", { count: 'exact', head: true })
      .gte('intent_level', 4)

    // 3. Today's Visits (Simulated for now as we might not have visits table fully populated or tied to dates easily without more logic)
    // We will just use a placeholder or check if 'visits' table is accessible.
    // Let's stick to "Active" stats derived from customer data for now to be safe.
    
    setKpiData({
      totalCustomers: totalCount || 0,
      highIntent: highIntentCount || 0,
      todayVisits: 12 // Mock or placeholder
    })

    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Helper for Intent Badge
  const getIntentBadge = (level: number) => {
    if (level >= 4) return { label: 'High Intent', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
    if (level === 3) return { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
    return { label: 'Low Intent', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' }
  }

  // Helper for Avatar Initials
  const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : '??'
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header with Dynamic Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--fg)]">
            {getGreeting()}, <span className="opacity-60">User</span>
          </h1>
          <p className="text-[var(--fg-muted)] mt-1">
            Here's what's happening with your customers today.
          </p>
        </div>
        <Link href="/add" className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg hover:brightness-110 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Customer</span>
        </Link>
      </div>

      {/* KPI Cards section - Glass Effect Upgrade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="glass p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Total Customers</p>
              <h3 className="text-4xl font-bold text-[var(--fg)] mt-2">{kpiData.totalCustomers}</h3>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              <span>+12% vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">High Intent Deals</p>
              <h3 className="text-4xl font-bold text-[var(--fg)] mt-2">{kpiData.highIntent}</h3>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-[var(--fg-muted)]">
               <span className="opacity-70">
                {kpiData.totalCustomers > 0 
                  ? `${Math.round((kpiData.highIntent / kpiData.totalCustomers) * 100)}% of total pipeline` 
                  : 'N/A'}
               </span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Pending Tasks</p>
              <h3 className="text-4xl font-bold text-[var(--fg)] mt-2">5</h3>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-orange-500 bg-orange-500/10 w-fit px-2 py-1 rounded-lg">
              <span>Urgent attention needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Customers Rich List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-[var(--fg)]">Recent Customers</h2>
          <Link href="/history" className="text-sm font-medium text-[var(--primary)] hover:opacity-80 flex items-center gap-1 transition-opacity group">
            View All 
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>

        <div className="glass overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[var(--surface-solid)] rounded-full flex items-center justify-center mb-4 text-[var(--fg-muted)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--fg)]">No customers yet</h3>
              <p className="text-[var(--fg-muted)] mt-1 max-w-sm mx-auto">
                Get started by adding your first customer interaction to the CRM.
              </p>
              <Link href="/add" className="mt-6 btn-primary px-6 py-2 text-sm inline-flex items-center gap-2">
                Add Customer
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {customers.map((c) => {
                const badge = getIntentBadge(c.intent_level)
                return (
                  <Link href={`/edit/${c.id}`} key={c.id}>
                    <div className="group p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer gap-4">
                      
                      {/* Left: Avatar + Info */}
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 shrink-0">
                          {getInitials(c.company_name)}
                        </div>
                        
                        {/* Text Info */}
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[var(--fg)] text-base group-hover:text-[var(--primary)] transition-colors truncate">
                            {c.company_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-sm text-[var(--fg-muted)] flex-wrap">
                            <span>{c.contact || 'No contact'}</span>
                            <span className="hidden sm:inline text-[var(--border)]">•</span>
                            <span>{c.industry || 'Unknown Industry'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge + Date + Chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto mt-2 sm:mt-0 pl-[4rem] sm:pl-0">
                        {/* Intent Badge */}
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color} inline-flex items-center gap-1.5 whitespace-nowrap`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                          {badge.label}
                        </div>
                        
                        {/* Date (Hidden on mobile slightly) */}
                        <div className="text-sm text-[var(--fg-muted)] text-right hidden sm:block">
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>

                        {/* Chevron */}
                        <div className="text-[var(--fg-muted)] group-hover:translate-x-1 transition-transform transform">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
