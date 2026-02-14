"use client"

import { usePathname } from 'next/navigation'
import { useNavigation } from "@/components/navigation/NavigationProvider"

export function MotionLevelToggle() {
  const { motionLevel, setMotionLevel } = useNavigation()
  const pathname = usePathname()

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  // Smart positioning to avoid bottom action buttons on add/edit pages
  const isOnActionPage = pathname.startsWith('/add') || pathname.startsWith('/edit')
  const positionClasses = isOnActionPage 
    ? "fixed bottom-20 left-4 z-[var(--z-overlay)]" 
    : "fixed bottom-20 right-4 z-[var(--z-overlay)]"

  return (
    <div className={positionClasses}>
      <button
        onClick={() => setMotionLevel(motionLevel === 'stable' ? 'apple' : 'stable')}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg shadow-lg hover:bg-[var(--primary)]/80 transition-colors text-sm"
      >
        Motion: {motionLevel}
      </button>
    </div>
  )
}