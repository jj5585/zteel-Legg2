// button.tsx
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]",
          variant === "default" && "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_0_1px_rgba(249,115,22,0.3)]",
          variant === "outline" && "border border-[#333] bg-[#1a1a1a] text-[#f5f5f5] hover:bg-[#222] hover:border-[#444]",
          variant === "ghost" && "text-[#a3a3a3] hover:bg-[#222] hover:text-[#f5f5f5]",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"