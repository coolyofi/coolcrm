/**
 * useNavigation - Unified navigation hook
 * 
 * Single source of truth for navigation state.
 * Re-exports useNav from NavigationProvider for convenience.
 * 
 * Usage:
 *   import { useNavigation } from '@/components/navigation/hooks/useNavigation'
 *   const nav = useNavigation()
 *   // Access: nav.mode, nav.sidebar, nav.drawerOpen, nav.motion, etc.
 */

export { useNav as useNavigation } from "../NavigationProvider"
