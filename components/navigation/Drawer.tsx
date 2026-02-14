"use client"

import { useLockBodyScroll } from "@/hooks/useLockBodyScroll"
import { NavItem } from "./NavItems"
import { useAuth } from "@/components/AuthProvider"
import { useEffect, useState } from "react"
import Link from "next/link"

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  menuItems: any[]
}

export function Drawer({ isOpen, onClose, menuItems }: DrawerProps) {
  useLockBodyScroll(isOpen)
  const { signOut } = useAuth()
  
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <>
      {/* Overlay */}
      <div 
        className={`
          fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className={`
          fixed z-[70] 
          top-[calc(var(--safe-top)+12px)] 
          bottom-[calc(var(--safe-bottom)+12px)] 
          left-3 
          w-[min(80vw,300px)] 
          glass-strong flex flex-col p-4
          transform transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)
          ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}
        `}
        // Prevent click inside closing overlay
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                C
            </div>
            <span className="font-bold text-lg tracking-tight">CoolCRM</span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item: any) => (
            <NavItem 
                key={item.path} 
                label={item.name} 
                href={item.path} 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>} 
                onClick={onClose}
            />
          ))}
        </nav>

        <div className="pt-4 border-t border-[var(--border)]">
             <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-3 w-full rounded-2xl text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-colors text-sm font-medium"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
             </button>
             {/* Theme Toggle placeholder if needed */}
        </div>
      </div>
    </>
  )
}
