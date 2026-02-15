"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useNavigation } from "./NavigationProvider"
import { MENU_ITEMS } from "./constants"
import { useScrollVelocity } from "../../hooks/useScrollVelocity"

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
  const { deviceMode, sidebarState, toggle, motion, isHydrated, onSidebarHover } = useNavigation()
  const pathname = usePathname()
  const v = useScrollVelocity("content-scroll")

  // Only show on tablet/desktop, but hide during hydration to prevent mismatch
  if (!isHydrated || deviceMode === "mobile") return null

  // Velocity boost: only for apple motion level
  const boost = Math.min(10, v * 6)
  const blur = 28 + boost

  const isExpanded = sidebarState === "expanded"
  const collapsed = !isExpanded

  return (
    <>
      {/* Hover zone for collapsed sidebar */}
      {collapsed && (
        <div
          className="fixed left-0 top-0 bottom-0 z-10"
          style={{
            width: 'var(--nav-w-expanded)',
            zIndex: 'var(--z-nav)',
          }}
          onMouseEnter={() => onSidebarHover(true)}
          onMouseLeave={() => onSidebarHover(false)}
        />
      )}

      <aside
        id="sidebar"
        className={`sidebar fixed left-0 top-0 bottom-0 h-[100dvh] flex flex-col select-none transition-[width] ease-[var(--ease)] break-point-sm has-bg-image ${
          collapsed ? 'collapsed' : 'is-expanded'
        }`}
        style={{
          width: collapsed ? 'var(--nav-w-collapsed)' : 'var(--nav-w-expanded)',
          zIndex: 'var(--z-nav)',
          transitionDuration: `${motion.durations.base}ms`,
          overflow: 'hidden',
          height: '100dvh'
        }}
        onMouseEnter={() => onSidebarHover(true)}
        onMouseLeave={() => onSidebarHover(false)}
      >
      {/* Collapse button - Hidden as we use mouse hover */}
      {/* <a
        id="btn-collapse"
        className="sidebar-collapser"
        onClick={toggle}
        title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <i className={`ri-arrow-left-s-line ${collapsed ? 'rotate-180' : ''}`}></i>
      </a> */}

      {/* Background image wrapper */}
      <div className="image-wrapper">
        {/* Optional background image */}
      </div>

      <div className="sidebar-layout mt-6">
        {/* Header - Hidden */}
        {/* <div className="sidebar-header">
          <div className="pro-sidebar-logo">
            <div>C</div>
            <h5 className={`transition-all duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              CoolCRM
            </h5>
          </div>
        </div> */}

        {/* Content */}
        <div className="sidebar-content">
          <nav className="menu open-current-submenu">
            <ul>
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.path

                return (
                  <li key={item.path} className="menu-item">
                    <Link
                      href={item.path}
                      className={`
                        menu-link group relative flex items-center gap-4 px-3 transition-all duration-200
                        ${isActive
                          ? 'bg-transparent text-blue-600'
                          : 'text-[var(--fg-muted)] hover:bg-black/5 hover:text-[var(--fg)]'
                        }
                      `}
                      title={collapsed ? item.name : undefined}
                    >
                      <span className={`menu-icon flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                        isActive ? 'bg-transparent text-blue-600' : 'bg-transparent text-[var(--fg)] group-hover:text-[var(--fg)]'
                      }`}>
                        <svg
                          className="w-6 h-6 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                        </svg>
                      </span>

                      <span className={`menu-title min-w-0 truncate font-medium transition-all duration-200 nav-link-text ${isActive ? '!text-blue-600' : ''} ${
                        collapsed ? 'opacity-0 -translate-x-1' : 'opacity-100 translate-x-0'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-box">
            <div className={`menu-link group relative flex items-center ${collapsed ? 'justify-center px-3 py-2' : 'gap-4 px-3 py-2'} transition-all duration-200 text-[var(--fg-muted)] hover:bg-black/5 hover:text-[var(--fg)]`}>
              <span className="menu-icon flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 bg-transparent text-[var(--fg)] group-hover:text-[var(--fg)]">
                <i className="ri-information-line text-lg"></i>
              </span>
              {!collapsed && (
                <span className="menu-title min-w-0 truncate font-medium transition-all duration-200 nav-link-text text-[var(--fg)]">
                  v1.0.0
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}