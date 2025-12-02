import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ===========================================
// Glass Morphism Button Variants
// ===========================================

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Legacy variants (for backwards compatibility)
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 rounded-md",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-md",
        link: "text-primary underline-offset-4 hover:underline",

        // Glass Morphism variants - Lime/Black Theme
        limePrimary:
          "bg-black text-lime-400 hover:bg-slate-900 hover:text-lime-300 shadow-lg shadow-black/20 rounded-xl font-bold",
        limeSecondary:
          "bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-400/20 rounded-xl font-bold",

        // Glass variants
        glass:
          "bg-white/50 backdrop-blur-xl border border-white/40 text-slate-700 hover:bg-white/80 shadow-sm rounded-xl",
        ghost:
          "text-slate-500 hover:text-slate-900 hover:bg-white/60 rounded-xl",
        outline:
          "bg-white/50 border border-white/40 text-slate-600 hover:bg-white rounded-xl shadow-sm",

        // Dock icon button
        icon:
          "bg-white text-slate-400 hover:bg-lime-400 hover:text-black shadow-lg hover:scale-110 rounded-2xl",
        iconActive:
          "bg-black text-lime-400 shadow-lg shadow-lime-500/20 scale-110 rounded-2xl",

        // Danger/Warning variants with glass
        danger:
          "bg-red-500/90 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 rounded-xl font-medium",
        warning:
          "bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-lg shadow-amber-400/20 rounded-xl font-medium",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2 text-xs rounded-lg",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        xl: "h-11 px-8",
        icon: "h-9 w-9",
        iconLg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "limePrimary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// ===========================================
// Glass Icon Button (for dock-style navigation)
// ===========================================

interface IconButtonProps extends ButtonProps {
  active?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, active = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center transition-all duration-300 ease-out origin-bottom",
          active ? "-translate-y-2" : "hover:-translate-y-2",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
            active
              ? "bg-black text-lime-400 scale-110 shadow-lime-500/20"
              : "bg-white text-slate-400 hover:bg-lime-400 hover:text-black hover:scale-110 hover:shadow-lime-400/30"
          )}
        >
          {children}
        </div>
        {active && (
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black" />
        )}
      </button>
    )
  }
)
IconButton.displayName = "IconButton"

export { Button, IconButton, buttonVariants }
