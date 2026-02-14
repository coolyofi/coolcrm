"use client"

import { usePathname } from "next/navigation"
import { useNav } from "./NavigationProvider"
import { TopBar } from "./TopBar"
import { DrawerOverlay } from "./DrawerOverlay"
import { SidebarDesktop } from "./SidebarDesktop"
import { MotionLevelToggle } from "../MotionLevelToggle"
import { useScrollProgress } from "../../hooks/useScrollProgress"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, sidebar, motion } = useNav()
  const pathname = usePathname()
  const { p } = useScrollProgress("content-scroll", 56)

  // Don't wrap login page with shell
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Calculate content margin based on navigation state
  const getContentMarginLeft = () => {
    if (mode === "mobile") return "0px"
    if (mode === "tablet") return sidebar === "expanded" ? "260px" : "72px"
    if (mode === "desktop") return sidebar === "expanded" ? "260px" : "72px"
    return "0px"
  }

  // Calculate dynamic top padding for large title collapse
  const getContentPaddingTop = () => {
    if (mode === "desktop") return "0px"
    
    const titleProgress = Math.min(1, p)
    const baseHeight = motion.largeTitleEnabled ? 72 : 60
    const collapsedHeight = 60
    const currentHeight = motion.largeTitleEnabled 
      ? (baseHeight - (titleProgress * (baseHeight - collapsedHeight)))
      : collapsedHeight
    
    return `${currentHeight}px`
  }

  // Check if drawer is open (mobile mode with expanded sidebar)
  const isDrawerOpen = mode === 'mobile' && sidebar === 'expanded'

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
