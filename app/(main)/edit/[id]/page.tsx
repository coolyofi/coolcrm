"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast, { Toaster } from "react-hot-toast"
import { format, parseISO } from "date-fns"
import useSWR from "swr"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"
import { PageHeader } from "@/components/PageHeader"

const customerSchema = z.object({
  company_name: z.string().min(1, "公司名称不能为空"),
  industry: z.string().optional(),
  intent_level: z.number().min(1).max(5, "意向等级必须在1-5之间"),
  visit_date: z.string().optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  address: z.string().optional(),
})

type CustomerForm = z.infer<typeof customerSchema>

const industries = [
  { value: "", label: "选择行业" },
  { value: "科技", label: "科技" },
  { value: "金融", label: "金融" },
  { value: "医疗", label: "医疗" },
  { value: "教育", label: "教育" },
  { value: "制造业", label: "制造业" },
  { value: "零售", label: "零售" },
  { value: "其他", label: "其他" },
]

export default function EditCustomer() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  
  // Only expand location if there is location data or user wants to add it
  const [isLocationExpanded, setIsLocationExpanded] = useState(false)

  const fetcher = async (id: string) => {
    if (!user) throw new Error("未登录")
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  }

  const { data: customer, error, isLoading, mutate } = useSWR(
    user ? id : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      intent_level: 1,
      visit_date: new Date().toISOString().split('T')[0]
    }
  })

  // Watch location fields to auto-expand section if data exists
  const lat = watch("latitude")
  const addr = watch("address")

  useEffect(() => {
    if (customer) {
      reset({
        company_name: customer.company_name,
        industry: customer.industry || "",
        intent_level: customer.intent_level || 1,
        visit_date: customer.visit_date ? format(parseISO(customer.visit_date), "yyyy-MM-dd") : "",
        contact: customer.contact || "",
        notes: customer.notes || "",
        latitude: customer.latitude?.toString() || "",
        longitude: customer.longitude?.toString() || "",
        address: customer.address || "",
      })
      
      if (customer.latitude || customer.address) {
        setIsLocationExpanded(true)
      }
    }
  }, [customer, reset])

  const onSubmit = async (data: CustomerForm) => {
    setSaving(true)
    
    // Enhanced: Better error handling with specific error messages
    try {
      const updateData = {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        address: data.address || null,
      }

      const { error } = await supabase
        .from("customers")
        .update(updateData)
        .eq("id", id)

      if (error) throw error
      
      toast.success("更新成功")
      mutate()
      router.push("/history")
    } catch (error) {
      console.error("更新失败:", error)
      // Enhanced: More specific error messages
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error("网络错误，请检查连接后重试")
      } else if (errorMessage.includes('not found')) {
        toast.error("客户不存在，可能已被删除")
      } else {
        toast.error(`更新失败: ${errorMessage}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("您的浏览器不支持地理定位")
      return
    }

    setLocationLoading(true)
    setIsLocationExpanded(true)
    
    // Enhanced error handling with better user feedback
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString()
        const lng = position.coords.longitude.toString()
        setValue("latitude", lat)
        setValue("longitude", lng)

        // Enhanced: Better error handling for reverse geocoding
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`)
          
          if (!response.ok) {
            throw new Error('Geocoding service unavailable')
          }
          
          const data = await response.json()
          const fullAddress = `${data.city || ''} ${data.locality || ''} ${data.principalSubdivision || ''}`.trim()
          setValue("address", fullAddress || "")
          toast.success("位置已更新")
        } catch (error) {
          console.error("获取地址失败:", error)
          const errorMessage = error instanceof Error ? error.message : '未知错误'
          toast.error(`地址解析失败 (${errorMessage})，请手动输入`)
        }
        setLocationLoading(false)
      },
      (error) => {
        console.error("获取位置失败:", error)
        // Enhanced: More detailed error messages
        let errorMessage = "获取位置失败"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "位置权限被拒绝，请在浏览器设置中允许位置访问"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "位置信息不可用，请检查设备定位服务"
            break
          case error.TIMEOUT:
            errorMessage = "获取位置超时，请重试"
            break
        }
        toast.error(errorMessage)
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (error || !customer) {
    return (
        <div className="p-8 text-center">
            <p className="text-[var(--danger)] mb-4">{error?.message || "客户不存在"}</p>
            <Link href="/history" className="text-[var(--primary)] hover:underline">返回列表</Link>
        </div>
    )
  }

  return (
    <main className="max-w-[720px] mx-auto min-h-screen p-6 sm:p-8">
      <Toaster position="top-center" />
      
      <PageHeader
        title="编辑客户"
        subtitle="更新客户档案与跟进状态"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section A: Basic Info */}
        <section className="space-y-6">
            <h2 className="text-sm font-semibold text-[var(--fg)] uppercase tracking-wider flex items-center gap-2 after:content-[''] after:h-px after:flex-1 after:bg-[var(--border)]">
                基础信息
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {/* Company Name */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        公司名称 <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="company_name"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all font-normal"
                            />
                        )}
                    />
                    {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
                </div>

                {/* Industry */}
                <div>
                   <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        行业
                   </label>
                   <div className="relative">
                        <Controller
                            name="industry"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="appearance-none w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
                                >
                                    {industries.map(opt => (
                                        <option key={opt.value} value={opt.value} disabled={!opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--fg-muted)]">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                   </div>
                </div>

                {/* Visit Date */}
                <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        最后拜访
                    </label>
                    <Controller
                        name="visit_date"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="date"
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all"
                            />
                        )}
                    />
                </div>

                {/* Intent Level (Segmented Pills) */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        意向等级
                    </label>
                    <Controller
                        name="intent_level"
                        control={control}
                        render={({ field }) => (
                            <div className="flex bg-[var(--surface-solid)] border border-[var(--border)] p-1 rounded-xl">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            field.value === level
                                                ? "bg-[var(--primary)] text-white shadow-md"
                                                : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass-bg)]"
                                        }`}
                                    >
                                        {level}级
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                </div>
                
                 {/* Contact */}
                <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        联系人
                    </label>
                    <Controller
                        name="contact"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all"
                            />
                        )}
                    />
                </div>
                
                {/* Notes */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        备注信息
                    </label>
                    <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                            <textarea
                                {...field}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all resize-none"
                            />
                        )}
                    />
                </div>
            </div>
        </section>

        {/* Section B: Location Info */}
        <section className="space-y-6 pt-2">
             <h2 className="text-sm font-semibold text-[var(--fg)] uppercase tracking-wider flex items-center gap-2 after:content-[''] after:h-px after:flex-1 after:bg-[var(--border)]">
                地理位置
            </h2>
            
            <div className="bg-[var(--glass-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 transition-all">
                {!isLocationExpanded && !lat && !addr ? (
                     <div className="flex flex-col items-center justify-center text-center py-2">
                         <p className="text-sm text-[var(--fg-muted)] mb-4">暂无位置信息</p>
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] text-sm font-medium text-[var(--primary)] hover:border-[var(--primary)] transition-colors shadow-sm"
                        >
                             {locationLoading ? (
                                <>正在获取...</>
                             ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    获取当前位置
                                </>
                             )}
                        </button>
                     </div>
                ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2 flex items-center justify-between mb-2">
                             <span className="text-xs text-[var(--fg-muted)]">位置详情</span>
                             <button type="button" onClick={getCurrentLocation} className="text-xs text-[var(--primary)] hover:underline flex items-center">
                                 <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                 </svg>
                                 更新位置
                             </button>
                         </div>
                         
                         <div className="md:col-span-2">
                             <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">详细地址</label>
                             <Controller
                                name="address"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all font-normal"
                                    />
                                )}
                             />
                         </div>
                         
                         <div>
                             <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">经度</label>
                             <Controller
                                name="longitude"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} readOnly className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--border)] rounded-xl text-[var(--fg-muted)] text-sm cursor-not-allowed" />
                                )}
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">纬度</label>
                             <Controller
                                name="latitude"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} readOnly className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--border)] rounded-xl text-[var(--fg-muted)] text-sm cursor-not-allowed" />
                                )}
                             />
                         </div>
                     </div>
                )}
            </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--border)] mt-8">
            <Link 
                href="/history" 
                className="px-6 py-2.5 rounded-full border border-[var(--border)] text-[var(--fg-muted)] font-medium text-sm hover:bg-[var(--glass-bg)] hover:text-[var(--fg)] transition-all"
            >
                取消
            </Link>
            <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white font-medium text-sm hover:brightness-110 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center"
            >
                {saving ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        保存中...
                    </>
                ) : (
                    "保存更改"
                )}
            </button>
        </div>

      </form>
    </main>
  )
}
