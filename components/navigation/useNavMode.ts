"use client"

/**
 * @deprecated This file is deprecated. Use NavigationProvider's useNav() instead.
 * 
 * NavigationProvider now handles device mode detection internally.
 * Import { useNav } from "./NavigationProvider" and use nav.mode instead.
 */

import { useEffect, useState } from "react"

// Simple NavMode for backward compatibility
export type NavMode = "mobile" | "tablet" | "desktop"

const BREAKPOINTS = {
  mobileMax: 767,
  tabletMax: 1023,
} as const

function getMode(width: number): NavMode {
  if (width <= BREAKPOINTS.mobileMax) return "mobile"
  if (width <= BREAKPOINTS.tabletMax) return "tablet"
  return "desktop"
}

/**
 * @deprecated Use NavigationProvider's useNav().mode instead
 */
export function useNavMode(): NavMode {
  const [mode, setMode] = useState<NavMode>(() => {
    if (typeof window === "undefined") return "desktop"
    return getMode(window.innerWidth)
  })

  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setMode(getMode(window.innerWidth)))
    }
    
    onResize()

    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return mode
}
