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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CoolCRM Dashboard</h1>
        <p className="text-gray-400 mt-2">客户关系管理系统</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">总客户数</h3>
          <p className="text-2xl font-bold text-blue-400">{customers.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <Link href="/add" className="block">
            <h3 className="text-lg font-semibold mb-2">新增客户</h3>
            <p className="text-blue-400 hover:text-blue-300">➕ 点击添加</p>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <Link href="/history" className="block">
            <h3 className="text-lg font-semibold mb-2">历史记录</h3>
            <p className="text-blue-400 hover:text-blue-300">📜 查看全部</p>
          </Link>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">最近客户</h3>
        {loading ? (
          <p className="text-gray-400">加载中...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-400">暂无客户</p>
        ) : (
          <div className="space-y-2">
            {customers.map((customer) => (
              <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{customer.company_name}</p>
                  <p className="text-sm text-gray-400">{customer.industry}</p>
                </div>
                <Link href={`/edit/${customer.id}`} className="text-blue-400 hover:text-blue-300">
                  编辑
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}