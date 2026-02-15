"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "danger"
  size?: "sm" | "md" | "lg" | "xl" | "icon"
  asChild?: boolean
  compactThreshold?: number // 当宽度小于此值时，只显示图标
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, compactThreshold = 100, ...props }, ref) => {
    const [showText, setShowText] = useState(true)

    useEffect(() => {
      if (asChild) return
      if (!ref || typeof ref === 'function') return

      const element = ref.current
      if (!element) return

      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          setShowText(entry.contentRect.width >= compactThreshold)
        }
      })
      observer.observe(element)

      return () => observer.disconnect()
    }, [ref, compactThreshold, asChild])

    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden text-ellipsis"

    const variantClasses = {
      primary: "bg-[var(--primary)] text-white shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95",
      secondary: "bg-transparent text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--glass-bg)] hover:text-[var(--fg)]",
      outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--glass-bg)] hover:text-[var(--fg)]",
      ghost: "hover:bg-[var(--glass-bg)] hover:text-[var(--fg)]",
      link: "text-[var(--primary)] underline-offset-4 hover:underline",
      danger: "bg-[var(--danger)] text-white shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95",
    }

    const sizeClasses = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 py-2",
      lg: "h-10 px-6 py-2.5",
      xl: "h-12 px-8 py-3 text-base",
      icon: "h-9 w-9",
    }

    // 处理children：如果有多个子元素，第一个是图标，其余是文本
    const childrenArray = React.Children.toArray(props.children)
    const hasIcon = childrenArray.length > 1
    const icon = hasIcon ? childrenArray[0] : null
    const text = hasIcon ? childrenArray.slice(1) : childrenArray

    const displayChildren = showText ? props.children : (hasIcon ? icon : props.children)

    if (asChild && React.isValidElement(props.children)) {
      const { children: _, ...restProps } = props
      return React.cloneElement(props.children, {
        className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className),
        ref,
        ...restProps,
      } as any)
    }

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      >
        {displayChildren}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }