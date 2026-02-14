"use client"

import { useNavMode } from "@/hooks/useNavMode"
import { TopBar } from "./TopBar"
import { Drawer } from "./Drawer"
import { Sidebar } from "./Sidebar"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

const MENU_ITEMS = [
    { name: "Dashboard", path: "/", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { name: "Customers", path: "/history", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { name: "Visits", path: "/visits", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { name: "Settings", path: "/settings", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, state, setState, isDrawerOpen, toggleDrawer } = useNavMode()
  const pathname = usePathname()

  // Sync --nav-w CSS variable
  useEffect(() => {
    const root = document.documentElement
    let width = '0px'
    if (mode === 'tablet' && state === 'icon') width = '72px'
    if (state === 'expanded' && mode !== 'mobile') width = '260px'
    // In mobile, nav width is effectively 0 for the content flow as it's overlay
    
    root.style.setProperty('--nav-w', width)
  }, [mode, state])

  // Close drawer on route change
  useEffect(() => {
    if (isDrawerOpen) toggleDrawer(false)
  }, [pathname])

  return (
    <>
      {/* 1. Mobile TopBar */}
      {mode === 'mobile' && (
        <TopBar onMenuClick={() => toggleDrawer(true)} />
      )}

      {/* 2. Drawer (Mobile Overlay) */}
      {mode === 'mobile' && (
        <Drawer 
            isOpen={isDrawerOpen} 
            onClose={() => toggleDrawer(false)} 
            menuItems={MENU_ITEMS}
        />
      )}

      {/* 3. Sidebar (Tablet/Desktop) */}
      {mode !== 'mobile' && (
        <Sidebar 
            state={state === 'closed' ? 'icon' : state} // Safety fallback
            onToggle={setState} 
            menuItems={MENU_ITEMS}
        />
      )}

      {/* 4. Main Content Wrapper */}
      <div 
        className="w-full min-w-0 transition-[padding] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ 
            paddingLeft: mode === 'mobile' ? '0px' : 'calc(var(--nav-w) + 32px)',
            paddingRight: mode === 'mobile' ? '0px' : '32px',
            paddingTop: mode === 'mobile' ? '0px' : '32px'
        }}
      >
        <div className="max-w-[1400px] mx-auto min-w-0">
           {children}
        </div>
      </div>
    </>
  )
}
