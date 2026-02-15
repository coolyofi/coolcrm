"use client"

import React from 'react'
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useNavigation } from "./NavigationProvider"
import { TopBar } from "./TopBar"
import { NavigationRoot } from "./NavigationRoot"
import { MotionLevelToggle } from "../MotionLevelToggle"
import { useScrollProgress } from "../../hooks/useScrollProgress"
import { UI_CONTRACT, NAV_LAYOUT } from "./constants"
import { isDemo } from '@/lib/demo'
import showDemoBlockedToast from '../DemoBlockedToast'

/**
 * AppShell - OS Layer Three-Layer Structure
 *
 * Enforces the contract:
 * 1. NavigationLayer (fixed, managed by NavigationRoot)
 * 2. TopBarLayer (fixed, only on mobile)
 * 3. ContentScroll (only scrollable container)
 *
 * Rules:
 * - Body never scrolls (locked in globals.css)
 * - Only #content-scroll scrolls
 * - Content has proper offset for topbar/sidebar
 * - z-index uses tokens (no magic numbers)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { deviceMode, sidebarState, motion, isHydrated, topbarHeight, drawerOpen } = useNavigation()
  const pathname = usePathname()
  const { p } = useScrollProgress("content-scroll", UI_CONTRACT.PAGE_HEADER_SCROLL_DISTANCE)

  // Enforce "body" never scrolls — AppShell makes #content-scroll the only scroll container
  // The effect must be declared unconditionally to keep Hooks order stable across renders.
  useEffect(() => {
    if (pathname === '/login' || !isHydrated) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [pathname, isHydrated])

  // Demo mode: intercept clicks on buttons and form submits to show registration toast
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isDemo()) return

    const container = document.getElementById('content-scroll')
    if (!container) return

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const actionable = target.closest('button, input[type="submit"], [data-demo-block]') as HTMLElement | null
      if (!actionable) return

      // Allow buttons that only toggle UI without writes by opting out with data-demo-allow
      if (actionable.hasAttribute('data-demo-allow')) return

      e.preventDefault()
      e.stopPropagation()
      showDemoBlockedToast(() => {
        window.location.href = '/login'
      })
    }

    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement
      if (!form) return
      if (form.hasAttribute('data-demo-allow')) return
      e.preventDefault()
      e.stopPropagation()
      showDemoBlockedToast(() => { window.location.href = '/login' })
    }

    container.addEventListener('click', onClick, true)
    container.addEventListener('submit', onSubmit, true)

    return () => {
      container.removeEventListener('click', onClick, true)
      container.removeEventListener('submit', onSubmit, true)
    }
  }, [isHydrated])

  // Don't wrap login page with shell. Also avoid rendering shell until
  // hydration completes to keep server and client markup identical on first load.
  if (pathname === '/login' || !isHydrated) {
    return <>{children}</>
  }

  // During hydration, avoid assuming desktop on the server (prevents desktop->mobile jump).
  // Use a mobile-first default until the client hydrates and determines the real mode.
  const safeMode = isHydrated ? deviceMode : "mobile"
  const safeSidebar = isHydrated ? sidebarState : "collapsed"

  // Calculate content margin based on navigation state
  const getContentMarginLeft = () => {
    if (safeMode === "mobile") return "0px"
    if (safeMode === "tablet") return safeSidebar === "expanded" ? `${NAV_LAYOUT.WIDTH.EXPANDED}px` : `${NAV_LAYOUT.WIDTH.ICON}px`
    if (safeMode === "desktop") return safeSidebar === "expanded" ? `${NAV_LAYOUT.WIDTH.EXPANDED}px` : `${NAV_LAYOUT.WIDTH.ICON}px`
    return "0px"
  }

  // Calculate dynamic top padding for large title collapse
  const getContentPaddingTop = () => {
    if (safeMode === "desktop") return "0px"

    const titleProgress = Math.min(1, p)
    const baseHeight = motion.largeTitleEnabled ? topbarHeight : NAV_LAYOUT.TOPBAR.COLLAPSED_PX
    const collapsedHeight = NAV_LAYOUT.TOPBAR.COLLAPSED_PX
    const currentHeight = motion.largeTitleEnabled
      ? (baseHeight - (titleProgress * (baseHeight - collapsedHeight)))
      : collapsedHeight

    return `${currentHeight}px`
  }

  // Check if drawer is open (mobile mode with expanded sidebar)
  const isDrawerOpen = drawerOpen

  

  return (
    <div className="h-[100dvh] overflow-hidden bg-[rgb(var(--bg))]">
      {/* NavigationLayer (fixed) */}
      {/* Demo banner (fixed at top when active) */}
      {/* Render lazily to avoid adding Bricks dependency unless needed */}
      {typeof window !== 'undefined' ? (
        // eslint-disable-next-line @next/next/no-img-element
        // import DemoBanner dynamically to avoid SSR issues with browser-only libs
        React.createElement(require('@/components/DemoBanner').default)
      ) : null}
      <NavigationRoot />

      {/* TopBarLayer (fixed) */}
      <TopBar />

      {/* Layer 3: ContentScrollLayer (唯一滚动容器 + padding-left/padding-top) */}
      <main
        id="content-scroll"
        className="h-[100dvh] overflow-y-auto overscroll-contain min-w-0"
        data-drawer-open={isDrawerOpen ? "true" : "false"}
        style={{
          marginLeft: getContentMarginLeft(),
          paddingTop: getContentPaddingTop(),
          zIndex: 'var(--z-content)',
          pointerEvents: isDrawerOpen ? 'none' : 'auto'
        }}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
          {children}
        </div>
      </main>

      <MotionLevelToggle />
    </div>
  )
}
