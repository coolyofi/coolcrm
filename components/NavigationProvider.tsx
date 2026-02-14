"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type LayoutMode = "mobile" | "tablet" | "desktop"

interface NavigationContextType {
  layoutMode: LayoutMode
  isDrawerOpen: boolean
  isSidebarCollapsed: boolean
  setDrawerOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleDrawer: () => void
  toggleSidebar: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("desktop")
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Breakpoints: Mobile < 768px, Tablet 768px-1024px, Desktop >= 1024px
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setLayoutMode("mobile")
        setSidebarCollapsed(true) 
      } else if (width < 1024) {
        setLayoutMode("tablet")
        // Tablet mode defaults to not collapsed, but user can toggle
      } else {
        setLayoutMode("desktop")
        setSidebarCollapsed(false) // Desktop always expanded by default per requirements
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close drawer on layout change
  useEffect(() => {
    if (layoutMode !== "mobile") {
      setDrawerOpen(false)
    }
  }, [layoutMode])

  const toggleDrawer = () => setDrawerOpen((prev) => !prev)
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

  return (
    <NavigationContext.Provider
      value={{
        layoutMode,
        isDrawerOpen,
        isSidebarCollapsed,
        setDrawerOpen,
        setSidebarCollapsed,
        toggleDrawer,
        toggleSidebar,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
