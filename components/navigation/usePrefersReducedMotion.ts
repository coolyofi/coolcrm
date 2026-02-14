"use client"

import { useEffect, useState } from "react"

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Check if browser supports matchMedia
    if (typeof window === "undefined" || !window.matchMedia) return

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    
    const onChange = () => setReduced(mq.matches)
    
    // Initial check
    onChange()
    
    // Safely add listener (older browsers use addListener)
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    } else {
       // Deprecated but good fallback
       mq.addListener(onChange)
       return () => mq.removeListener(onChange)
    }
  }, [])

  return reduced
}
