"use client"

import React from 'react'

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

export function useScrollProgress(scrollElId = "content-scroll", distance = 56) {
  const [y, setY] = React.useState(0)

  React.useEffect(() => {
    const el = document.getElementById(scrollElId)
    if (!el) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setY(el.scrollTop))
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("scroll", onScroll as any)
    }
  }, [scrollElId])

  const p = clamp(y / distance, 0, 1)
  return { y, p }
}