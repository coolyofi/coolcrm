import { useState, useEffect, useCallback } from 'react'

export type NavMode = 'mobile' | 'tablet' | 'desktop'
export type NavState = 'closed' | 'icon' | 'expanded'

export function useNavMode() {
  const [mode, setMode] = useState<NavMode>('mobile')
  const [state, setState] = useState<NavState>('closed')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleResize = useCallback(() => {
    const width = window.innerWidth
    if (width < 768) {
      setMode('mobile')
      // Only reset state if we are moving INTO mobile from larger
      // But actually, in mobile, state doesn't matter as much as isDrawerOpen
      // We can sync them.
    } else if (width < 1024) {
      setMode('tablet')
      setState('icon')
      setIsDrawerOpen(false) 
    } else {
      setMode('desktop')
      setState('expanded') 
      setIsDrawerOpen(false)
    }
  }, [])

  useEffect(() => {
    // Initial check
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Sync drawer open state with nav state for mobile
  const toggleDrawer = (open?: boolean) => {
    if (open !== undefined) {
      setIsDrawerOpen(open)
    } else {
      setIsDrawerOpen(prev => !prev)
    }
  }

  // Allow manual toggle of sidebar in tablet/desktop
  const setNavState = (newState: NavState) => {
    setState(newState)
  }

  return {
    mode,
    state,
    setState: setNavState,
    isDrawerOpen,
    toggleDrawer
  }
}
