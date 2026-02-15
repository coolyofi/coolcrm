"use client"

import React from 'react'
import toast from 'react-hot-toast'

export function showDemoBlockedToast(onRegister?: () => void) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  toast.custom((t) => (
    <div className="max-w-md w-full bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] text-[var(--fg)] p-4 rounded-xl shadow-xl flex items-center gap-4">
      <div className="flex-1 text-sm">演示模式下无法进行此操作。若想保存数据，请注册或登录。</div>
      <div className="flex gap-2">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-4 py-2 rounded-lg bg-[var(--surface-solid)]/60 hover:bg-[var(--surface-solid)]/80 text-sm transition-all"
        >
          继续浏览
        </button>
        <button
          onClick={() => {
            try {
              if (onRegister) onRegister()
              else window.location.href = '/login'
            } finally {
              toast.dismiss(t.id)
            }
          }}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:brightness-110 text-white text-sm shadow-lg shadow-blue-500/25 transition-all"
        >
          注册
        </button>
      </div>
    </div>
  ), {
    position: isMobile ? 'bottom-center' : 'top-center'
  })
}

export default showDemoBlockedToast
