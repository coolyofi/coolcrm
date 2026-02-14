"use client"

import { useNav as useNavFromProvider } from "./NavigationProvider"

// Thin wrapper to expose the context.
// In the future, we can add selectors or computed properties here without breaking the API.
export const useNav = () => useNavFromProvider()
