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
        <h1 className="text-2xl md:text-3xl font-bold text-white dark:text-gray-800 drop-shadow-sm">CoolCRM Dashboard</h1>
        <p className="text-white/60 dark:text-gray-600 mt-2 text-sm md:text-base">客户关系管理系统</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white/10 dark:bg-gray-100/10 backdrop-blur-xl border border-white/20 dark:border-gray-300/20 rounded-xl p-4 md:p-6 shadow-lg hover:bg-white/15 dark:hover:bg-gray-100/15 transition-all duration-300">
          <h3 className="text-base md:text-lg font-semibold mb-2 text-white/90 dark:text-gray-800/90">总客户数</h3>
          <p className="text-2xl md:text-3xl font-bold text-blue-300 dark:text-blue-600">{customers.length}</p>
        </div>

        <div className="bg-white/10 dark:bg-gray-100/10 backdrop-blur-xl border border-white/20 dark:border-gray-300/20 rounded-xl p-4 md:p-6 shadow-lg hover:bg-white/15 dark:hover:bg-gray-100/15 transition-all duration-300">
          <Link href="/add" className="block h-full">
            <h3 className="text-base md:text-lg font-semibold mb-2 text-white/90 dark:text-gray-800/90">新增客户</h3>
            <p className="text-blue-300 dark:text-blue-600 hover:text-blue-200 dark:hover:text-blue-700 text-sm md:text-base">点击添加新客户</p>
          </Link>
        </div>

        <div className="bg-white/10 dark:bg-gray-100/10 backdrop-blur-xl border border-white/20 dark:border-gray-300/20 rounded-xl p-4 md:p-6 shadow-lg hover:bg-white/15 dark:hover:bg-gray-100/15 transition-all duration-300">
          <Link href="/history" className="block h-full">
            <h3 className="text-base md:text-lg font-semibold mb-2 text-white/90 dark:text-gray-800/90">历史记录</h3>
            <p className="text-blue-300 dark:text-blue-600 hover:text-blue-200 dark:hover:text-blue-700 text-sm md:text-base">查看全部客户</p>
          </Link>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link
          href="/add"
          className="bg-green-500/20 dark:bg-green-100/20 backdrop-blur-xl hover:bg-green-500/30 dark:hover:bg-green-100/30 text-green-200 dark:text-green-700 hover:text-green-100 dark:hover:text-green-800 p-4 rounded-xl text-center transition-all duration-300 border border-green-400/30 dark:border-green-600/30 hover:border-green-400/50 dark:hover:border-green-600/50 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="text-sm font-medium">新增客户</div>
        </Link>

        <Link
          href="/history"
          className="bg-blue-500/20 dark:bg-blue-100/20 backdrop-blur-xl hover:bg-blue-500/30 dark:hover:bg-blue-100/30 text-blue-200 dark:text-blue-700 hover:text-blue-100 dark:hover:text-blue-800 p-4 rounded-xl text-center transition-all duration-300 border border-blue-400/30 dark:border-blue-600/30 hover:border-blue-400/50 dark:hover:border-blue-600/50 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="text-sm font-medium">客户列表</div>
        </Link>

        <Link
          href="/visits"
          className="bg-purple-500/20 dark:bg-purple-100/20 backdrop-blur-xl hover:bg-purple-500/30 dark:hover:bg-purple-100/30 text-purple-200 dark:text-purple-700 hover:text-purple-100 dark:hover:text-purple-800 p-4 rounded-xl text-center transition-all duration-300 border border-purple-400/30 dark:border-purple-600/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="text-sm font-medium">拜访记录</div>
        </Link>

        <Link
          href="/settings"
          className="bg-gray-500/20 dark:bg-gray-200/20 backdrop-blur-xl hover:bg-gray-500/30 dark:hover:bg-gray-200/30 text-gray-200 dark:text-gray-700 hover:text-gray-100 dark:hover:text-gray-800 p-4 rounded-xl text-center transition-all duration-300 border border-gray-400/30 dark:border-gray-600/30 hover:border-gray-400/50 dark:hover:border-gray-600/50 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="text-sm font-medium">设置</div>
        </Link>
      </div>

      {/* 最近客户 */}
      <div className="bg-white/10 dark:bg-gray-100/10 backdrop-blur-xl border border-white/20 dark:border-gray-300/20 rounded-xl p-4 md:p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-white/90 dark:text-gray-800/90">最近客户</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-300 dark:border-blue-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-white/60 dark:text-gray-600">加载中...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 dark:text-gray-600 mb-4">暂无客户数据</p>
            <Link
              href="/add"
              className="bg-blue-500/20 dark:bg-blue-100/20 backdrop-blur-xl hover:bg-blue-500/30 dark:hover:bg-blue-100/30 text-blue-200 dark:text-blue-700 hover:text-blue-100 dark:hover:text-blue-800 px-6 py-2 rounded-xl transition-all duration-300 border border-blue-400/30 dark:border-blue-600/30 hover:border-blue-400/50 dark:hover:border-blue-600/50 shadow-lg hover:shadow-xl inline-block"
            >
              添加第一个客户
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="flex justify-between items-center p-3 md:p-4 bg-white/5 dark:bg-gray-200/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-300/10 hover:bg-white/10 dark:hover:bg-gray-200/10 transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white dark:text-gray-800 truncate">{customer.company_name}</p>
                  <p className="text-sm text-white/60 dark:text-gray-600">{customer.industry || "未分类"}</p>
                </div>
                <Link
                  href={`/edit/${customer.id}`}
                  className="text-blue-300 dark:text-blue-600 hover:text-blue-200 dark:hover:text-blue-700 ml-3 text-sm md:text-base whitespace-nowrap transition-colors"
                >
                  编辑 →
                </Link>
              </div>
            ))}
            <div className="text-center pt-4 border-t border-white/20 dark:border-gray-300/20">
              <Link
                href="/history"
                className="text-blue-300 dark:text-blue-600 hover:text-blue-200 dark:hover:text-blue-700 text-sm transition-colors"
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