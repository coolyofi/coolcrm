"use client"

import Link from "next/link"
import { useNav } from "./useNav"
import { usePathname } from "next/navigation"
import { useScrollProgress } from "../../hooks/useScrollProgress"
import { useScrollVelocity } from "../../hooks/useScrollVelocity"

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

export function TopBar() {
  const { openDrawer } = useNav()
  const pathname = usePathname()
  const { p } = useScrollProgress("content-scroll", 56)
  const v = useScrollVelocity("content-scroll")

  const getCompactTitle = () => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.startsWith('/add')) return 'Add Customer'
    if (pathname.startsWith('/edit')) return 'Edit Customer'
    if (pathname.startsWith('/history')) return 'History'
    if (pathname.startsWith('/settings')) return 'Settings'
    if (pathname.startsWith('/visits')) return 'Visits'
    return 'CoolCRM'
  }

  const compactOpacity = clamp((p - 0.2) / 0.8, 0, 1)

  // Velocity boost: 0~2 -> 0~10px
  const boost = Math.min(10, v * 6)
  const blur = 28 + boost

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 h-[60px] glass scrolled border-b border-[var(--glass-border)] flex items-center justify-between px-4 safe-area-top backdrop-blur-md bg-[var(--glass-bg)]"
      style={{ "--glass-blur-scrolled": `${blur}px` } as React.CSSProperties}
    >
      {/* Menu Trigger */}
      <button 
        onClick={openDrawer}
        className="p-2 -ml-2 text-[var(--fg)] active:scale-95 transition-transform"
        aria-label="Open Navigation"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Compact Title */}
      <span 
        className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)] transition-opacity duration-200"
        style={{ opacity: compactOpacity }}
      >
        {getCompactTitle()}
      </span>

      {/* Quick Action */}
      <Link 
        href="/add" 
        className="p-2 -mr-2 text-[var(--primary)] active:scale-95 transition-transform"
        aria-label="Add New"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  )
}
