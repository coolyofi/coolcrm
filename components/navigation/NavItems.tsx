"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItemProps {
  label: string
  href: string
  icon: React.ReactNode
  collapsed?: boolean
  onClick?: () => void
}

export function NavItem({ label, href, icon, collapsed, onClick }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200
        ${isActive 
          ? 'bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20' 
          : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-white/5'
        }
        ${collapsed ? 'justify-center px-2' : ''}
      `}
      title={collapsed ? label : undefined}
    >
      <div className={`w-6 h-6 shrink-0 ${collapsed ? '' : ''}`}>
        {icon}
      </div>
      {!collapsed && (
        <span className="font-medium truncate text-sm">
          {label}
        </span>
      )}
    </Link>
  )
}
