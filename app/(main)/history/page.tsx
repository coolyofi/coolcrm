"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import toast, { Toaster } from "react-hot-toast"

interface Customer {
  id: string
  company_name: string
  industry: string
  intent_level: number
  visit_date: string
  contact: string
  notes: string
  latitude: number | null
  longitude: number | null
  address: string | null
}

export default function History() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("")

  const refetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setCustomers(data)
    }
    setLoading(false)
  }, [])

  // Use useMemo for performance
  const filteredCustomers = useMemo(() => {
    let filtered = customers

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contact && c.contact.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (industryFilter) {
      filtered = filtered.filter(c => c.industry === industryFilter)
    }

    return filtered
  }, [customers, searchTerm, industryFilter])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setCustomers(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个客户吗？")) return

    const { error } = await supabase.from("customers").delete().eq("id", id)
    if (error) {
      toast.error("删除失败")
      console.error(error)
    } else {
      toast.success("删除成功")
      refetchData()
    }
  }

  const uniqueIndustries = Array.from(new Set(customers.map(c => c.industry).filter(Boolean)))

  return (
    <main className="max-w-[1200px] mx-auto min-h-screen p-6 sm:p-8 space-y-6">
      <Toaster position="top-center" />
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] tracking-tight">客户 / 历史记录</h1>
          <p className="text-[var(--fg-muted)] text-sm mt-1">
            管理所有客户拜访与意向数据
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[var(--primary)] text-white font-medium text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增客户
        </Link>
      </div>

      {/* 2. Filter Bar (Glass) */}
      <div className="glass px-6 py-4 rounded-[20px] flex flex-col sm:flex-row gap-4 sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[var(--fg-muted)] group-focus-within:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="搜索公司名称或联系人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl leading-5 text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:ring-[4px] focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all sm:text-sm"
          />
        </div>
        
        {/* Industry Filter */}
        <div className="relative min-w-[180px]">
             <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="appearance-none block w-full pl-4 pr-10 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] focus:outline-none focus:ring-[4px] focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all sm:text-sm cursor-pointer"
            >
              <option value="">所有行业</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--fg-muted)]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
        </div>
      </div>

      {/* 3. List Container (Solid Surface) */}
      <div className="surface-solid rounded-[24px] border border-[var(--border)] flex flex-col overflow-hidden text-[var(--fg)] min-h-[400px]">
        {/* List Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-solid)] flex justify-between items-center bg-opacity-50">
           <div className="flex items-center gap-2">
             <h3 className="font-semibold text-[var(--fg)]">客户列表</h3>
             <span className="px-2 py-0.5 rounded-md bg-[var(--glass-bg)] border border-[var(--border)] text-xs text-[var(--fg-muted)]">
                共 {filteredCustomers.length} 条
             </span>
           </div>
           {/* Additional sort/view actions can go here */}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          /* 4. Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-[var(--glass-bg)] rounded-full flex items-center justify-center mb-6 ring-1 ring-[var(--border)]">
              <svg className="w-10 h-10 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">
              {searchTerm || industryFilter ? "没有匹配的客户" : "暂无客户记录"}
            </h3>
            <p className="text-[var(--fg-muted)] text-sm max-w-sm mb-8">
              {searchTerm || industryFilter 
                ? "尝试调整搜索关键词或筛选条件" 
                : "现在还没有任何客户数据，您可以从右上角创建第一条客户信息，开始记录拜访跟进。"}
            </p>
            
            <Link
              href="/add"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[var(--primary)] text-white font-medium hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all"
            >
              + 新增客户
            </Link>
          </div>
        ) : (
          /* List Content */
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--glass-bg)] text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">公司信息</th>
                    <th className="px-6 py-4">行业</th>
                    <th className="px-6 py-4">联系人</th>
                    <th className="px-6 py-4">意向等级</th>
                    <th className="px-6 py-4">最后拜访</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredCustomers.map((c: Customer) => (
                    <tr 
                      key={c.id} 
                      className="group transition-colors hover:bg-[var(--glass-bg)]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--fg)] text-sm">{c.company_name}</span>
                          {c.address && <span className="text-xs text-[var(--fg-muted)] mt-0.5 truncate max-w-[180px]">{c.address}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--glass-bg)] border border-[var(--border)] text-[var(--fg-muted)]">
                          {c.industry || "未分类"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--fg)]">
                         {c.contact || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                                c.intent_level >= 4 ? 'bg-green-500' :
                                c.intent_level === 3 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></span>
                            <span className="text-sm font-medium text-[var(--fg)]">{c.intent_level}级</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--fg-muted)] tabular-nums">
                        {c.visit_date ? new Date(c.visit_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/edit/${c.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                            编辑
                          </Link>
                          <button onClick={() => handleDelete(c.id)} className="text-sm font-medium text-[var(--danger)] hover:underline">
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Optimized) */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {filteredCustomers.map((c: Customer) => (
                <div key={c.id} className="p-5 flex flex-col gap-3 hover:bg-[var(--glass-bg)] transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-[var(--fg)]">{c.company_name}</h3>
                        <p className="text-xs text-[var(--fg-muted)] mt-1 flex items-center gap-2">
                           <span>{c.industry || "未分类"}</span>
                           {c.contact && <><span>•</span><span>{c.contact}</span></>}
                        </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                        c.intent_level >= 4 ? 'bg-green-500/10 text-green-500' :
                        c.intent_level === 3 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                        {c.intent_level}级意向
                    </span>
                  </div>
                  
                  {c.notes && (
                      <p className="text-sm text-[var(--fg-muted)] line-clamp-2 bg-[var(--glass-bg)] p-2 rounded-lg border border-[var(--border)]">
                          {c.notes}
                      </p>
                  )}

                  <div className="flex items-center justify-between pt-2 mt-1">
                      <span className="text-xs text-[var(--fg-muted)]">
                          {c.visit_date ? new Date(c.visit_date).toLocaleDateString() : "无日期"}
                      </span>
                      <div className="flex gap-4">
                          <Link href={`/edit/${c.id}`} className="text-sm font-medium text-[var(--primary)]">
                              编辑
                          </Link>
                          <button onClick={() => handleDelete(c.id)} className="text-sm font-medium text-[var(--danger)]">
                              删除
                          </button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
