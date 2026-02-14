"use client"

import { useEffect } from "react"

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    
    // Lock both html and body to be safe across browsers, especially iOS
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    
    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [locked])
}
