"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AddCustomer() {
  const [company, setCompany] = useState("")
  const [industry, setIndustry] = useState("")
  const [intentLevel, setIntentLevel] = useState(1)
  const [visitDate, setVisitDate] = useState("")
  const [contact, setContact] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from("customers")
      .insert([{
        company_name: company,
        industry,
        intent_level: intentLevel,
        visit_date: visitDate || null,
        contact,
        notes
      }])

    if (error) {
      alert("提交失败: " + error.message)
      console.error(error)
    } else {
      alert("提交成功")
      setCompany("")
      setIndustry("")
      setIntentLevel(1)
      setVisitDate("")
      setContact("")
      setNotes("")
      router.push("/")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">新增客户</h1>
        <p className="text-gray-400 mt-1">添加新客户信息</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">公司名称 *</label>
          <input
            type="text"
            placeholder="请输入公司名称"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">行业</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择行业</option>
            <option value="科技">科技</option>
            <option value="金融">金融</option>
            <option value="医疗">医疗</option>
            <option value="教育">教育</option>
            <option value="制造业">制造业</option>
            <option value="零售">零售</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">意向等级 (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={intentLevel}
            onChange={(e) => setIntentLevel(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">拜访日期</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">联系人</label>
          <input
            type="text"
            placeholder="请输入联系人姓名"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">备注</label>
          <textarea
            placeholder="请输入备注信息"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {loading ? "提交中..." : "提交"}
        </button>
      </form>
    </div>
  )
}