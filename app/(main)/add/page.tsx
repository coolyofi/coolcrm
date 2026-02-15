"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/PageHeader"
import { showDemoBlockedToast } from '@/components/DemoBlockedToast'

const customerSchema = z.object({
  company_name: z.string().min(1, "公司名称不能为空"),
  industry: z.string().min(1, "请选择行业"),
  intent_level: z.number().min(1).max(5, "意向等级必须在1-5之间"),
  visit_date: z.string().min(1, "请选择拜访日期"),
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

export default function AddCustomer() {
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [isLocationExpanded, setIsLocationExpanded] = useState(false)
  
  const router = useRouter()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("您的浏览器不支持地理定位")
      return
    }

    setLocationLoading(true)
    setIsLocationExpanded(true)
    
    // Enhanced error handling with retry capability
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString()
        const lng = position.coords.longitude.toString()
        setValue("latitude", lat)
        setValue("longitude", lng)

        // 使用高德地图逆地理编码API - 获取详细地址信息
        try {
          const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY || 'your_amap_key_here'
          const response = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${lng},${lat}&extensions=all&roadlevel=1`)
          
          if (!response.ok) {
            throw new Error(`高德地图服务不可用 (status: ${response.status})`)
          }
          
          const data = await response.json()
          if (data.status === '1' && data.regeocode) {
            // 优先使用格式化的完整地址
            let address = data.regeocode.formatted_address
            
            // 如果有更详细的POI信息，尝试构建更精确的地址
            if (data.regeocode.pois && data.regeocode.pois.length > 0) {
              const nearestPoi = data.regeocode.pois[0]
              if (nearestPoi.name && nearestPoi.address) {
                address = `${nearestPoi.name}(${nearestPoi.address})`
              }
            }
            
            // 如果没有POI信息，使用地址组件构建详细地址
            if (!address || address === data.regeocode.formatted_address) {
              const addrComp = data.regeocode.addressComponent
              const parts = [
                addrComp.province,
                addrComp.city,
                addrComp.district,
                addrComp.township,
                addrComp.streetNumber?.street || addrComp.neighborhood,
                addrComp.streetNumber?.number
              ].filter(Boolean)
              address = parts.join('') || data.regeocode.formatted_address
            }
            
            setValue("address", address)
            toast.success("位置获取成功")
          } else {
            throw new Error(data.info || '地址解析失败')
          }
        } catch (error) {
          console.error("获取地址失败:", error)
          // More specific error message
          const errorMessage = error instanceof Error ? error.message : '未知错误'
          toast.error(`自动获取地址失败 (${errorMessage})，请手动输入`)
        }
        setLocationLoading(false)
      },
      (error) => {
        console.error("获取位置失败:", error)
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

  const onSubmit = async (data: CustomerForm) => {
    setLoading(true)
    

    // Enhanced: Better error handling with specific error messages
    try {
      // Prefer using API wrapper to respect demo-mode guards
      const { createCustomer } = await import('@/lib/api/customers')
      await createCustomer({
        company_name: data.company_name,
        industry: data.industry,
        intent_level: data.intent_level,
        visit_date: data.visit_date || null,
        contact: data.contact || null,
        notes: data.notes || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        address: data.address || null
      })
      
      toast.success("客户添加成功")
      router.push("/")
    } catch (error) {
      console.error("提交失败:", error)
      // Enhanced: More specific error messages
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      // Demo mode handling: redirect to login/register when API layer blocks writes
      if (error && (error as any).name === 'DemoModeError') {
        showDemoBlockedToast(() => router.push('/login'))
        setLoading(false)
        return
      }
      if (errorMessage.includes('duplicate')) {
        toast.error("客户已存在，请检查后重试")
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error("网络错误，请检查连接后重试")
      } else {
        toast.error(`提交失败: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-[720px] mx-auto min-h-screen p-6 sm:p-8">
      <Toaster position="top-center" />
      
      <PageHeader
        title="新增客户"
        subtitle="录入新的拜访与意向信息"
      />

      <div className="mt-12"></div> {/* 增加呼吸空间 */}

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
                                placeholder="请输入公司名称"
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all font-normal"
                            />
                        )}
                    />
                    {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
                </div>

                {/* Industry */}
                <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        行业 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Controller
                            name="industry"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    required
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
                    {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
                </div>

                {/* Visit Date */}
                <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        拜访日期 <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="visit_date"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="date"
                                required
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all"
                            />
                        )}
                    />
                    {errors.visit_date && <p className="text-red-500 text-xs mt-1">{errors.visit_date.message}</p>}
                </div>

                {/* Intent Level (Segmented Pills) */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        意向等级 <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="intent_level"
                        control={control}
                        render={({ field }) => (
                            <div className="flex bg-[var(--surface-solid)] border border-[var(--border)] p-1 rounded-xl">
                                {[
                                    { level: 1, label: "初步接触" },
                                    { level: 2, label: "有兴趣" },
                                    { level: 3, label: "正在考虑" },
                                    { level: 4, label: "高度意向" },
                                    { level: 5, label: "即将成交" }
                                ].map(({ level, label }) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => field.onChange(level)}
                                        className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                                            field.value === level
                                                ? "bg-[var(--primary)] text-white shadow-md"
                                                : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass-bg)]"
                                        }`}
                                        title={`${level}级: ${label}`}
                                    >
                                        {level}级<br/>{label}
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                    {errors.intent_level && <p className="text-red-500 text-xs mt-1">{errors.intent_level.message}</p>}
                    <p className="text-xs text-[var(--fg-muted)] mt-1.5 text-center">
                        选择客户对产品的意向程度，1级最低，5级最高
                    </p>
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
                                placeholder="姓名"
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
                                placeholder="输入客户需求、痛点或后续跟进计划..."
                                rows={3}
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all resize-none"
                            />
                        )}
                    />
                </div>
            </div>
        </section>

        {/* Section B: Location Info (Collapsible-ish) */}
        <section className="space-y-6 pt-2">
             <h2 className="text-sm font-semibold text-[var(--fg)] uppercase tracking-wider flex items-center gap-2 after:content-[''] after:h-px after:flex-1 after:bg-[var(--border)]">
                地理位置
            </h2>
            
            <div className="bg-[var(--glass-bg)] border border-[var(--border)] rounded-2xl p-5 md:p-6 transition-all">
                {!isLocationExpanded && !lat && !addr ? (
                     <div className="flex flex-col items-center justify-center text-center py-2">
                        <p className="text-sm text-[var(--fg-muted)] mb-4">记录当前位置有助于地图模式分析</p>
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] text-sm font-medium text-[var(--primary)] hover:border-[var(--primary)] transition-colors shadow-sm"
                        >
                             {locationLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    正在获取位置...
                                </>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                         <div className="md:col-span-2 flex items-center justify-between mb-2">
                             <span className="text-xs text-[var(--fg-muted)]">已启用位置服务</span>
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
                                        placeholder="自动获取或手动输入"
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
                href="/" 
                className="px-6 py-2.5 rounded-full border border-[var(--border)] text-[var(--fg-muted)] font-medium text-sm hover:bg-[var(--glass-bg)] hover:text-[var(--fg)] transition-all"
            >
                取消
            </Link>
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white font-medium text-sm hover:brightness-110 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center"
            >
                {loading ? (
                    <>
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中
                    </>
                ) : (
                    "确认添加"
                )}
            </button>
        </div>

      </form>
    </main>
  )
}
