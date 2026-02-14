"use client"

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { NAV_LAYOUT, UI_CONTRACT } from "./constants"

// Navigation State Machine Types
export type DeviceMode = "mobile" | "tablet" | "desktop"
export type SidebarState = "expanded" | "collapsed"
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
  deviceMode: DeviceMode
  navMode: "drawer" | "sidebar"
  sidebarState: SidebarState
  drawerOpen: boolean
  topbarHeight: number

  // Motion system
  motion: MotionTokens
  motionLevel: MotionLevel

  // Hydration safety
  isHydrated: boolean

  // Actions
  open: () => void
  close: () => void
  toggle: () => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  setMotionLevel: (level: MotionLevel) => void

  // Computed values for components
  navWidthPx: number
  proximity: boolean
}

const NavigationContext = createContext<NavContextValue | null>(null)

// Hook: Device-based mode detection with touch support
function useDeviceMode(): DeviceMode {
  const [mode, setMode] = useState<DeviceMode>(() => {
    // SSR-safe initialization: check window availability
    // Default to mobile on the server to avoid sending a desktop-heavy layout that
    // will jump to mobile on hydration. Mobile-first rendering reduces layout shifts
    // for the majority of mobile users and is a safer default for hydration.
    if (typeof window === "undefined") return "mobile"
    const w = window.innerWidth
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // iPad-like detection: medium screen + touch support
    if (w >= 768 && w < 1024 && isTouch) {
      return "tablet" // iPad gets tablet mode for better touch UX
    } else if (w < 768) {
      return "mobile"
    } else if (w < 1024) {
      return "tablet"
    } else {
      return "desktop"
    }
  })

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
      if (e.clientX < NAV_LAYOUT.PROXIMITY.LEFT_EDGE) setNearLeft(true)  // Expand when mouse within left edge
      else if (e.clientX > NAV_LAYOUT.PROXIMITY.RIGHT_EDGE) setNearLeft(false)  // Collapse when mouse beyond right edge
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
  const deviceMode = useDeviceMode()

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

  // Hydration safety
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Proximity (desktop only)
  const mouseNear = useMouseProximity(deviceMode === "desktop" && getMotionPolicy(motionLevel).proximityEnabled)

  // Derived sidebar state from deviceMode + overrides
  const sidebarState = useMemo<SidebarState>(() => {
    // Mobile: always collapsed
    if (deviceMode === "mobile") return "collapsed"
    // Tablet: expanded by default (better for iPad UX)
    if (deviceMode === "tablet") return sidebarOverride ?? "expanded"
    // Desktop: expanded when mouse near or override
    if (deviceMode === "desktop") {
      if (sidebarOverride) return sidebarOverride
      return mouseNear ? "expanded" : "collapsed"
    }
    return "collapsed"
  }, [deviceMode, sidebarOverride, mouseNear])

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)

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
  // Use centralized constants for nav widths
  const navWidthPx = useMemo(() => {
    switch (sidebarState) {
      case "expanded": return NAV_LAYOUT.WIDTH.EXPANDED
      case "collapsed": return NAV_LAYOUT.WIDTH.ICON
    }
  }, [sidebarState])

  // Topbar height token (read from CSS var if available)
  const topbarHeight = useMemo(() => {
    if (typeof window === 'undefined') return UI_CONTRACT.TOPBAR_HEIGHT_PX
    const v = getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')
    const parsed = v ? parseInt(v.trim().replace('px', ''), 10) : NaN
    return Number.isFinite(parsed) ? parsed : UI_CONTRACT.TOPBAR_HEIGHT_PX
  }, [])

  // Actions
  const open = useCallback(() => setSidebarOverride("expanded"), [])
  const close = useCallback(() => setSidebarOverride("collapsed"), [])
  const toggle = useCallback(() =>
    setSidebarOverride(s => s === "collapsed" ? "expanded" : "collapsed"), []
  )

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setDrawerOpen(v => !v), [])

  const setMotionLevelCallback = useCallback((level: MotionLevel) => {
    setMotionLevel(level)
    try {
      localStorage.setItem('coolcrm.motion', level)
    } catch {
      // ignore
    }
  }, [])

  const navMode = deviceMode === 'mobile' ? 'drawer' : 'sidebar'

  const value = useMemo<NavContextValue>(() => ({
    deviceMode,
    navMode,
    sidebarState,
    drawerOpen,
    topbarHeight,
    motion,
    motionLevel,
    isHydrated,
    open,
    close,
    toggle,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    setMotionLevel: setMotionLevelCallback,
    navWidthPx,
    proximity: mouseNear
  }), [deviceMode, navMode, sidebarState, drawerOpen, topbarHeight, motion, motionLevel, isHydrated, open, close, toggle, openDrawer, closeDrawer, toggleDrawer, setMotionLevelCallback, navWidthPx, mouseNear])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

// Hook: Access navigation state
// Canonical hook name per navigation contract
export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider")
  return ctx
}
