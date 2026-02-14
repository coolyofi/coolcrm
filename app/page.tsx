"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Customer {
  id: string
  company_name: string
  industry: string
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, company_name, industry")
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
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="pt-4 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-bold">CoolCRM Dashboard</h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">客户关系管理系统</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-2">📊 总客户数</h3>
          <p className="text-2xl md:text-3xl font-bold text-blue-400">{customers.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <Link href="/add" className="block h-full">
            <h3 className="text-base md:text-lg font-semibold mb-2">➕ 新增客户</h3>
            <p className="text-blue-400 hover:text-blue-300 text-sm md:text-base">点击添加新客户</p>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <Link href="/history" className="block h-full">
            <h3 className="text-base md:text-lg font-semibold mb-2">📜 历史记录</h3>
            <p className="text-blue-400 hover:text-blue-300 text-sm md:text-base">查看全部客户</p>
          </Link>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link
          href="/add"
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-center transition"
        >
          <div className="text-2xl mb-2">➕</div>
          <div className="text-sm font-medium">新增客户</div>
        </Link>

        <Link
          href="/history"
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-center transition"
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="text-sm font-medium">客户列表</div>
        </Link>

        <Link
          href="/visits"
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl text-center transition"
        >
          <div className="text-2xl mb-2">📍</div>
          <div className="text-sm font-medium">拜访记录</div>
        </Link>

        <Link
          href="/settings"
          className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-xl text-center transition"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <div className="text-sm font-medium">设置</div>
        </Link>
      </div>

      {/* 最近客户 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">🕒 最近客户</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-gray-400">加载中...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">暂无客户数据</p>
            <Link
              href="/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition inline-block"
            >
              添加第一个客户
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="flex justify-between items-center p-3 md:p-4 bg-gray-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{customer.company_name}</p>
                  <p className="text-sm text-gray-400">{customer.industry || "未分类"}</p>
                </div>
                <Link
                  href={`/edit/${customer.id}`}
                  className="text-blue-400 hover:text-blue-300 ml-3 text-sm md:text-base whitespace-nowrap"
                >
                  编辑 →
                </Link>
              </div>
            ))}
            <div className="text-center pt-4 border-t border-gray-700">
              <Link
                href="/history"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                查看全部客户 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}