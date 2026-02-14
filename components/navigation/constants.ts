/**
 * Navigation Constants
 * 
 * Menu items and legacy constants
 * For tokens (z-index, dimensions), see tokens.ts
 */

export const NAV_STORAGE_KEY = "coolcrm.nav.state" as const

// Menu items configuration
export const MENU_ITEMS = [
    { name: "Dashboard", path: "/", iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Customers", path: "/history", iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Visits", path: "/visits", iconPath: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
    { name: "Settings", path: "/settings", iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
]

// UI contract constants used across navigation and header
export const UI_CONTRACT = {
  TOPBAR_HEIGHT_PX: 72, // canonical topbar height; update here to keep layout in sync
  PAGE_HEADER_SCROLL_DISTANCE: 56,
  PAGE_HEADER_TITLE: {
    INITIAL: 34,
    MIN: 17,
  }
} as const

export const calculateTitleSize = (progress: number) => {
  const { INITIAL, MIN } = UI_CONTRACT.PAGE_HEADER_TITLE
  return INITIAL - (INITIAL - MIN) * Math.min(Math.max(progress, 0), 1)
}

// Navigation layout constants
export const NAV_LAYOUT = {
  WIDTH: {
    EXPANDED: 260,
    ICON: 72,
    CLOSED: 72,
  },
  PROXIMITY: {
    LEFT_EDGE: 60,
    RIGHT_EDGE: 300,
  },
  TOPBAR: {
    COLLAPSED_PX: 60,
  }
} as const
