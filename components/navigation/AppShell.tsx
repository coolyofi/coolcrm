"use client"

import { usePathname } from "next/navigation"
import { useNav } from "./NavigationProvider"
import { TopBar } from "./TopBar"
import { DrawerOverlay } from "./DrawerOverlay"
import { SidebarDesktop } from "./SidebarDesktop"
import { MotionLevelToggle } from "../MotionLevelToggle"
import { useScrollProgress } from "../../hooks/useScrollProgress"
import { UI_CONTRACT } from "./constants"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, sidebar, motion, isHydrated } = useNav()
  const pathname = usePathname()
  const { p } = useScrollProgress("content-scroll", UI_CONTRACT.PAGE_HEADER_SCROLL_DISTANCE)

  // Don't wrap login page with shell
  if (pathname === '/login') {
    return <>{children}</>
  }

  // During hydration, avoid assuming desktop on the server (prevents desktop->mobile jump).
  // Use a mobile-first default until the client hydrates and determines the real mode.
  const safeMode = isHydrated ? mode : "mobile"
  const safeSidebar = isHydrated ? sidebar : "closed"

  // Calculate content margin based on navigation state
  const getContentMarginLeft = () => {
    if (safeMode === "mobile") return "0px"
    if (safeMode === "tablet") return safeSidebar === "expanded" ? "260px" : "72px"
    if (safeMode === "desktop") return safeSidebar === "expanded" ? "260px" : "72px"
    return "0px"
  }

  // Calculate dynamic top padding for large title collapse
  const getContentPaddingTop = () => {
    if (safeMode === "desktop") return "0px"

    const titleProgress = Math.min(1, p)
    const baseHeight = motion.largeTitleEnabled ? UI_CONTRACT.TOPBAR_HEIGHT_PX : 60
    const collapsedHeight = 60
    const currentHeight = motion.largeTitleEnabled
      ? (baseHeight - (titleProgress * (baseHeight - collapsedHeight)))
      : collapsedHeight

    return `${currentHeight}px`
  }

  // Check if drawer is open (mobile mode with expanded sidebar)
  const isDrawerOpen = safeMode === 'mobile' && safeSidebar === 'expanded'

  return (
    <div className="h-[100dvh] overflow-hidden bg-[rgb(var(--bg))]">
      {/* NavigationLayer（fixed，左侧，h-screen） */}
      <SidebarDesktop />
      <DrawerOverlay />

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
