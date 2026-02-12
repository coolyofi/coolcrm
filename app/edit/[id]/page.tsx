"use client"

import { useState, useEffect, useMemo, memo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast, { Toaster } from "react-hot-toast"
import { format, parseISO } from "date-fns"
import useSWR from "swr"
import { User } from "@supabase/supabase-js"
import ErrorBoundary from "@/components/ErrorBoundary"

const customerSchema = z.object({
  company_name: z.string().min(1, "公司名称不能为空"),
  industry: z.string().optional(),
  intent_level: z.number().min(1).max(5, "意向等级必须在1-5之间"),
  visit_date: z.string().optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
})

type CustomerForm = z.infer<typeof customerSchema>

interface Customer extends CustomerForm {
  id: string
}

const industries = [
  { value: "", label: "请选择行业" },
  { value: "科技", label: "科技" },
  { value: "金融", label: "金融" },
  { value: "医疗", label: "医疗" },
  { value: "教育", label: "教育" },
  { value: "制造业", label: "制造业" },
  { value: "零售", label: "零售" },
  { value: "其他", label: "其他" },
]

const FormField = memo(({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) => (
  <div>
    <label className="block text-sm font-medium mb-2" aria-label={label}>
      {label}
    </label>
    {children}
    {error && <p className="text-red-400 text-sm mt-1" role="alert">{error}</p>}
  </div>
))

FormField.displayName = "FormField"

const fetcher = async (id: string) => {
  const { data: userData } = await supabase.auth.getUser()
  const user = (userData as any)?.user
  if (!user) throw new Error("未登录")

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()
  if (error) throw error
  return data
}

export default function EditCustomer() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) router.push("/login")
    }
    getUser()
  }, [router])

  const { data: customer, error, isLoading, mutate } = useSWR(id, fetcher, {
    revalidateOnFocus: false,
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  })

  useEffect(() => {
    if (customer) {
      reset({
        company_name: customer.company_name,
        industry: customer.industry,
        intent_level: customer.intent_level,
        visit_date: customer.visit_date ? format(parseISO(customer.visit_date), "yyyy-MM-dd") : "",
        contact: customer.contact,
        notes: customer.notes,
      })
    }
  }, [customer, reset])

  const onSubmit = async (data: CustomerForm) => {
    if (!customer) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", id)
        .eq("user_id", (user as User)?.id)

      if (error) throw error
      toast.success("更新成功")
      mutate()
      router.push("/history")
    } catch (error) {
      toast.error("更新失败: " + (error as Error).message)
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const memoizedIndustries = useMemo(() => industries, [])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-6" aria-live="polite">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-400" role="alert">加载失败: {error.message}</div>
  }

  if (!customer) {
    return <div className="p-6 text-red-400" role="alert">客户不存在</div>
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">编辑客户</h1>
          <p className="text-gray-400 mt-1">修改客户信息</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4" noValidate>
          <FormField label="公司名称 *" error={errors.company_name?.message}>
            <Controller
              name="company_name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  required
                  aria-describedby={errors.company_name ? "company_name_error" : undefined}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </FormField>

          <FormField label="行业">
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  aria-label="选择行业"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {memoizedIndustries.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </FormField>

          <FormField label="意向等级 (1-5)" error={errors.intent_level?.message}>
            <Controller
              name="intent_level"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="1"
                  max="5"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  aria-describedby={errors.intent_level ? "intent_level_error" : undefined}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </FormField>

          <FormField label="拜访日期">
            <Controller
              name="visit_date"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  aria-label="选择拜访日期"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </FormField>

          <FormField label="联系人">
            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  aria-label="输入联系人"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </FormField>

          <FormField label="备注">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  aria-label="输入备注"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </FormField>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              aria-disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  )
}
