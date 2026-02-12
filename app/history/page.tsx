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
  }

  const handleDelete = async (id: string) => {
    await supabase.from("customers").delete().eq("id", id)
    fetchData()
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>历史记录</h2>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>公司</th>
            <th>行业</th>
            <th>意向等级</th>
            <th>拜访日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.company_name}</td>
              <td>{c.industry}</td>
              <td>{c.intent_level}</td>
              <td>{c.visit_date}</td>
              <td>
                <button onClick={() => handleDelete(c.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}