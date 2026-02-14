"use client"

import Link from "next/link"
import { useNav } from "./useNav"

export function TopBar() {
  const { openDrawer } = useNav()

  // Note: We don't check 'mode' here because the parent AppShell 
  // currently conditionally renders this only for mobile.
  // But strictly speaking, it could handle its own visibility.

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[60px] glass border-b border-[var(--glass-border)] flex items-center justify-between px-4 safe-area-top backdrop-blur-md bg-[var(--glass-bg)]">
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

      {/* Brand */}
      <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)]">
        CoolCRM
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
