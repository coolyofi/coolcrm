/**
 * Navigation System Tokens (Stable v1)
 * 
 * Single source of truth for:
 * - z-index layering
 * - Navigation dimensions
 * - Motion timing
 * 
 * DO NOT create magic numbers elsewhere. Import from here.
 */

// ===== Z-Index Layers =====
// Content must always be below navigation layers
export const Z_INDEX = {
  CONTENT: 0,
  TOPBAR: 40,
  SIDEBAR: 50,
  DRAWER_BACKDROP: 60,
  DRAWER: 70,
  MODAL: 90,
} as const

// ===== Navigation Dimensions =====
export const NAV_DIMENSIONS = {
  SIDEBAR_EXPANDED: 260,  // px
  SIDEBAR_COLLAPSED: 72,  // px
  TOPBAR_HEIGHT: 60,      // px
  TOPBAR_HEIGHT_LARGE: 72, // px (with large title)
} as const

// ===== Motion Tokens =====
export const MOTION = {
  DURATIONS: {
    FAST: 120,   // ms
    BASE: 200,   // ms
    SLOW: 300,   // ms
  },
  EASING: {
    SPRING: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const

// ===== Breakpoints =====
export const BREAKPOINTS = {
  MOBILE_MAX: 767,    // <= 767px is mobile
  TABLET_MAX: 1023,   // 768-1023px is tablet (iPad)
  DESKTOP_MIN: 1024,  // >= 1024px is desktop
} as const

// ===== Device Mode Types =====
export type DeviceMode = "mobile" | "tablet" | "desktop"
export type NavMode = "drawer" | "sidebar"

/**
 * Get navigation mode based on device
 */
export function getNavMode(deviceMode: DeviceMode): NavMode {
  return deviceMode === "mobile" ? "drawer" : "sidebar"
}

/**
 * Get device mode from window width
 */
export function getDeviceMode(width: number): DeviceMode {
  if (width <= BREAKPOINTS.MOBILE_MAX) return "mobile"
  if (width <= BREAKPOINTS.TABLET_MAX) return "tablet"
  return "desktop"
}
