"use client"

import React from 'react'

export function useScrollVelocity(scrollElId = "content-scroll") {
  const [v, setV] = React.useState(0)

  React.useEffect(() => {
    const el = document.getElementById(scrollElId)
    if (!el) return

    let lastY = el.scrollTop
    let lastT = performance.now()
    let raf = 0

    const tick = () => {
      const y = el.scrollTop
      const t = performance.now()
      const dy = Math.abs(y - lastY)
      const dt = Math.max(1, t - lastT)
      const vel = dy / dt // px/ms

      // 低通滤波，避免抖动
      setV(prev => prev * 0.8 + vel * 0.2)

      lastY = y
      lastT = t
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scrollElId])

  return v // 典型：0~2
}