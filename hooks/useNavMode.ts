"use client"

import { useNavigation } from "@/components/NavigationProvider"
export { useNavigation } // Redirect to the Context implementation which is now the source of truth

// Compatibility Adapter
export function useNavMode() {
    const nav = useNavigation()
    return {
        mode: nav.mode,
        state: nav.state,
        setState: nav.setNavState, // Adapter
        isDrawerOpen: nav.isDrawerOpen,
        toggleDrawer: nav.toggleDrawer
    }
}
