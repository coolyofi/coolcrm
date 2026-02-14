"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"

export default function AddCustomer() {
  const [company, setCompany] = useState("")
  const [industry, setIndustry] = useState("")
  const [intentLevel, setIntentLevel] = useState(1)
  const [visitDate, setVisitDate] = useState("")
  const [contact, setContact] = useState("")
  const [notes, setNotes] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const router = useRouter()

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("您的浏览器不支持地理定位")
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString()
        const lng = position.coords.longitude.toString()
        setLatitude(lat)
        setLongitude(lng)

        // 使用反向地理编码获取地址
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`)
          const data = await response.json()
          const fullAddress = `${data.city || ''} ${data.locality || ''} ${data.principalSubdivision || ''}`.trim()
          setAddress(fullAddress || "获取地址失败，请手动输入")
          toast.success("位置获取成功")
        } catch (error) {
          console.error("获取地址失败:", error)
          setAddress("获取地址失败，请手动输入")
          toast.error("地址解析失败，请手动输入地址")
        }
        setLocationLoading(false)
      },
      (error) => {
        console.error("获取位置失败:", error)
        let errorMessage = "获取位置失败"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "位置权限被拒绝，请允许浏览器访问您的位置"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "位置信息不可用"
            break
          case error.TIMEOUT:
            errorMessage = "获取位置超时，请重试"
            break
        }
        toast.error(errorMessage)
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 } // 5分钟缓存
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
        toast.error("提交失败: " + error.message)
        console.error(error)
      } else {
        toast.success("客户添加成功")
        // 重置表单
        setCompany("")
        setIndustry("")
        setIntentLevel(1)
        setVisitDate("")
        setContact("")
        setNotes("")
        setLatitude("")
        setLongitude("")
        setAddress("")
        router.push("/")
      }
    } catch (error) {
      toast.error("网络错误，请重试")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0">
        <div className="pt-4 md:pt-0">
          <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm">新增客户</h1>
          <p className="text-white/60 mt-1 text-sm md:text-base">添加新客户信息</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 md:p-6 space-y-4 md:space-y-4 shadow-lg">
          <div>
            <label className="block text-sm font-medium mb-2">公司名称 *</label>
            <input
              type="text"
              placeholder="请输入公司名称"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">行业</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300"
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
                className="w-full px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">拜访日期</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">联系人</label>
              <input
                type="text"
                placeholder="请输入联系人姓名"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">备注</label>
            <textarea
              placeholder="请输入备注信息"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">地理位置</label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="w-full md:w-auto px-6 py-3 bg-green-500/20 backdrop-blur-xl hover:bg-green-500/30 disabled:bg-gray-500/20 text-green-200 hover:text-green-100 disabled:text-gray-400 font-medium rounded-xl transition-all duration-300 border border-green-400/30 hover:border-green-400/50 disabled:border-gray-400/30 shadow-lg hover:shadow-xl"
              >
                {locationLoading ? "获取中..." : "获取当前位置"}
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="纬度"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
                />
                <input
                  type="text"
                  placeholder="经度"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
                />
              </div>
              <input
                type="text"
                placeholder="详细地址（可手动调整）"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 text-base bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500/20 backdrop-blur-xl hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-200 hover:text-blue-100 disabled:text-gray-400 font-medium py-4 px-6 rounded-xl transition-all duration-300 border border-blue-400/30 hover:border-blue-400/50 disabled:border-gray-400/30 shadow-lg hover:shadow-xl text-lg"
          >
            {loading ? "提交中..." : "提交"}
          </button>
        </form>
      </div>
    </>
  )
}