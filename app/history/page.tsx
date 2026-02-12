"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Customer {
  id: string
  company_name: string
  industry: string
  intent_level: number
  visit_date: string
}

export default function History() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

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

  const handleDelete = async (id: string) => {
    await supabase.from("customers").delete().eq("id", id)
    fetchData()
  }

  return (
    <div className="space-y-6">
      
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-semibold">历史记录</h1>
        <p className="text-gray-400 text-sm mt-1">
          所有已录入的客户信息
        </p>
      </div>

      {/* 数据卡片 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

        {loading ? (
          <div className="p-6 text-gray-400">加载中...</div>
        ) : customers.length === 0 ? (
          <div className="p-6 text-gray-400">暂无数据</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="p-4 text-left">公司</th>
                <th className="p-4 text-left">行业</th>
                <th className="p-4 text-left">意向</th>
                <th className="p-4 text-left">日期</th>
                <th className="p-4 text-left">操作</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-800 hover:bg-gray-800/50 transition"
                >
                  <td className="p-4 font-medium">
                    {c.company_name}
                  </td>

                  <td className="p-4 text-gray-400">
                    {c.industry || "-"}
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 rounded-md text-xs bg-blue-600/20 text-blue-400">
                      {c.intent_level}
                    </span>
                  </td>

                  <td className="p-4 text-gray-400">
                    {c.visit_date || "-"}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}