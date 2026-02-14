"use client"

import React from "react"
import { useNavigation } from "./NavigationProvider"
import { DrawerOverlay } from "./DrawerOverlay"
import { SidebarDesktop } from "./SidebarDesktop"

// Single entry that ensures mutual exclusion between drawer and sidebar
export function NavigationRoot() {
  const { navMode } = useNavigation()

  if (navMode === 'drawer') {
    return <DrawerOverlay />
  }

  // Sidebar (tablet/desktop)
  return <SidebarDesktop />
}
