"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useNav } from "./useNav"
import { MENU_ITEMS } from "./constants"
import { useScrollVelocity } from "../../hooks/useScrollVelocity"

export function Sidebar() {
  const { state, toggleSidebar, navWidthPx, proximity, mode, motionLevel } = useNav()
  const pathname = usePathname()
  const v = useScrollVelocity("content-scroll")

  // Velocity boost: only for apple motion level
  const boost = motionLevel === 'apple' ? Math.min(10, v * 6) : 0
  const blur = 28 + boost

  const isExpanded = state === "expanded" || (state === "icon" && proximity)
  const collapsed = !isExpanded

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 glass scrolled border-r border-[var(--border)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col backdrop-blur-xl"
      style={{ width: navWidthPx, ["--glass-blur-scrolled" as any]: `${blur}px` }}
    >
      {/* Header / Brand */}
      <div className="h-[60px] flex items-center justify-center px-4 border-b border-[var(--border)] shrink-0">
        {isExpanded ? (
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[var(--primary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)] overflow-hidden whitespace-nowrap">
              CoolCRM
            </div>
          </div>

          {/* Nav items */}
          <nav className="mt-3 flex-1 px-2 space-y-1">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    group relative h-11 rounded-xl flex items-center gap-3 px-3 transition-all duration-200
                    ${isActive 
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                      : 'text-[var(--fg-muted)] hover:bg-black/5 hover:text-[var(--fg)]'
                    }
                  `}
                  title={collapsed ? item.name : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--primary)] rounded-full"></span>
                  )}
                  <svg 
                    className={`w-6 h-6 shrink-0 transition-colors ${isActive ? "text-[var(--primary)]" : "text-current group-hover:text-[var(--fg)]"}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                  </svg>
                  
                  {!collapsed && <span className="min-w-0 truncate font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Bottom actions */}
          <div className="mt-auto p-2">
            <button
              className="h-11 w-full rounded-xl flex items-center justify-center gap-2 hover:bg-black/5 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
              onClick={toggleSidebar}
              title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!collapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
