"use client"

import { useNav } from "@/components/navigation/NavigationProvider"

export function MotionLevelToggle() {
  const { motionLevel, setMotionLevel } = useNav()

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <button
        onClick={() => setMotionLevel(motionLevel === 'stable' ? 'apple' : 'stable')}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg shadow-lg hover:bg-[var(--primary)]/80 transition-colors text-sm"
      >
        Motion: {motionLevel}
      </button>
    </div>
  )
}