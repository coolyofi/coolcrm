"use client"

import Link from "next/link"
import { useAuth } from "./AuthProvider"
import { usePathname } from "next/navigation"
import { useNavigation } from "./NavigationProvider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const { layoutMode, isDrawerOpen, isSidebarCollapsed, toggleDrawer, setDrawerOpen, toggleSidebar } = useNavigation()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])
  
  // Close drawer on route change (Mobile)
  useEffect(() => {
    if (layoutMode === "mobile") {
       setDrawerOpen(false)
    }
  }, [pathname, layoutMode, setDrawerOpen])


  if (loading || !user) return null

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { name: "Customers", path: "/history", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { name: "Visits", path: "/visits", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { name: "Settings", path: "/settings", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
  ]

  // Render Logic Breakdown

  // 1. Mobile Top Bar
  if (layoutMode === "mobile") {
    return (
      <>
        {/* Top Glass Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-[60px] glass border-b border-[var(--glass-border)] flex items-center justify-between px-4 safe-area-top backdrop-blur-md bg-[var(--glass-bg)]">
           {/* Menu Trigger */}
           <button onClick={toggleDrawer} className="p-2 -ml-2 text-[var(--fg)] active:scale-95 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
           </button>
           
           {/* Brand */}
           <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)]">
             CoolCRM
           </span>

           {/* Quick Action */}
           <Link href="/add" className="p-2 -mr-2 text-[var(--primary)] active:scale-95 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
           </Link>
        </div>

        {/* Floating Drawer Overlay */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[60]">
             {/* Backdrop */}
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
             
             {/* Drawer Content */}
             <div className="absolute top-[60px] left-0 right-0 bg-[var(--bg)]/95 glass border-b border-[var(--glass-border)] rounded-b-[24px] shadow-2xl p-4 animate-slide-down flex flex-col gap-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`
                        flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' 
                          : 'text-[var(--fg)] hover:bg-[var(--surface-solid)]'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                      {item.name}
                    </Link>
                  )
                })}
                <div className="h-px bg-[var(--border)] my-2" />
                <button
                  onClick={signOut}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-all w-full text-left"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                   Sign Out
                </button>
             </div>
          </div>
        )}
        {/* Spacer for content */}
        <div className="h-[60px]" />
      </>
    )
  }

  // 2. Tablet (Collapsible Sidebar) & 3. Desktop (Persistent Sidebar)
  // Shared Sidebar Component logic
  const sidebarWidth = isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'
  
  return (
    <>
      <aside className={`
        fixed left-0 top-0 bottom-0 z-40
        ${sidebarWidth} glass border-r border-[var(--glass-border)]
        flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
      `}>
         {/* Sidebar Header */}
         <div className={`h-[80px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--fg)] to-[var(--fg-muted)] bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
                CoolCRM
              </h1>
            )}
            {/* Collapse Toggle (Tablet Only) */}
            {layoutMode === "tablet" && (
                <button onClick={toggleSidebar} className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     {isSidebarCollapsed ? (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                     ) : (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                     )}
                   </svg>
                </button>
            )}
             {/* Logo Icon when collapsed */}
             {isSidebarCollapsed && (
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-blue-300" />
             )}
         </div>

         {/* Nav Items */}
         <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
           {menuItems.map((item) => {
             const isActive = pathname === item.path
             return (
               <Link
                 key={item.path}
                 href={item.path}
                 title={isSidebarCollapsed ? item.name : undefined}
                 className={`
                   flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap
                   ${isActive 
                     ? 'bg-[var(--surface-solid)] shadow-sm text-[var(--fg)]' 
                     : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-solid)]/50'
                   }
                   ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                 `}
               >
                 <svg className={`w-5 h-5 flex-shrink-0 duration-200 ${isActive ? 'text-[var(--primary)]' : ''} ${isSidebarCollapsed ? '' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   {item.icon}
                 </svg>
                 {!isSidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
               </Link>
             )
           })}
         </nav>

         {/* Footer */}
         <div className="p-4 border-t border-[var(--border)]">
           <button
             onClick={signOut}
             title="Sign Out"
             className={`
               flex items-center gap-3 w-full rounded-xl transition-colors
               ${isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3 text-sm text-[var(--fg-muted)] hover:text-[var(--danger)]'}
             `}
           >
             <svg className={`w-5 h-5 flex-shrink-0 ${isSidebarCollapsed ? 'text-[var(--danger)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
             </svg>
             {!isSidebarCollapsed && <span>Sign Out</span>}
           </button>
         </div>
      </aside>
      
      {/* Spacer to push content to the right of the fixed sidebar */}
      <div className={`${sidebarWidth} transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex-shrink-0 hidden md:block`} />
    </>
  )
}
