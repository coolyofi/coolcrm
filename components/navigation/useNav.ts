"use client"

import { useNavigation as useNavigationFromProvider } from "./NavigationProvider"

// Compatibility shim: re-export the canonical `useNavigation` under the
// legacy `useNav` name so older imports keep working during migration.
export const useNav = () => useNavigationFromProvider()
