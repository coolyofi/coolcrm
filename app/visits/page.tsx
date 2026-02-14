"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

  useEffect(() => {
    fetchVisits()
  }, [])

  const fetchVisits = async () => {
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

    if (!error && data) {
      setVisits(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">拜访记录</h1>
          <p className="text-gray-400 mt-1">查看所有拜访历史</p>
        </div>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          返回首页
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  拜访时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  位置
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  备注
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {visit.customers?.[0]?.company_name || "未知客户"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(visit.visit_date).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {visit.address || `${visit.latitude?.toFixed(6)}, ${visit.longitude?.toFixed(6)}` || "未知位置"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {visit.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visits.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            暂无拜访记录
          </div>
        )}
      </div>
    </div>
  )
}