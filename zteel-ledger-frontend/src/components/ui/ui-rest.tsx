// badge.tsx
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning"
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span className={cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    variant === "default" && "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    variant === "success" && "bg-green-500/15 text-green-400 border border-green-500/20",
    variant === "danger" && "bg-red-500/15 text-red-400 border border-red-500/20",
    variant === "warning" && "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
    className
  )} {...props} />
)

// input.tsx
import { InputHTMLAttributes, forwardRef } from "react"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60 disabled:opacity-50 transition-colors",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"

// select.tsx
import { SelectHTMLAttributes } from "react"

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60 transition-colors",
        className
      )}
      {...props}
    />
  )
)
Select.displayName = "Select"