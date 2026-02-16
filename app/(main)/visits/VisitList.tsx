"use client"

import { useOptimistic, useTransition, useState } from "react"
import { isDemo } from '@/lib/demo'
import toast, { Toaster } from "react-hot-toast"
import { PageHeader } from "@/components/PageHeader"
import DataTable from '@/components/ui/DataTable'
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/Button"
import useSWR from "swr"
import { fetchVisits } from "@/lib/api/visits"
import { type Visit } from "@/lib/schemas"
import { deleteVisitAction } from "@/app/actions"

const defaultIcons = {
  visits: (
    <svg className="w-12 h-12 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
}

interface VisitListProps {
  initialData: Visit[]
}

export default function VisitList({ initialData }: VisitListProps) {
  const { data: visits = initialData, mutate, isLoading, isValidating } = useSWR(
    'visits',
    () => fetchVisits(),
    {
      fallbackData: initialData,
      revalidateOnFocus: false
    }
  )

  const [optimisticVisits, removeOptimisticVisit] = useOptimistic(
    visits,
    (state, visitId: string) => state.filter(v => v.id !== visitId)
  )

  const [isPending, startTransition] = useTransition()

  const handleDelete = async (id: string | undefined) => {
    if (!id) return
    if (!confirm("确定要删除这条记录吗？")) return

    startTransition(async () => {
      removeOptimisticVisit(id)
      const result = await deleteVisitAction(id)
      if (result.error) {
        toast.error(result.error)
        mutate() // Revert optimistic UI on error
      } else {
        toast.success("删除成功")
        mutate() // Sync with server data
      }
    })
  }

  const handleRefresh = async () => {
    try {
      await mutate()
      toast.success("数据已刷新")
    } catch (error) {
      toast.error("刷新失败")
      console.error(error)
    }
  }

  if (isLoading && visits.length === 0) {
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
                onClick={handleRefresh}
                disabled={isValidating}
                variant="secondary"
              >
                {isValidating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    刷新中...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="glass overflow-hidden shadow-lg min-h-[400px]">
        {visits.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <EmptyState
              icon={defaultIcons.visits}
              title="暂无拜访记录"
              description="该页面显示您所有的拜访记录。要添加拜访记录，请在历史记录中选择一个客户并点击编辑，或者在添加新客户时勾选'标记为已拜访'。"
            />
          </div>
        ) : (
          <>
            {/* 桌面端表格 */}
            <div className="hidden md:block">
              <DataTable
                headers={[{ label: '客户' }, { label: '拜访时间' }, { label: '位置' }, { label: '备注' }, { label: '操作' }]}
                data={optimisticVisits.map(v => [
                  v.customers?.[0]?.company_name || '未知客户',
                  v.visit_date ? new Date(v.visit_date).toLocaleString('zh-CN') : '-',
                  v.address || (v.latitude && v.longitude ? `${v.latitude.toFixed(6)}, ${v.longitude.toFixed(6)}` : '未知位置'),
                  v.notes || '-',
                  <button 
                    key={v.id}
                    onClick={() => handleDelete(v.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    title="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                ])}
                rowStyle="zebra"
                minHeight="160px"
              />
            </div>

            {/* 移动端卡片布局 */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {optimisticVisits.map((visit) => (
                <div key={visit.id} className="p-4 space-y-3 hover:bg-[var(--surface-solid)] transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--fg)] text-lg">
                    {visit.customers?.[0]?.company_name || "未知客户"}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] mt-1">
                    📅 {visit.visit_date ? new Date(visit.visit_date).toLocaleString('zh-CN') : "未知时间"}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(visit.id)}
                  className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[var(--fg-muted)] text-sm">
                    {visit.address || (visit.latitude ? `${visit.latitude?.toFixed(4)}, ${visit.longitude?.toFixed(4)}` : "未知位置")}
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
          </>
        )}
      </div>
    </div>
    </>
  )
}
