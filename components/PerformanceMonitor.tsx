"use client"

import React from "react"

interface PerformanceMonitorProps {
  children: React.ReactNode
}

export function PerformanceMonitor({ children }: PerformanceMonitorProps) {
  const [renderCount, setRenderCount] = React.useState(0)
  const [lastRenderTime, setLastRenderTime] = React.useState<number>(0)

  // Fixed: Add empty dependency array to prevent infinite re-renders
  React.useEffect(() => {
    const now = performance.now()
    setRenderCount(prev => prev + 1)
    setLastRenderTime(now)
  }, []) // Empty deps - only run on mount

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {children}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50">
        Renders: {renderCount} | Last: {lastRenderTime.toFixed(0)}ms
      </div>
    </div>
  )
}