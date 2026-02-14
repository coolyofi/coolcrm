"use client"

import { useEffect, useState } from "react"
import type { NavMode } from "./constants"
import { BREAKPOINTS } from "./constants"

function getMode(width: number): NavMode {
  if (width <= BREAKPOINTS.mobileMax) return "mobile"
  if (width <= BREAKPOINTS.tabletMax) return "tablet"
  return "desktop"
}

export function useNavMode(): NavMode {
  // Use lazy initialization with window check to support SSR safely
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
