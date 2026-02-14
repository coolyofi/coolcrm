"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useNav } from "./NavigationProvider"
import { MENU_ITEMS } from "./constants"
import { useScrollVelocity } from "../../hooks/useScrollVelocity"
import { Z_INDEX, NAV_DIMENSIONS } from "./tokens"

/**
 * SidebarDesktop - Full-height sidebar for tablet/desktop
 * 
 * Requirements:
 * - Fixed positioning from top to bottom (h-screen)
 * - Menu area uses flex-1 for flexible height
 * - Bottom actions use mt-auto to stick to bottom
 * - Only renders on tablet/desktop (NavigationRoot handles this)
 */
export function SidebarDesktop() {
  const { mode, sidebar, toggle, motion } = useNav()
  const pathname = usePathname()
  const v = useScrollVelocity("content-scroll")

  // Only show on tablet/desktop
  if (mode === "mobile") return null

  // Velocity boost: only for apple motion level
  const boost = Math.min(10, v * 6)
  const blur = 28 + boost

  const isExpanded = sidebar === "expanded"
  const collapsed = !isExpanded

  const sidebarWidth = collapsed 
    ? NAV_DIMENSIONS.SIDEBAR_COLLAPSED 
    : NAV_DIMENSIONS.SIDEBAR_EXPANDED

  return (
    <aside
      className="fixed left-0 top-0 h-[100dvh] flex flex-col select-none transition-[width] ease-[var(--ease)]"
      style={{
        width: `${sidebarWidth}px`,
        zIndex: Z_INDEX.SIDEBAR,
        transitionDuration: `${motion.durations.base}ms`
      }}
    >
      <div className="h-full p-3">
        <div 
          className="h-full rounded-2xl border border-white/20 bg-white/55 backdrop-blur-[18px] shadow-[var(--shadow-elev-1)] flex flex-col overflow-hidden" 
          style={{ 
            "--glass-blur-scrolled": `${blur}px`
          } as React.CSSProperties}
        >
          {/* Top */}
          <div className="px-3 pt-3">
            <div className="h-14 flex items-center gap-2">
              <svg className="h-8 w-8 rounded-xl bg-black/10 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {!collapsed && <div className="min-w-0 font-semibold truncate text-[var(--fg)]">CoolCRM</div>}
            </div>
          </div>

          {/* Nav items - flex-1 for menu area */}
          <nav className="mt-3 flex-1 px-2 space-y-1 overflow-y-auto">
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

          {/* Bottom actions - mt-auto 固定到底 */}
          <div className="mt-auto p-2 border-t border-[var(--border)]">
            <button
              className="h-11 w-full rounded-xl flex items-center justify-center gap-2 hover:bg-black/5 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
              onClick={toggle}
              title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg
                className={`w-6 h-6 transition-all duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
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