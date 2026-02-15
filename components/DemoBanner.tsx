"use client"

import React from 'react'
import { isDemo } from '@/lib/demo'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/components/navigation/NavigationProvider'

export default function DemoBanner() {
  const router = useRouter()
  const { deviceMode, isHydrated } = useNavigation()
  
  if (!isDemo()) return null
  if (!isHydrated) return null
  if (deviceMode === 'mobile') return null // Only show on tablet/desktop

  // Bricks is not available, render a lightweight fallback banner
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} className="bg-[var(--surface-solid)]/95 text-[var(--fg)] w-full py-2 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm">
          这是演示账户。如需体验完整功能，<a href="#" onClick={(e) => { e.preventDefault(); router.push('/login') }} className="text-[var(--primary)] hover:underline transition-colors font-medium">请注册</a>
        </div>
      </div>
    </div>
  )
}
