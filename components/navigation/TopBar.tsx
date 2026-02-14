"use client"

import { useScrolled } from "@/hooks/useScrolled"
import { useAuth } from "@/components/AuthProvider"
import Link from "next/link"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const scrolled = useScrolled(5)

  return (
    <div 
      className={`
        sticky top-0 z-50 pt-[calc(var(--safe-top)+12px)] px-4 pb-4 transition-all duration-300
        ${scrolled ? 'translate-y-[-4px]' : ''}
      `}
    >
      <div 
        className={`
          flex items-center justify-between h-[56px] px-2 pl-3
          rounded-[20px] transition-all duration-300
          ${scrolled ? 'glass scrolled' : 'glass bg-transparent border-transparent shadow-none backdrop-blur-none'}
          ${scrolled ? '' : 'bg-transparent'}
        `}
      >
        {/* Left: Hamburger */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-1 text-[var(--fg)] active:scale-90 transition-transform rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Center: Title */}
        <span className={`font-semibold text-lg transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
          CoolCRM
        </span>

        {/* Right: Add Action */}
        <Link href="/add" className="p-2 -mr-1 text-[var(--primary)] active:scale-90 transition-transform rounded-xl hover:bg-[var(--primary)]/10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
