"use client"

import { usePathname } from "next/navigation"
import { NavigationProvider } from "./NavigationProvider"
import { TopBar } from "./TopBar"
import { DrawerOverlay } from "./DrawerOverlay"
import { SidebarDesktop } from "./SidebarDesktop"
import { CommandBar } from "../CommandBar"
import { MotionLevelToggle } from "../MotionLevelToggle"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't wrap login page with shell
  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <NavigationProvider>
      <div className="h-[100dvh] overflow-hidden bg-[rgb(var(--bg))]">
        {/* Navigation Layer (OS Layer) */}
        <TopBar />
        <DrawerOverlay />
        <SidebarDesktop />

        {/* Content Layer (Scroll Only) */}
        <main
          id="content-scroll"
          className="h-[100dvh] overflow-y-auto overscroll-contain min-w-0"
        >
          <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </main>

        <CommandBar />
        <MotionLevelToggle />
      </div>
    </NavigationProvider>
  )
}
