"use client"

import { useEffect, useState, useMemo } from "react"
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
  latitude: number | null
  longitude: number | null
  address: string | null
}

export default function History() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("")

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

  // 使用useMemo优化过滤性能
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
    fetchData()
  }, [])

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
          <h1 className="text-2xl font-semibold text-white drop-shadow-sm">历史记录</h1>
          <p className="text-white/60 text-sm mt-1">
            所有已录入的客户信息 ({filteredCustomers.length} 个客户)
          </p>
        </div>
        <Link
          href="/add"
          className="bg-blue-500/20 backdrop-blur-xl hover:bg-blue-500/30 text-blue-200 hover:text-blue-100 px-4 py-2 rounded-xl transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50 shadow-lg hover:shadow-xl"
        >
          新增客户
        </Link>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/90">搜索</label>
            <input
              type="text"
              placeholder="搜索公司名称或联系人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white/90">行业筛选</label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300"
            >
              <option value="">全部行业</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6 text-center text-gray-400">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p>加载中...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            {customers.length === 0 ? "暂无数据" : "没有匹配的客户"}
          </div>
        ) : (
          <>
            {/* 桌面端表格 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/70">
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
                      className="border-t border-white/10 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{c.company_name}</p>
                          {c.notes && <p className="text-xs text-gray-500 mt-1">{c.notes.slice(0, 50)}...</p>}
                        </div>
                      </td>
                      <td className="p-4 text-white/70">
                        {c.industry || "-"}
                      </td>
                      <td className="p-4 text-white/70">
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
                      <td className="p-4 text-white/70">
                        {c.visit_date ? new Date(c.visit_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/edit/${c.id}`}
                            className="text-blue-300 hover:text-blue-200 transition-colors"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-300 hover:text-red-200 transition-colors"
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

            {/* 移动端卡片布局 */}
            <div className="md:hidden space-y-4">
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-white">{c.company_name}</h3>
                      {c.notes && (
                        <p className="text-sm text-white/60 mt-1">{c.notes.slice(0, 80)}...</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs ml-2 ${
                      c.intent_level >= 4 ? 'bg-green-600/20 text-green-400' :
                      c.intent_level >= 3 ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      意向 {c.intent_level}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">行业：</span>
                      <span className="text-white/80">{c.industry || "-"}</span>
                    </div>
                    <div>
                      <span className="text-white/60">联系人：</span>
                      <span className="text-white/80">{c.contact || "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/60">拜访日期：</span>
                      <span className="text-white/80">
                        {c.visit_date ? new Date(c.visit_date).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-white/10">
                    <Link
                      href={`/edit/${c.id}`}
                      className="flex-1 bg-blue-500/20 backdrop-blur-xl hover:bg-blue-500/30 text-blue-200 hover:text-blue-100 text-center py-2 px-4 rounded-xl transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50 shadow-lg hover:shadow-xl text-sm font-medium"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex-1 bg-red-500/20 backdrop-blur-xl hover:bg-red-500/30 text-red-200 hover:text-red-100 py-2 px-4 rounded-xl transition-all duration-300 border border-red-400/30 hover:border-red-400/50 shadow-lg hover:shadow-xl text-sm font-medium"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}