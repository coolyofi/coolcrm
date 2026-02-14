"use client"

import { useState } from "react"
import toast from "react-hot-toast"

interface LocationData {
  latitude: string
  longitude: string
  address: string
}

interface LocationPickerProps {
  latitude: string
  longitude: string
  address: string
  onLocationChange: (data: LocationData) => void
  disabled?: boolean
}

export function LocationPicker({
  latitude,
  longitude,
  address,
  onLocationChange,
  disabled = false
}: LocationPickerProps) {
  const [locationLoading, setLocationLoading] = useState(false)

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

        // 使用反向地理编码获取地址
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`
          )
          const data = await response.json()
          const fullAddress = `${data.city || ''} ${data.locality || ''} ${data.principalSubdivision || ''}`.trim()

          onLocationChange({
            latitude: lat,
            longitude: lng,
            address: fullAddress || "获取地址失败，请手动输入"
          })
          toast.success("位置获取成功")
        } catch (error) {
          console.error("获取地址失败:", error)
          onLocationChange({
            latitude: lat,
            longitude: lng,
            address: "获取地址失败，请手动输入"
          })
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

  return (
    <div>
      <label className="block text-sm font-medium mb-2">地理位置</label>
      <div className="space-y-2">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={locationLoading || disabled}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition"
        >
          {locationLoading ? "获取中..." : "获取当前位置"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="纬度"
            value={latitude}
            onChange={(e) => onLocationChange({ latitude: e.target.value, longitude, address })}
            disabled={disabled}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="经度"
            value={longitude}
            onChange={(e) => onLocationChange({ latitude, longitude: e.target.value, address })}
            disabled={disabled}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <input
          type="text"
          placeholder="详细地址（可手动调整）"
          value={address}
          onChange={(e) => onLocationChange({ latitude, longitude, address: e.target.value })}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>
    </div>
  )
}