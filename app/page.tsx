"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Customer {
  id: string
  company_name: string
  industry: string
  created_at: string
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, company_name, industry, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    if (!error && data) {
      setCustomers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRecentCustomers()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Title + Primary Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)]">
            Dashboard
          </h1>
          <p className="text-[var(--fg-muted)] mt-1">
            Welcome back, here's your overview.
          </p>
        </div>
        <Link href="/add" className="btn-primary px-6 py-3 flex items-center gap-2">
          <span>+ New Customer</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass p-6 flex flex-col justify-between h-32">
          <h3 className="text-sm font-medium text-[var(--fg-muted)] uppercase tracking-wide">Total Customers</h3>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold text-[var(--fg)]">{customers.length}</span>
            <span className="text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-lg">+12%</span>
          </div>
        </div>

        <div className="glass p-6 flex flex-col justify-between h-32">
          <h3 className="text-sm font-medium text-[var(--fg-muted)] uppercase tracking-wide">Active Deals</h3>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold text-[var(--fg)]">3</span>
            <span className="text-[var(--fg-muted)] text-sm">Target: 10</span>
          </div>
        </div>

        <div className="glass p-6 flex flex-col justify-between h-32">
          <h3 className="text-sm font-medium text-[var(--fg-muted)] uppercase tracking-wide">Pending Tasks</h3>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold text-[var(--fg)]">5</span>
            <span className="text-orange-400 text-sm font-medium bg-orange-400/10 px-2 py-1 rounded-lg">Urgent</span>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Customers */}
      <div className="glass p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--fg)]">Recent Customers</h3>
          <Link href="/history" className="text-sm text-[var(--primary)] hover:underline">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-[var(--fg-muted)]">
            No customers found. Start by adding one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[var(--fg-muted)] text-sm border-b border-[var(--border)]">
                  <th className="pb-3 pl-2 font-medium">Company</th>
                  <th className="pb-3 font-medium">Industry</th>
                  <th className="pb-3 font-medium text-right">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {customers.map((c) => (
                  <tr key={c.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-2 font-medium text-[var(--fg)]">{c.company_name}</td>
                    <td className="py-4 text-[var(--fg-muted)]">{c.industry || 'Unknown'}</td>
                    <td className="py-4 text-right text-[var(--fg-muted)] text-sm">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}