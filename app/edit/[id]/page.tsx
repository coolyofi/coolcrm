"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function EditCustomer() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const fetchCustomer = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      alert("加载失败")
      console.error(error)
    } else {
      setCustomer(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setSaving(true)
    const { error } = await supabase
      .from("customers")
      .update({
        company_name: customer.company_name,
        industry: customer.industry,
        intent_level: customer.intent_level,
        visit_date: customer.visit_date,
        contact: customer.contact,
        notes: customer.notes
      })
      .eq("id", id)

    if (error) {
      alert("更新失败: " + error.message)
      console.error(error)
    } else {
      alert("更新成功")
      router.push("/history")
    }
    setSaving(false)
  }

  const handleChange = (field: keyof Customer, value: string | number) => {
    if (customer) {
      setCustomer({ ...customer, [field]: value })
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">加载中...</div>
  }

  if (!customer) {
    return <div className="p-6 text-red-400">客户不存在</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">编辑客户</h1>
        <p className="text-gray-400 mt-1">修改客户信息</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">公司名称 *</label>
          <input
            type="text"
            value={customer.company_name}
            onChange={(e) => handleChange("company_name", e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">行业</label>
          <select
            value={customer.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
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
            value={customer.intent_level}
            onChange={(e) => handleChange("intent_level", Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">拜访日期</label>
          <input
            type="date"
            value={customer.visit_date || ""}
            onChange={(e) => handleChange("visit_date", e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">联系人</label>
          <input
            type="text"
            value={customer.contact || ""}
            onChange={(e) => handleChange("contact", e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">备注</label>
          <textarea
            value={customer.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}