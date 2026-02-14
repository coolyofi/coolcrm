"use client"

import React from 'react'

export function useScrollDirection(scrollElId = "content-scroll", threshold = 6) {
  const [dir, setDir] = React.useState<"up" | "down">("up")

  React.useEffect(() => {
    const el = document.getElementById(scrollElId)
    if (!el) return

    let last = el.scrollTop
    let raf = 0

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const cur = el.scrollTop
        const delta = cur - last
        if (Math.abs(delta) > threshold) setDir(delta > 0 ? "down" : "up")
        last = cur
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("scroll", onScroll as any)
    }
  }, [scrollElId, threshold])

  return dir
}