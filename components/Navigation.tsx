"use client"

import Link from "next/link"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // 关闭移动菜单
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  if (loading) {
    return (
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 hidden md:block">
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
    return null
  }

  return (
    <>
      {/* 移动端菜单按钮 */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-gray-900 text-white p-2 rounded-lg shadow-lg border border-gray-700"
          aria-label="打开菜单"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 移动端遮罩 */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:block
      `}>
        <div className="flex flex-col h-full p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">CoolCRM</h1>
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-white text-sm transition p-1"
              title="登出"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex flex-col gap-2 flex-1">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="hover:text-white text-gray-400 transition px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/add"
              onClick={closeMobileMenu}
              className="hover:text-white text-gray-400 transition px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              ➕ 新增客户
            </Link>
            <Link
              href="/history"
              onClick={closeMobileMenu}
              className="hover:text-white text-gray-400 transition px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              📋 历史记录
            </Link>
            <Link
              href="/visits"
              onClick={closeMobileMenu}
              className="hover:text-white text-gray-400 transition px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              📍 拜访记录
            </Link>
            <Link
              href="/settings"
              onClick={closeMobileMenu}
              className="hover:text-white text-gray-400 transition px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              ⚙️ 设置
            </Link>
          </nav>

          {/* 用户信息 */}
          <div className="mt-auto pt-6 border-t border-gray-800">
            <div className="text-sm text-gray-500 truncate">
              欢迎，{user.email}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}