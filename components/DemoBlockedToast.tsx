"use client"

import React from 'react'
import toast from 'react-hot-toast'

export function showDemoBlockedToast(onRegister?: () => void) {
  toast.custom((t) => (
    <div className="max-w-md w-full bg-[var(--surface-solid)] text-[var(--fg)] p-3 rounded-lg shadow-lg flex items-center gap-3">
      <div className="flex-1 text-sm">演示模式下无法进行此操作。若想保存数据，请注册或登录。</div>
      <div className="flex gap-2">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 rounded bg-white/5 text-sm"
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
          className="px-3 py-1 rounded bg-[var(--primary)] text-white text-sm"
        >
          注册/登录
        </button>
      </div>
    </div>
  ))
}

export default showDemoBlockedToast
