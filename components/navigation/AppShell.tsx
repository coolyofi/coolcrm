"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useNavigation } from "./NavigationProvider"
import { TopBar } from "./TopBar"
import { NavigationRoot } from "./NavigationRoot"
import { MotionLevelToggle } from "../MotionLevelToggle"
import { useScrollProgress } from "../../hooks/useScrollProgress"
import { UI_CONTRACT, NAV_LAYOUT } from "./constants"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { deviceMode, sidebarState, motion, isHydrated, topbarHeight, drawerOpen } = useNavigation()
  const pathname = usePathname()
  const { p } = useScrollProgress("content-scroll", UI_CONTRACT.PAGE_HEADER_SCROLL_DISTANCE)

  // Don't wrap login page with shell
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

  // Enforce "body" never scrolls — AppShell makes #content-scroll the only scroll container
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  return (
    <div className="h-[100dvh] overflow-hidden bg-[rgb(var(--bg))]">
      {/* NavigationLayer（fixed） */}
      <NavigationRoot />

      {/* TopBarLayer（fixed，顶部，含 safe-area） */}
      <TopBar />

      {/* ContentScrollLayer（唯一滚动容器 + padding-left/padding-top） */}
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
