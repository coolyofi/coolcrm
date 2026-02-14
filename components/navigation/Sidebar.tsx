"use client"

import { NavItem } from "./NavItems"
import { useAuth } from "@/components/AuthProvider"
import { useState } from "react"
import Link from "next/link"

interface SidebarProps {
  state: 'icon' | 'expanded'
  onToggle: (state: 'icon' | 'expanded') => void
  menuItems: any[]
}

export function Sidebar({ state, onToggle, menuItems }: SidebarProps) {
  const { signOut } = useAuth()
  const isCollapsed = state === 'icon'

  return (
    <aside 
      className={`
        fixed top-4 bottom-4 left-4 z-40
        glass-strong transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        flex flex-col py-6
        ${isCollapsed ? 'w-[72px] px-3' : 'w-[260px] px-5'}
      `}
    >
      {/* Brand */}
      <div className={`flex items-center h-10 mb-8 transition-all ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
        <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold shrink-0">
          C
        </div>
        {!isCollapsed && (
          <span className="font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">
            CoolCRM
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item: any) => (
          <NavItem 
            key={item.path} 
            label={item.name} 
            href={item.path} 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>} 
            collapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[var(--border)] space-y-2">
         {/* Toggle Button */}
         <button 
           onClick={() => onToggle(isCollapsed ? 'expanded' : 'icon')}
           className={`
             w-full flex items-center gap-3 px-3 py-2 rounded-xl 
             text-[var(--fg-muted)] hover:bg-white/5 transition-colors
             ${isCollapsed ? 'justify-center' : ''}
           `}
         >
           <svg className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
           </svg>
           {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
         </button>

         <button
            onClick={signOut}
            className={`
                group flex items-center gap-3 px-3 py-2 rounded-xl 
                text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-colors
                ${isCollapsed ? 'justify-center' : ''}
            `}
            title="Sign Out"
         >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
         </button>
      </div>
    </aside>
  )
}
