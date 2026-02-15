"use client"

import Link from "next/link"
import { useNavigation } from "./NavigationProvider"
import { usePathname, useRouter } from "next/navigation"
import { useScrollProgress } from "../../hooks/useScrollProgress"
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { isDemo, disableDemo } from '@/lib/demo'
import { UI_CONTRACT, NAV_LAYOUT } from "./constants"

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

/**
 * TopBar - Mobile topbar with menu, title, and primary action
 * 
 * Requirements:
 * - Only renders on mobile (NavigationRoot handles this)
 * - Menu button opens drawer
 * - Title collaborates with LargeTitle (future feature)
 * - Primary action (+ button) for quick add
 * - Height from tokens
 */
export function TopBar() {
  const { deviceMode, navMode, openDrawer, motion, isHydrated, topbarHeight } = useNavigation()
  const pathname = usePathname()
  const router = useRouter()
  const [demoEnabled, setDemoEnabled] = useState(false)
  const { p } = useScrollProgress("content-scroll", UI_CONTRACT.PAGE_HEADER_SCROLL_DISTANCE)

  useEffect(() => {
    setDemoEnabled(isDemo())
  }, [])

  const getCompactTitle = () => {
    if (pathname === '/') return '仪表板'
    if (pathname.startsWith('/add')) return '添加客户'
    if (pathname.startsWith('/edit')) return '编辑客户'
    if (pathname.startsWith('/history')) return '历史记录'
    if (pathname.startsWith('/settings')) return '设置'
    if (pathname.startsWith('/visits')) return '拜访记录'
    return 'CoolCRM'
  }

  const compactOpacity = clamp((p - 0.2) / 0.8, 0, 1)
  
  // Large title collapse: interpolate between large and compact heights
  const titleProgress = Math.min(1, p)
  const barHeight = motion.largeTitleEnabled
    ? (topbarHeight - (titleProgress * (topbarHeight - NAV_LAYOUT.TOPBAR.COLLAPSED_PX)))
    : NAV_LAYOUT.TOPBAR.COLLAPSED_PX

  // Only show on mobile, but hide during hydration to prevent mismatch
  if (!isHydrated || deviceMode !== "mobile") return null

  return (
    <div
      className="fixed left-0 right-0 glass scrolled border-b border-[var(--glass-border)] flex items-center justify-between px-4 safe-area-top backdrop-blur-md bg-[var(--glass-bg)] transition-all duration-200"
      style={{
        top: (demoEnabled && deviceMode !== 'mobile') ? '48px' : '0px',
        height: `${barHeight}px`,
        zIndex: 'var(--z-topbar)',
        "--glass-blur-scrolled": `${motion.topbarBlurPx}px`,
        opacity: motion.topbarAlpha
      } as React.CSSProperties}
    >
      {/* Menu Trigger - only show in drawer mode */}
      {navMode === 'drawer' && (
        <button 
          onClick={openDrawer}
          className="p-2 -ml-2 text-[var(--fg)] active:scale-95 transition-transform"
          aria-label="Open Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Compact Title */}
      <span 
        className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)] transition-opacity duration-200"
        style={{ opacity: compactOpacity }}
      >
        {getCompactTitle()}
      </span>

      {/* Quick Action */}
      <div className="flex items-center gap-3">
        <Link 
          href="/add" 
          className="p-2 -mr-2 text-[var(--primary)] active:scale-95 transition-transform"
          aria-label="Add New"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>

        {/* Demo mode indicator */}
        {demoEnabled ? (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-medium">演示模式</span>
            <button
              onClick={() => {
                disableDemo()
                toast('已退出演示模式')
                router.push('/login')
              }}
              className="text-xs text-[var(--fg-muted)] px-2 py-1 rounded hover:bg-white/5"
            >退出</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
