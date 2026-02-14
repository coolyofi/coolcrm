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
      <aside className="w-64 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 p-6 hidden md:block">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 dark:bg-gray-700/20 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-white/20 dark:bg-gray-700/20 rounded"></div>
            <div className="h-4 bg-white/20 dark:bg-gray-700/20 rounded"></div>
            <div className="h-4 bg-white/20 dark:bg-gray-700/20 rounded"></div>
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
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl text-white dark:text-gray-800 p-3 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/20 transform transition-all duration-200 hover:scale-110 active:scale-95"
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
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
          onClick={closeMobileMenu}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-48 md:w-64 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20
        transform transition-all duration-300 ease-in-out shadow-2xl shadow-black/20 dark:shadow-gray-900/20
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:block
      `}>
        <div className="flex flex-col h-full p-4 md:p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-sm">
              CoolCRM
            </h1>
            <button
              onClick={signOut}
              className="text-white/70 dark:text-gray-600 hover:text-white dark:hover:text-gray-800 text-sm transition-all duration-200 p-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-200 backdrop-blur-sm border border-white/10 dark:border-gray-300"
              title="登出"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex flex-col gap-1 md:gap-2 flex-1">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 hover:text-white dark:hover:text-gray-800 text-white/70 dark:text-gray-600 transition-all duration-200 px-3 py-3 md:py-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-200 backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-gray-300 hover:shadow-lg transform hover:scale-105"
            >
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <Link
              href="/add"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 hover:text-white dark:hover:text-gray-800 text-white/70 dark:text-gray-600 transition-all duration-200 px-3 py-3 md:py-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-200 backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-gray-300 hover:shadow-lg transform hover:scale-105"
            >
              <span className="hidden md:inline">新增客户</span>
            </Link>
            <Link
              href="/history"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 hover:text-white dark:hover:text-gray-800 text-white/70 dark:text-gray-600 transition-all duration-200 px-3 py-3 md:py-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-200 backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-gray-300 hover:shadow-lg transform hover:scale-105"
            >
              <span className="hidden md:inline">历史记录</span>
            </Link>
            <Link
              href="/visits"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 hover:text-white dark:hover:text-gray-800 text-white/70 dark:text-gray-600 transition-all duration-200 px-3 py-3 md:py-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-200 backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-gray-300 hover:shadow-lg transform hover:scale-105"
            >
              <span className="hidden md:inline">拜访记录</span>
            </Link>
            <Link
              href="/settings"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 hover:text-white dark:hover:text-gray-800 text-white/70 dark:text-gray-600 transition-all duration-200 px-3 py-3 md:py-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-200 backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-gray-300 hover:shadow-lg transform hover:scale-105"
            >
              <span className="hidden md:inline">设置</span>
            </Link>
          </nav>

          {/* 用户信息 */}
          <div className="mt-auto pt-4 md:pt-6 border-t border-white/20 dark:border-gray-700/20">
            <div className="text-xs md:text-sm text-white/60 dark:text-gray-500 truncate drop-shadow-sm">
              欢迎，{user.email}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}