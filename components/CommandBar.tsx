"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useScrollDirection } from "../hooks/useScrollDirection"
import { useEffect } from "react"

export function CommandBar() {
  const pathname = usePathname()
  const router = useRouter()
  const dir = useScrollDirection("content-scroll")

  // Only show on main pages
  const showOnPages = ['/', '/visits', '/history']
  if (!showOnPages.includes(pathname)) return null

  const hidden = dir === "down"

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        // Focus search (placeholder for now)
        console.log('Search shortcut triggered')
      } else if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        router.push('/add')
      } else if (e.key === 'Escape') {
        // Close any open modals/panels (placeholder)
        console.log('Escape shortcut triggered')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+16px)]
        glass px-3 py-2 flex items-center gap-2
        transition-all duration-[var(--motion-base)] ease-[var(--ease)]
        ${hidden ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"}
      `}
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      {/* Search */}
      <button className="p-2 text-[var(--fg)] active:scale-95 transition-transform">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Add Customer */}
      <Link 
        href="/add"
        className="p-2 bg-[var(--primary)] text-white rounded-full active:scale-95 transition-transform"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {/* Filter */}
      <button className="p-2 text-[var(--fg)] active:scale-95 transition-transform">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>
    </div>
  )
}