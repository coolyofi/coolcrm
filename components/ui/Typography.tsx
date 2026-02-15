"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "lead" | "large" | "small" | "muted"
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "p", as, ...props }, ref) => {
    const Component = as || "p"

    const variantClasses = {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-[var(--fg)]",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight text-[var(--fg)]",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-[var(--fg)]",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight text-[var(--fg)]",
      h5: "scroll-m-20 text-lg font-semibold text-[var(--fg)]",
      h6: "scroll-m-20 text-base font-semibold text-[var(--fg)]",
      p: "leading-7 text-[var(--fg)]",
      lead: "text-xl text-[var(--fg-muted)]",
      large: "text-lg font-semibold text-[var(--fg)]",
      small: "text-sm font-medium leading-none text-[var(--fg)]",
      muted: "text-sm text-[var(--fg-muted)]",
    }

    return React.createElement(
      Component as any,
      {
        ref,
        className: cn(variantClasses[variant], className),
        ...props,
      }
    )
  }
)
Typography.displayName = "Typography"

export { Typography }