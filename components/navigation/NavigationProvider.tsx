"use client"

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

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

  // Computed values for components
  state: SidebarState
  toggleSidebar: () => void
  navWidthPx: number
  proximity: boolean
}

const NavigationContext = createContext<NavContextValue | null>(null)

// Hook: Device-based mode detection with touch support
function useNavMode(): NavMode {
  const [mode, setMode] = useState<NavMode>("desktop")

  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      // iPad-like detection: medium screen + touch support
      if (w >= 768 && w < 1024 && isTouch) {
        setMode("tablet") // iPad gets tablet mode for better touch UX
      } else if (w < 768) {
        setMode("mobile")
      } else if (w < 1024) {
        setMode("tablet")
      } else {
        setMode("desktop")
      }
    }

    handler()
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return mode
}

// Hook: Detect user's motion preferences
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// Hook: Mouse proximity expand for desktop
function useMouseProximity(enabled: boolean) {
  const [nearLeft, setNearLeft] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const move = (e: MouseEvent) => {
      if (e.clientX < 60) setNearLeft(true)  // Expand when mouse within 60px of left edge
      else if (e.clientX > 300) setNearLeft(false)  // Collapse when mouse beyond 300px
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
  scrollTop: number = 0,
  prefersReducedMotion: boolean = false
): MotionTokens {
  // Respect user's motion preferences
  if (prefersReducedMotion) {
    return {
      topbarBlurPx: 18,
      topbarAlpha: 0.85,
      shadowLevel: 1,
      durations: {
        fast: 0,
        base: 0,
        slow: 0
      },
      easing: "linear",
      largeTitleEnabled: false,
      drawerDragEnabled: false,
      proximityEnabled: true
    }
  }

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

  // Core state: Sidebar state for manual toggle (only affects desktop/tablet)
  const [sidebarOverride, setSidebarOverride] = useState<SidebarState | null>(null)

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

  // User preferences
  const prefersReducedMotion = usePrefersReducedMotion()

  // Hydration safety - use ref instead of state to avoid setState in effect
  const isHydratedRef = useRef(false)
  useEffect(() => {
    isHydratedRef.current = true
  }, [])

  // Proximity (desktop only)
  const mouseNear = useMouseProximity(mode === "desktop" && getMotionPolicy(motionLevel).proximityEnabled)

  // Derived sidebar state from mode + overrides
  const sidebar = useMemo<SidebarState>(() => {
    // Mobile: always closed
    if (mode === "mobile") return "closed"
    // Tablet: expanded by default (better for iPad UX)
    if (mode === "tablet") return sidebarOverride ?? "expanded"
    // Desktop: icon/expanded based on mouse proximity or override
    if (mode === "desktop") {
      if (sidebarOverride) return sidebarOverride
      return mouseNear ? "expanded" : "icon"
    }
    return "closed"
  }, [mode, sidebarOverride, mouseNear])

  // Drawer state
  const [drawerOpen] = useState(false)

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
    getMotionPolicy(motionLevel, scrollVelocity, scrollTop, prefersReducedMotion),
    [motionLevel, scrollVelocity, scrollTop, prefersReducedMotion]
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
  const open = useCallback(() => setSidebarOverride("expanded"), [])
  const close = useCallback(() => setSidebarOverride("closed"), [])
  const toggle = useCallback(() =>
    setSidebarOverride(s => s === "closed" ? "expanded" : "closed"), []
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
    state: sidebar,
    toggleSidebar: toggle,
    navWidthPx,
    proximity: mouseNear
  }), [mode, sidebar, drawerOpen, motion, motionLevel, open, close, toggle, setMotionLevelCallback, navWidthPx, mouseNear])

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
