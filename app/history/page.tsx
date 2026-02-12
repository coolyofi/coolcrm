"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Customer {
  id: string
  company_name: string
  industry: string
  intent_level: number
  visit_date: string
  contact: string
  notes: string
}

export default function History() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, industryFilter])

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

  const filterCustomers = () => {
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

    setFilteredCustomers(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个客户吗？")) return

    const { error } = await supabase.from("customers").delete().eq("id", id)
    if (error) {
      alert("删除失败")
      console.error(error)
    } else {
      fetchData()
    }
  }

  const uniqueIndustries = Array.from(new Set(customers.map(c => c.industry).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">历史记录</h1>
          <p className="text-gray-400 text-sm mt-1">
            所有已录入的客户信息 ({filteredCustomers.length} 个客户)
          </p>
        </div>
        <Link
          href="/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          新增客户
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">搜索</label>
            <input
              type="text"
              placeholder="搜索公司名称或联系人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">行业筛选</label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部行业</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-400">加载中...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6 text-gray-400">
            {customers.length === 0 ? "暂无数据" : "没有匹配的客户"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="p-4 text-left">公司</th>
                  <th className="p-4 text-left">行业</th>
                  <th className="p-4 text-left">联系人</th>
                  <th className="p-4 text-left">意向</th>
                  <th className="p-4 text-left">日期</th>
                  <th className="p-4 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-gray-800 hover:bg-gray-800/50 transition"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{c.company_name}</p>
                        {c.notes && <p className="text-xs text-gray-500 mt-1">{c.notes.slice(0, 50)}...</p>}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {c.industry || "-"}
                    </td>
                    <td className="p-4 text-gray-400">
                      {c.contact || "-"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs ${
                        c.intent_level >= 4 ? 'bg-green-600/20 text-green-400' :
                        c.intent_level >= 3 ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {c.intent_level}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {c.visit_date ? new Date(c.visit_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/edit/${c.id}`}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          删除
                        </button>
                      </div>
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