"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { NavMode, NavState } from "./constants"
import { DEFAULT_DESKTOP_STATE, DEFAULT_TABLET_STATE, NAV_STORAGE_KEY } from "./constants"
import { useNavMode } from "./useNavMode"
import { useLockBodyScroll } from "./useLockBodyScroll"
import { usePrefersReducedMotion } from "./usePrefersReducedMotion"

type PersistedState = Exclude<NavState, "closed"> // icon | expanded

type NavContextValue = {
  mode: NavMode
  state: NavState
  drawerOpen: boolean

  // Derived
  navWidthPx: number // Used for content padding-left
  elevated: boolean // Apple animation enhancement: content scale when drawer open
  reducedMotion: boolean

  // Actions
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void

  setExpanded: () => void
  setIcon: () => void
  toggleSidebar: () => void
}

const NavContext = createContext<NavContextValue | null>(null)

function readPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(NAV_STORAGE_KEY)
    if (raw === "icon" || raw === "expanded") return raw as PersistedState
    return null
  } catch {
    return null
  }
}

function writePersisted(v: PersistedState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NAV_STORAGE_KEY, v)
  } catch {
    // ignore
  }
}

function getNavWidth(mode: NavMode, state: NavState): number {
  if (mode === "mobile") return 0
  if (state === "icon") return 72
  if (state === "expanded") return 260
  return 0
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const mode = useNavMode()
  const reducedMotion = usePrefersReducedMotion()

  // Sidebar state (meaningful only for tablet/desktop)
  const [state, setState] = useState<NavState>(() => {
    // Default initial state
    return DEFAULT_DESKTOP_STATE
  })
  
  // Hydrate persistence after mount to match hydration
  useEffect(() => {
    const persisted = readPersisted()
    if (persisted) {
        setState(persisted)
    }
  }, [])

  // Drawer (mobile only)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Lock body when drawer is open on mobile
  // Note: We check mode to be safe, but drawer logic usually implies mobile
  useLockBodyScroll(mode === "mobile" && drawerOpen)

  // Critical: Reset rules when mode changes
  useEffect(() => {
    if (mode === "mobile") {
      setDrawerOpen(false)
      setState("closed") // mobile sidebar is effectively closed
      return
    }

    // tablet / desktop: restore persistence or default
    const persisted = readPersisted()
    if (mode === "tablet") {
      setState(persisted ?? DEFAULT_TABLET_STATE)
    } else {
      setState(persisted ?? DEFAULT_DESKTOP_STATE)
    }
  }, [mode])

  // Esc key handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (mode === "mobile" && drawerOpen) setDrawerOpen(false)
      // tablet/desktop optional: if expanded, collapse to icon?
      // User requested functionality:
      if (mode !== "mobile" && state === "expanded") {
        setState("icon")
        writePersisted("icon")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mode, drawerOpen, state])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setDrawerOpen(v => !v), [])

  const setExpanded = useCallback(() => {
    if (mode === "mobile") return
    setState("expanded")
    writePersisted("expanded")
  }, [mode])

  const setIcon = useCallback(() => {
    if (mode === "mobile") return
    setState("icon")
    writePersisted("icon")
  }, [mode])

  const toggleSidebar = useCallback(() => {
    if (mode === "mobile") return
    setState(prev => {
      const next: PersistedState = prev === "expanded" ? "icon" : "expanded"
      writePersisted(next)
      return next
    })
  }, [mode])

  const navWidthPx = useMemo(() => getNavWidth(mode, state), [mode, state])

  // Apple animation enhancement: Only elevate (scale down) content if on mobile + drawer open
  const elevated = mode === "mobile" && drawerOpen

  const value = useMemo<NavContextValue>(() => ({
    mode,
    state,
    drawerOpen,
    navWidthPx,
    elevated,
    reducedMotion,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    setExpanded,
    setIcon,
    toggleSidebar,
  }), [mode, state, drawerOpen, navWidthPx, elevated, reducedMotion, openDrawer, closeDrawer, toggleDrawer, setExpanded, setIcon, toggleSidebar])

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

// Internal hook access (or use the separate useNav.ts)
export function useNavContext() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("useNav must be used within NavigationProvider")
  return ctx
}
