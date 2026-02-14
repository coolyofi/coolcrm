"use client"

import { useNav } from "./NavigationProvider"
import { SidebarDesktop } from "./SidebarDesktop"
import { DrawerOverlay } from "./DrawerOverlay"
import { TopBar } from "./TopBar"

/**
 * NavigationRoot - Single Render Entry Point
 * 
 * This component ensures mutual exclusion:
 * - mobile: ONLY renders DrawerOverlay + TopBar
 * - tablet/desktop: ONLY renders Sidebar (no DrawerOverlay, no TopBar)
 * 
 * This prevents "double sidebar" bugs by guaranteeing only one navigation
 * component is mounted at a time based on device mode.
 */
export function NavigationRoot() {
  const { mode } = useNav()

  if (mode === "mobile") {
    // Mobile: Show drawer overlay + topbar only
    return (
      <>
        <DrawerOverlay />
        <TopBar />
      </>
    )
  }

  // Tablet/Desktop: Show sidebar only (no drawer, no topbar)
  return <SidebarDesktop />
}
