"use client"

import React from 'react'
import { isDemo } from '@/lib/demo'
import { useRouter } from 'next/navigation'

export default function DemoBanner() {
  const router = useRouter()
  if (!isDemo()) return null

  if (typeof window === 'undefined') return null

  // Bricks is not available, render a lightweight fallback banner
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} className="bg-blue-600 text-white w-full py-2">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <div className="text-sm">演示账户 — 写入已被禁用。 <a href="#" onClick={(e) => { e.preventDefault(); router.push('/login') }} className="underline">注册/登录</a></div>
      </div>
    </div>
  )
}
