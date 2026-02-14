"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useNav } from "./useNav"
import { MENU_ITEMS } from "./constants"

export function Sidebar() {
  const { state, setExpanded, setIcon, toggleSidebar, navWidthPx, mode } = useNav()
  const pathname = usePathname()

  if (mode === "mobile") return null

  const isExpanded = state === "expanded"

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 bg-[var(--glass-bg)] border-r border-[var(--border)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col backdrop-blur-xl"
      style={{ width: navWidthPx }}
    >
      {/* Header / Brand */}
      <div className="h-[60px] flex items-center px-4 border-b border-[var(--border)] shrink-0">
        <div 
            className={`font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)] overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
        >
          CoolCRM
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                  : 'text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)]'
                }
              `}
              title={!isExpanded ? item.name : undefined}
            >
              <svg 
                className={`w-6 h-6 shrink-0 transition-colors ${isActive ? "text-[var(--primary)]" : "text-current group-hover:text-[var(--fg)]"}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
              </svg>
              
              <span className={`whitespace-nowrap font-medium transition-all duration-300 origin-left ${isExpanded ? "opacity-100 w-auto scale-100" : "opacity-0 w-0 scale-90"}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-3 border-t border-[var(--border)] shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)] transition-colors"
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
        </button>
      </div>
    </aside>
  )
}
