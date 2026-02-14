"use client"

import { useNav } from "./useNav"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { Drawer } from "./Drawer"
import { usePathname } from "next/navigation"
import { CommandBar } from "../CommandBar"

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
        - Mobile: TopBar + Drawer
        - Tablet-expanded (iPad portrait): TopBar + Drawer  
        - Tablet-compact (iPad landscape) / Desktop: Sidebar
        
        This prevents "Double Rendering" ghosts.
      */}
      {(mode === 'tablet-compact' || mode === 'desktop') && <Sidebar />}
      
      {(mode === 'mobile' || mode === 'tablet-expanded') && (
        <>
            <TopBar />
            <Drawer />
        </>
      )}
      
      <main
        className="min-h-[100svh] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          paddingLeft: `${navWidthPx}px`,
          paddingTop: (mode === 'mobile' || mode === 'tablet-expanded') ? '60px' : '0px',
          transform: elevated ? 'scale(0.985) translateY(10px)' : 'none',
          transformOrigin: 'top center',
          borderRadius: elevated ? '24px' : '0px',
          overflow: elevated ? 'hidden' : 'visible',
          // Optional: Add shadow when elevated to enhance depth
          boxShadow: elevated ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none'
        }}
      >
        <div 
          id="content-scroll"
          className="h-full overflow-y-auto"
          style={{
            height: (mode === 'mobile' || mode === 'tablet-expanded') ? 'calc(100vh - 60px)' : '100vh'
          }}
        >
          <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      <CommandBar />
    </>
  )
}
