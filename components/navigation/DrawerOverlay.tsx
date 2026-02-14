"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { useNav } from "./NavigationProvider"
import { MENU_ITEMS } from "./constants"
import { useScrollVelocity } from "../../hooks/useScrollVelocity"
import { Z_INDEX, NAV_DIMENSIONS } from "./tokens"
import React from "react"

/**
 * DrawerOverlay - Mobile drawer with proper interaction blocking
 * 
 * Requirements:
 * - Only renders on mobile (NavigationRoot handles this)
 * - Backdrop blocks interaction when open (pointer-events: auto)
 * - Backdrop allows interaction when closed (pointer-events: none)
 * - Drawer panel prevents touch propagation
 * - Uses z-index tokens (no magic numbers)
 */
export function DrawerOverlay() {
  const { mode, sidebar, close, motion } = useNav()
  const { signOut } = useAuth()
  const pathname = usePathname()
  const v = useScrollVelocity("content-scroll")

  // Swipe state (always initialize hooks)
  const [translateX, setTranslateX] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const startXRef = React.useRef<{ x: number; startTime: number } | null>(null)
  const startTranslateRef = React.useRef(0)

  // Only show on mobile
  if (mode !== "mobile") return null

  const open = sidebar === "expanded"

  // Velocity boost: 0~2 -> 0~10px
  const boost = Math.min(10, v * 6)
  const blur = 28 + boost

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!motion.drawerDragEnabled) return
    setIsDragging(true)
    startXRef.current = { x: e.clientX, startTime: performance.now() }
    startTranslateRef.current = translateX
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !startXRef.current || !motion.drawerDragEnabled) return
    const deltaX = e.clientX - startXRef.current.x
    const newTranslateX = Math.max(-100, Math.min(0, startTranslateRef.current + deltaX))
    setTranslateX(newTranslateX)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !startXRef.current || !motion.drawerDragEnabled) return
    setIsDragging(false)

    const deltaX = e.clientX - startXRef.current.x
    const progress = Math.abs(translateX) / 100 // 0 to 1
    const velocity = Math.abs(deltaX) / (performance.now() - startXRef.current.startTime || 1) // rough velocity

    if (progress > 0.3 || velocity > 0.6) {
      // Close
      setTranslateX(-110)
      setTimeout(close, 200)
    } else {
      // Snap back
      setTranslateX(0)
    }
  }

  // When closed, don't render to save resources and prevent pointer-events issues
  if (!open) return null

  return (
    <div 
      className="fixed inset-0"
      style={{ zIndex: Z_INDEX.DRAWER_BACKDROP }}
    >
      {/* Backdrop - blocks interaction when open, allows when closed */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        style={{
          pointerEvents: open ? 'auto' : 'none',
          opacity: open ? 1 : 0
        }}
        onClick={close}
      />

      {/* Drawer Content */}
      <div
        className="absolute top-[60px] left-0 right-0 glass scrolled border-b border-[var(--glass-border)] rounded-b-[24px] shadow-2xl p-4 animate-slide-down flex flex-col gap-2 transition-transform duration-200"
        style={{
          "--glass-blur-scrolled": `${blur}px`,
          transform: `translateX(${translateX}%)`,
          transitionDuration: `${motion.durations.base}ms`,
          zIndex: Z_INDEX.DRAWER,
          pointerEvents: 'auto' // Drawer panel always captures events to prevent propagation
        } as React.CSSProperties}
        onPointerDown={motion.drawerDragEnabled ? handlePointerDown : undefined}
        onPointerMove={motion.drawerDragEnabled ? handlePointerMove : undefined}
        onPointerUp={motion.drawerDragEnabled ? handlePointerUp : undefined}
      >
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={close}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                  : 'text-[var(--fg)] hover:bg-[var(--surface-solid)]'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
              </svg>
              {item.name}
            </Link>
          )
        })}

        <div className="h-px bg-[var(--border)] my-2" />

        <button
          onClick={() => {
            close()
            signOut()
          }}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-all w-full text-left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}