"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { useNav } from "./useNav"
import { MENU_ITEMS } from "./constants"
import { useScrollVelocity } from "../../hooks/useScrollVelocity"
import React from "react"

export function Drawer() {
  const { drawerOpen, closeDrawer, mode } = useNav()
  const { signOut } = useAuth()
  const pathname = usePathname()
  const v = useScrollVelocity("content-scroll")

  // Velocity boost: 0~2 -> 0~10px
  const boost = Math.min(10, v * 6)
  const blur = 28 + boost

  // Swipe state
  const [translateX, setTranslateX] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const startXRef = React.useRef(0)
  const startTranslateRef = React.useRef(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    startTranslateRef.current = translateX
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startXRef.current
    const newTranslateX = Math.max(-100, Math.min(0, startTranslateRef.current + deltaX))
    setTranslateX(newTranslateX)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    
    const deltaX = e.clientX - startXRef.current
    const progress = Math.abs(translateX) / 100 // 0 to 1
    const velocity = Math.abs(deltaX) / (performance.now() - (startXRef.current as any).startTime || 1) // rough velocity

    if (progress > 0.3 || velocity > 0.6) {
      // Close
      setTranslateX(-110)
      setTimeout(closeDrawer, 200)
    } else {
      // Snap back
      setTranslateX(0)
    }
  }

  // Extra Safety: Never render drawer if not mobile, even if state says open
  if (mode !== 'mobile') return null
  
  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={closeDrawer} 
      />
      
      {/* Drawer Content */}
      <div 
        className="absolute top-[60px] left-0 right-0 glass scrolled border-b border-[var(--glass-border)] rounded-b-[24px] shadow-2xl p-4 animate-slide-down flex flex-col gap-2 transition-transform duration-200"
        style={{ 
          ["--glass-blur-scrolled" as any]: `${blur}px`,
          transform: `translateX(${translateX}%)`
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={closeDrawer}
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
            closeDrawer()
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
