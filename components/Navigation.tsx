"use client"

import Link from "next/link"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </aside>
    )
  }

  if (!user) {
    return null // 或者返回一个简化的导航栏
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">CoolCRM</h1>
        <button
          onClick={signOut}
          className="text-gray-400 hover:text-white text-sm transition"
          title="登出"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-4">
        <Link href="/" className="hover:text-white text-gray-400 transition">
          Dashboard
        </Link>
        <Link href="/add" className="hover:text-white text-gray-400 transition">
          新增客户
        </Link>
        <Link href="/history" className="hover:text-white text-gray-400 transition">
          历史记录
        </Link>
      </nav>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <div className="text-sm text-gray-500">
          欢迎，{user.email}
        </div>
      </div>
    </aside>
  )
}