"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

// Navigation State Machine Types
export type NavMode = "mobile" | "tablet" | "desktop"
export type SidebarState = "closed" | "icon" | "expanded"

// Navigation Context
type NavContextValue = {
  mode: NavMode
  sidebar: SidebarState

  // Actions
  open: () => void
  close: () => void
  toggle: () => void
}

const NavigationContext = createContext<NavContextValue | null>(null)

// Hook: Device-based mode detection
function useNavMode(): NavMode {
  const [mode, setMode] = useState<NavMode>("desktop")

  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth
      if (w < 768) setMode("mobile")
      else if (w < 1024) setMode("tablet")
      else setMode("desktop")
    }

    handler()
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return mode
}

// Hook: Mouse proximity expand for desktop
function useMouseProximity() {
  const [nearLeft, setNearLeft] = useState(false)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (e.clientX < 48) setNearLeft(true)
      else if (e.clientX > 280) setNearLeft(false)
    }

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return nearLeft
}

// Navigation Provider (Stable v1)
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const mode = useNavMode()
  const mouseNear = useMouseProximity()

  const [sidebar, setSidebar] = useState<SidebarState>("closed")

  // Auto-rules: Device → Mode → Sidebar
  useEffect(() => {
    if (mode === "mobile") setSidebar("closed")
    if (mode === "tablet") setSidebar("icon")
    if (mode === "desktop") setSidebar("expanded")
  }, [mode])

  // Mouse proximity expand (desktop only)
  useEffect(() => {
    if (mode !== "desktop") return
    if (mouseNear && sidebar === "icon") setSidebar("expanded")
    else if (!mouseNear && sidebar === "expanded") setSidebar("icon")
  }, [mode, mouseNear, sidebar])

  const open = useCallback(() => setSidebar("expanded"), [])
  const close = useCallback(() => setSidebar("closed"), [])
  const toggle = useCallback(() =>
    setSidebar(s => s === "closed" ? "expanded" : "closed"), []
  )

  const value = useMemo<NavContextValue>(() => ({
    mode,
    sidebar,
    open,
    close,
    toggle,
  }), [mode, sidebar, open, close, toggle])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

// Hook: Access navigation state
export function useNav() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error("useNav must be used within NavigationProvider")
  return ctx
}
