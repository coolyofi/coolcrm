"use client"

import { usePathname } from "next/navigation"
import { useNav } from "./NavigationProvider"
import { NavigationRoot } from "./NavigationRoot"
import { MotionLevelToggle } from "../MotionLevelToggle"
import { useScrollProgress } from "../../hooks/useScrollProgress"
import { Z_INDEX, NAV_DIMENSIONS } from "./tokens"

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
    // Tablet/Desktop: sidebar takes space
    return sidebar === "expanded" 
      ? `${NAV_DIMENSIONS.SIDEBAR_EXPANDED}px` 
      : `${NAV_DIMENSIONS.SIDEBAR_COLLAPSED}px`
  }

  // Calculate dynamic top padding for large title collapse
  const getContentPaddingTop = () => {
    if (mode === "desktop" || mode === "tablet") return "0px"
    
    // Mobile only: topbar takes vertical space
    const titleProgress = Math.min(1, p)
    const baseHeight = motion.largeTitleEnabled 
      ? NAV_DIMENSIONS.TOPBAR_HEIGHT_LARGE 
      : NAV_DIMENSIONS.TOPBAR_HEIGHT
    const collapsedHeight = NAV_DIMENSIONS.TOPBAR_HEIGHT
    const currentHeight = motion.largeTitleEnabled 
      ? (baseHeight - (titleProgress * (baseHeight - collapsedHeight)))
      : collapsedHeight
    
    return `${currentHeight}px`
  }

  // Check if drawer is open (mobile mode with expanded sidebar)
  const isDrawerOpen = mode === 'mobile' && sidebar === 'expanded'

  return (
    <div className="h-[100dvh] overflow-hidden bg-[rgb(var(--bg))]">
      {/* Layer 1: NavigationLayer (fixed, single entry point) */}
      <NavigationRoot />

      {/* Layer 3: ContentScrollLayer (唯一滚动容器 + padding-left/padding-top) */}
      <main
        id="content-scroll"
        className="h-[100dvh] overflow-y-auto overscroll-contain min-w-0"
        data-drawer-open={isDrawerOpen ? "true" : "false"}
        style={{
          marginLeft: getContentMarginLeft(),
          paddingTop: getContentPaddingTop(),
          zIndex: Z_INDEX.CONTENT,
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
