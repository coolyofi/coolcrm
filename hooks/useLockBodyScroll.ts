import { useLayoutEffect } from 'react'

export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    const scrollBarWidth = window.innerWidth - document.body.clientWidth

    // Lock body
    document.body.style.overflow = 'hidden'
    
    // Prevent shift if scrollbar exists
    if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalStyle
      document.body.style.paddingRight = '0px'
    }
  }, [locked])
}
