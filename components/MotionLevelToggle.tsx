"use client"

import { useNav } from "@/components/navigation/NavigationProvider"

export function MotionLevelToggle() {
  const { motionLevel, setMotionLevel } = useNav()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setMotionLevel(motionLevel === 'stable' ? 'apple' : 'stable')}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg shadow-lg hover:bg-[var(--primary)]/80 transition-colors"
      >
        Motion: {motionLevel}
      </button>
    </div>
  )
}