"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AddCustomer() {
  const [company, setCompany] = useState("")
  const [industry, setIndustry] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase
      .from("customers")
      .insert([{ company_name: company, industry }])

    if (error) {
      alert("提交失败")
      console.error(error)
    } else {
      alert("提交成功")
      setCompany("")
      setIndustry("")
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>新增客户</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="公司名称"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div>
          <input
            placeholder="行业"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <button type="submit">提交</button>
      </form>
    </div>
  )
}