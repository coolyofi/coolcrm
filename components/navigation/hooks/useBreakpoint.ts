/**
 * useBreakpoint - Device breakpoint detection
 * 
 * Provides device mode information based on viewport width.
 * For navigation state, prefer useNavigation() which includes device mode.
 * 
 * This is a convenience hook for cases where you only need breakpoint info
 * without navigation state.
 */

"use client"

import { useEffect, useState } from "react"
import { BREAKPOINTS, getDeviceMode, type DeviceMode } from "../tokens"

export function useBreakpoint() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    if (typeof window === "undefined") return "desktop"
    return getDeviceMode(window.innerWidth)
  })

  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setDeviceMode(getDeviceMode(window.innerWidth))
      })
    }

    onResize()
    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return {
    deviceMode,
    isMobile: deviceMode === "mobile",
    isTablet: deviceMode === "tablet",
    isDesktop: deviceMode === "desktop",
    breakpoints: BREAKPOINTS,
  }
}
