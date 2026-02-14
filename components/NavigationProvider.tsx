"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export type NavMode = "mobile" | "tablet" | "desktop"
export type NavState = "closed" | "icon" | "expanded"

interface NavigationContextType {
  mode: NavMode // Breakpoint mode
  state: NavState // Sidebar state
  isDrawerOpen: boolean
  toggleDrawer: (open?: boolean) => void
  setNavState: (state: NavState) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<NavMode>("desktop") // Default desktop to assume ssr
  const [state, setState] = useState<NavState>("expanded")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 1. Logic Engine (The Physics)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      let newMode: NavMode = "desktop"
      if (width < 768) newMode = "mobile"
      else if (width < 1024) newMode = "tablet"
      
      setMode(newMode)

      // State Reconciliation Logic
      if (newMode === "mobile") {
        setState("closed") // Mobile sidebar is strictly a Drawer
      } else {
        // Retrieve memory or apply default rules
        const savedState = localStorage.getItem("coolcrm-nav-state") as NavState | null
        
        if (savedState === "icon" || savedState === "expanded") {
             setState(savedState)
        } else {
             // Defaults if no memory
             if (newMode === "tablet") setState("icon")
             else setState("expanded")
        }
        
        // Ensure drawer closes when expanding screen
        setIsDrawerOpen(false) 
      }
    }

    // Run on mount
    handleResize()
    
    // Debounced listener
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 50)
    }

    window.addEventListener("resize", debouncedResize)
    return () => {
      window.removeEventListener("resize", debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  // 2. Action Handlers with Persistence
  const toggleDrawer = useCallback((open?: boolean) => {
    setIsDrawerOpen(prev => open ?? !prev)
  }, [])

  const setNavState = useCallback((newState: NavState) => {
    setState(newState)
    // Only persist valid sidebar states
    if (newState === "icon" || newState === "expanded") {
        localStorage.setItem("coolcrm-nav-state", newState)
    }
  }, [])

  return (
    <NavigationContext.Provider value={{ mode, state, isDrawerOpen, toggleDrawer, setNavState }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) throw new Error("useNavigation must be used within NavigationProvider")
  return context
}
