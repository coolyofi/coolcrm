"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { useNav } from "./useNav"
import { MENU_ITEMS } from "./constants"

export function Drawer() {
  const { drawerOpen, closeDrawer } = useNav()
  const { signOut } = useAuth()
  const pathname = usePathname()

  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={closeDrawer} 
      />
      
      {/* Drawer Content */}
      <div className="absolute top-[60px] left-0 right-0 bg-[var(--bg)]/95 glass border-b border-[var(--glass-border)] rounded-b-[24px] shadow-2xl p-4 animate-slide-down flex flex-col gap-2">
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
