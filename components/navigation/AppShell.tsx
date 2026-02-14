"use client"

import { useNav } from "./useNav"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { Drawer } from "./Drawer"
import { usePathname } from "next/navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { navWidthPx, elevated, mode } = useNav()
  const pathname = usePathname()
  
  // Don't wrap login page with shell
  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <>
      {/* 
        Strict Rendering Logic:
        - Mobile: TopBar + Drawer (Only if mode is explicitly mobile)
        - Tablet/Desktop: Sidebar (Only if mode is NOT mobile)
        
        This prevents "Double Rendering" ghosts.
      */}
      {mode !== 'mobile' && <Sidebar />}
      
      {mode === 'mobile' && (
        <>
            <TopBar />
            <Drawer />
        </>
      )}
      
      <main
        className="min-h-[100svh] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          paddingLeft: `${navWidthPx}px`,
          paddingTop: mode === 'mobile' ? '60px' : '0px',
          transform: elevated ? 'scale(0.985) translateY(10px)' : 'none',
          transformOrigin: 'top center',
          borderRadius: elevated ? '24px' : '0px',
          overflow: elevated ? 'hidden' : 'visible',
          // Optional: Add shadow when elevated to enhance depth
          boxShadow: elevated ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none'
        }}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
           {children}
        </div>
      </main>
    </>
  )
}
