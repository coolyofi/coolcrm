"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

// Navigation State Machine Types
export type NavMode = "mobile" | "tablet" | "desktop"
export type SidebarState = "closed" | "icon" | "expanded"
export type MotionLevel = "stable" | "apple"

// Motion Policy Output (组件消费这些参数)
export type MotionTokens = {
  // Visual effects
  topbarBlurPx: number
  topbarAlpha: number
  shadowLevel: number

  // Timing
  durations: {
    fast: number
    base: number
    slow: number
  }

  // Easing
  easing: string

  // Feature flags
  largeTitleEnabled: boolean
  drawerDragEnabled: boolean
  proximityEnabled: boolean
}

// Navigation Context
type NavContextValue = {
  mode: NavMode
  sidebar: SidebarState
  drawerOpen: boolean

  // Motion system
  motion: MotionTokens
  motionLevel: MotionLevel

  // Actions
  open: () => void
  close: () => void
  toggle: () => void
  setMotionLevel: (level: MotionLevel) => void
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
function useMouseProximity(enabled: boolean) {
  const [nearLeft, setNearLeft] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const move = (e: MouseEvent) => {
      if (e.clientX < 48) setNearLeft(true)
      else if (e.clientX > 280) setNearLeft(false)
    }

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [enabled])

  return nearLeft
}

// Motion Policy: Pure function that returns motion tokens based on level and physics
function getMotionPolicy(
  motionLevel: MotionLevel,
  scrollVelocity: number = 0,
  scrollTop: number = 0
): MotionTokens {
  if (motionLevel === "stable") {
    // Enterprise stable: Conservative, predictable, zero-surprise
    return {
      topbarBlurPx: 18,
      topbarAlpha: 0.85,
      shadowLevel: 1,
      durations: {
        fast: 120,
        base: 200,
        slow: 300
      },
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      largeTitleEnabled: false, // Disable large title collapse
      drawerDragEnabled: false, // Disable gesture drag
      proximityEnabled: true // Keep proximity for UX
    }
  }

  // Apple motion: Dynamic, responsive, iOS-like
  const velocityBoost = Math.min(12, scrollVelocity * 8) // 0-12px blur boost
  const titleProgress = Math.min(1, scrollTop / 56) // Large title collapse progress

  return {
    topbarBlurPx: 18 + velocityBoost,
    topbarAlpha: 0.72 + (titleProgress * 0.13), // Fade as title collapses
    shadowLevel: 1 + (velocityBoost * 0.1),
    durations: {
      fast: 120,
      base: 200,
      slow: 240
    },
    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    largeTitleEnabled: true, // Enable large title collapse
    drawerDragEnabled: true, // Enable gesture drag
    proximityEnabled: true // Keep proximity
  }
}

// Navigation Provider v3 (双轨架构)
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const mode = useNavMode()

  // Core state
  const [sidebar, setSidebar] = useState<SidebarState>("closed")
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Motion system
  const [motionLevel, setMotionLevel] = useState<MotionLevel>(() => {
    if (typeof window === 'undefined') return 'stable'
    try {
      const stored = localStorage.getItem('coolcrm.motion')
      return stored === 'apple' ? 'apple' : 'stable'
    } catch {
      return 'stable'
    }
  })

  // Physics state (only for apple mode)
  const [scrollVelocity, setScrollVelocity] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  // Proximity (desktop only)
  const mouseNear = useMouseProximity(mode === "desktop" && getMotionPolicy(motionLevel).proximityEnabled)

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

  // Scroll physics (apple mode only)
  useEffect(() => {
    if (motionLevel !== "apple") return

    const el = document.getElementById("content-scroll")
    if (!el) return

    let lastScrollTop = 0
    let lastTime = performance.now()

    const handleScroll = () => {
      const now = performance.now()
      const currentScrollTop = el.scrollTop
      const deltaTime = now - lastTime
      const deltaScroll = currentScrollTop - lastScrollTop

      if (deltaTime > 0) {
        const velocity = Math.abs(deltaScroll / deltaTime) * 1000 // px per second
        setScrollVelocity(velocity)
      }

      setScrollTop(currentScrollTop)
      lastScrollTop = currentScrollTop
      lastTime = now
    }

    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [motionLevel])

  // Motion tokens (computed from policy)
  const motion = useMemo(() =>
    getMotionPolicy(motionLevel, scrollVelocity, scrollTop),
    [motionLevel, scrollVelocity, scrollTop]
  )

  // Computed values
  const navWidthPx = useMemo(() => {
    switch (sidebar) {
      case "expanded": return 260
      case "icon": return 72
      case "closed": return 72
    }
  }, [sidebar])

  // Actions
  const open = useCallback(() => setSidebar("expanded"), [])
  const close = useCallback(() => setSidebar("closed"), [])
  const toggle = useCallback(() =>
    setSidebar(s => s === "closed" ? "expanded" : "closed"), []
  )

  const setMotionLevelCallback = useCallback((level: MotionLevel) => {
    setMotionLevel(level)
    try {
      localStorage.setItem('coolcrm.motion', level)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo<NavContextValue>(() => ({
    mode,
    sidebar,
    drawerOpen,
    motion,
    motionLevel,
    open,
    close,
    toggle,
    setMotionLevel: setMotionLevelCallback,
  }), [mode, sidebar, drawerOpen, motion, motionLevel, open, close, toggle, setMotionLevelCallback])

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
