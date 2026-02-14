"use client"

import { useEffect, useState } from "react"
import type { NavMode } from "./constants"
import { BREAKPOINTS } from "./constants"

function getMode(width: number, height: number): NavMode {
  if (width <= BREAKPOINTS.mobileMax) return "mobile"
  
  // iPad detection: width >= 768 && width < 1024
  const isIpad = width >= 768 && width < BREAKPOINTS.tabletMax
  if (isIpad) {
    const isLandscape = width > height
    return isLandscape ? "tablet-compact" : "tablet-expanded"
  }
  
  return "desktop"
}

export function useNavMode(): NavMode {
  // Use lazy initialization with window check to support SSR safely
  const [mode, setMode] = useState<NavMode>(() => {
    if (typeof window === "undefined") return "desktop"
    return getMode(window.innerWidth, window.innerHeight)
  })

  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setMode(getMode(window.innerWidth, window.innerHeight)))
    }
    
    // Initial check in effect in case hydration mismatch
    onResize()

    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return mode
}
