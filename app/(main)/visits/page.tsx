"use client"

import { useEffect, useState } from "react"
import { isDemo } from '@/lib/demo'
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/PageHeader"
import DataTable from '@/components/ui/DataTable'
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/Button"

const defaultIcons = {
  visits: (
    <svg className="w-12 h-12 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
}

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
    if (isDemo()) {
      // Provide lightweight demo visits
      setTimeout(() => {
        setVisits([
          {
            id: 'demo-v1',
            customer_id: 'demo-c1',
            visit_date: new Date().toISOString(),
            latitude: null,
            longitude: null,
            address: '示例城市示例街道',
            notes: '这是演示拜访记录',
            customers: [{ company_name: '示例科技' }]
          }
        ])
        setLoading(false)
      }, 250)
    } else {
      fetchVisits()
    }
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
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="拜访记录"
          subtitle="查看所有拜访历史"
          actions={
            <div className="flex gap-3">
              <Button
                onClick={() => fetchVisits(true)}
                disabled={refreshing}
                variant="secondary"
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
              </Button>
            </div>
          }
        />

        <div className="mt-12"></div>

      <div className="glass overflow-hidden shadow-lg">
        {visits.length > 0 && (
          <>
            {/* 桌面端表格 */}
            <div className="hidden md:block">
              <DataTable
                headers={[{ label: '客户' }, { label: '拜访时间' }, { label: '位置' }, { label: '备注' }]}
                data={visits.map(v => [
                  v.customers?.[0]?.company_name || '未知客户',
                  new Date(v.visit_date).toLocaleString('zh-CN'),
                  v.address || (v.latitude && v.longitude ? `${v.latitude.toFixed(6)}, ${v.longitude.toFixed(6)}` : '未知位置'),
                  v.notes || '-'
                ])}
                rowStyle="zebra"
                minHeight="160px"
              />
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
            </div>          </>
        )}
      </div>
    </div>
    </>
  )
}