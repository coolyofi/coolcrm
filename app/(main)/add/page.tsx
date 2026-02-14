"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/PageHeader"

export default function AddCustomer() {
  const [company, setCompany] = useState("")
  const [industry, setIndustry] = useState("")
  const [intentLevel, setIntentLevel] = useState(1)
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [contact, setContact] = useState("")
  const [notes, setNotes] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [address, setAddress] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [isLocationExpanded, setIsLocationExpanded] = useState(false)
  
  const router = useRouter()

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
        setLatitude(lat)
        setLongitude(lng)

        // Enhanced: Better error handling for reverse geocoding with retry
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`)
          
          if (!response.ok) {
            throw new Error('Geocoding service unavailable')
          }
          
          const data = await response.json()
          const fullAddress = `${data.city || ''} ${data.locality || ''} ${data.principalSubdivision || ''}`.trim()
          setAddress(fullAddress || "")
          toast.success("位置获取成功")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Manual Validation
    if (!company.trim()) {
        toast.error("请填写公司名称")
        return
    }
    if (!industry) {
        toast.error("请选择行业")
        return
    }

    setLoading(true)

    // Enhanced: Better error handling with specific error messages
    try {
      const { error } = await supabase
        .from("customers")
        .insert([{
          company_name: company,
          industry,
          intent_level: intentLevel,
          visit_date: visitDate || null,
          contact,
          notes,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          address: address || null
        }])

      if (error) {
        throw error
      }
      
      toast.success("客户添加成功")
      router.push("/")
    } catch (error) {
      console.error("提交失败:", error)
      // Enhanced: More specific error messages
      const errorMessage = error instanceof Error ? error.message : '未知错误'
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

      <form onSubmit={handleSubmit} className="space-y-8">
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
                    <input
                        type="text"
                        placeholder="请输入公司名称"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all font-normal"
                    />
                </div>

                {/* Industry */}
                <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        行业 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            required
                            className="appearance-none w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
                        >
                            <option value="" disabled>选择行业</option>
                            <option value="科技">科技</option>
                            <option value="金融">金融</option>
                            <option value="医疗">医疗</option>
                            <option value="教育">教育</option>
                            <option value="制造业">制造业</option>
                            <option value="零售">零售</option>
                            <option value="其他">其他</option>
                        </select>
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
                        拜访日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all"
                    />
                </div>

                {/* Intent Level (Segmented Pills) */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        意向等级 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex bg-[var(--surface-solid)] border border-[var(--border)] p-1 rounded-xl">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setIntentLevel(level)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    intentLevel === level
                                        ? "bg-[var(--primary)] text-white shadow-md"
                                        : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass-bg)]"
                                }`}
                            >
                                {level}级
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-[var(--fg-muted)] mt-1.5 text-right px-1">
                        1级(无意向) - 5级(即将成交)
                    </p>
                </div>
                
                 {/* Contact */}
                <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        联系人
                    </label>
                    <input
                        type="text"
                        placeholder="姓名"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all"
                    />
                </div>
                
                {/* Notes */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">
                        备注信息
                    </label>
                    <textarea
                        placeholder="输入客户需求、痛点或后续跟进计划..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all resize-none"
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
                {!isLocationExpanded && !address && !latitude ? (
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
                             <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="自动获取或手动输入"
                                className="w-full px-4 py-2.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-[4px] focus:ring-[var(--primary)]/20 transition-all font-normal"
                             />
                         </div>
                         
                         <div>
                             <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">经度</label>
                             <input type="text" value={longitude} readOnly className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--border)] rounded-xl text-[var(--fg-muted)] text-sm cursor-not-allowed" />
                         </div>
                         <div>
                             <label className="block text-xs font-medium text-[var(--fg-muted)] mb-2">纬度</label>
                             <input type="text" value={latitude} readOnly className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--border)] rounded-xl text-[var(--fg-muted)] text-sm cursor-not-allowed" />
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
