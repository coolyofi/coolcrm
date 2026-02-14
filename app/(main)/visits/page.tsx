"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"

interface Visit {
  id: string
  customer_id: string
  visit_date: string
  latitude: number | null
  longitude: number | null
  address: string | null
  notes: string | null
  customers: {
    company_name: string
  }[]
}

export default function Visits() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchVisits()
  }, [])

  const fetchVisits = async (showToast = false) => {
    try {
      setRefreshing(true)
      const { data, error } = await supabase
        .from("visits")
        .select(`
          id,
          customer_id,
          visit_date,
          latitude,
          longitude,
          address,
          notes,
          customers (
            company_name
          )
        `)
        .order("visit_date", { ascending: false })

      if (error) {
        toast.error("加载拜访记录失败: " + error.message)
        console.error(error)
      } else if (data) {
        setVisits(data)
        if (showToast) {
          toast.success("数据已刷新")
        }
      }
    } catch (error) {
      toast.error("网络错误，请重试")
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--surface-solid)] rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[var(--surface-solid)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg)] drop-shadow-sm">拜访记录</h1>
            <p className="text-[var(--fg-muted)] mt-1">查看所有拜访历史</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchVisits(true)}
              disabled={refreshing}
              className="bg-green-500/20 backdrop-blur-xl hover:bg-green-500/30 disabled:bg-gray-500/20 text-green-600 dark:text-green-200 hover:text-green-700 dark:hover:text-green-100 disabled:text-gray-400 font-medium py-2 px-4 rounded-xl transition-all duration-300 border border-green-400/30 hover:border-green-400/50 disabled:border-gray-400/30 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  刷新中...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  刷新
                </>
              )}
            </button>
            <Link
              href="/"
              className="bg-[var(--primary)] text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 hover:brightness-110 shadow-lg"
            >
              返回首页
            </Link>
          </div>
        </div>

      <div className="glass overflow-hidden shadow-lg">
        {/* 桌面端表格 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--surface-solid)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  拜访时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  位置
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  备注
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-[var(--surface-solid)] transition-all duration-300">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--fg)]">
                    {visit.customers?.[0]?.company_name || "未知客户"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--fg-muted)]">
                    {new Date(visit.visit_date).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--fg-muted)]">
                    {visit.address || `${visit.latitude?.toFixed(6)}, ${visit.longitude?.toFixed(6)}` || "未知位置"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--fg-muted)]">
                    {visit.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 移动端卡片布局 */}
        <div className="md:hidden divide-y divide-[var(--border)]">
          {visits.map((visit) => (
            <div key={visit.id} className="p-4 space-y-3 hover:bg-[var(--surface-solid)] transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--fg)] text-lg">
                    {visit.customers?.[0]?.company_name || "未知客户"}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] mt-1">
                    📅 {new Date(visit.visit_date).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[var(--fg-muted)] text-sm">
                    {visit.address || `${visit.latitude?.toFixed(4)}, ${visit.longitude?.toFixed(4)}` || "未知位置"}
                  </span>
                </div>

                {visit.notes && (
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--fg)] text-sm">{visit.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {visits.length === 0 && (
          <div className="text-center py-8 text-[var(--fg-muted)]">
            暂无拜访记录
          </div>
        )}
      </div>
    </div>
    </>
  )
}