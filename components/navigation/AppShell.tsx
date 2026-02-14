"use client"

import { useNav } from "./useNav"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { Drawer } from "./Drawer"
import { usePathname } from "next/navigation"
import { CommandBar } from "../CommandBar"
import { useEffect } from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, state, drawerOpen, navWidthPx } = useNav()
  const pathname = usePathname()
  
  // Don't wrap login page with shell
  if (pathname === '/login') {
    return <>{children}</>
  }

  const showDrawer = mode === 'mobile' && drawerOpen

  // Lock body when drawer is open on mobile
  useEffect(() => {
    if (showDrawer) {
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden"
      return () => {
        document.documentElement.style.overflow = ""
        document.body.style.overflow = ""
      }
    }
  }, [showDrawer])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[rgb(var(--bg))]">
      {/* TopBar: mobile/tablet only */}
      {(mode === 'mobile' || mode === 'tablet-expanded') && <TopBar />}
      
      {/* Nav: Single instance rendering */}
      {mode === 'mobile' ? (
        showDrawer && <Drawer />
      ) : (
        <Sidebar />
      )}
      
      {/* Content scroll container */}
      <main
        id="content-scroll"
        className="h-[100dvh] overflow-y-auto overscroll-contain"
        style={{
          paddingLeft: mode === 'mobile' ? '0px' : `${navWidthPx}px`,
          paddingTop: (mode === 'mobile' || mode === 'tablet-expanded') ? '60px' : '0px',
        }}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
          {children}
        </div>
      </main>

      <CommandBar />
    </div>
  )
}
