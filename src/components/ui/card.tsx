import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ===========================================
// Glass Morphism Card Variants
// ===========================================

const cardVariants = cva(
  "text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "rounded-xl border bg-card shadow",
        glass: "rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5",
        widget: "rounded-3xl bg-white/50 backdrop-blur-md border border-white/40",
        accent: "rounded-3xl bg-black text-lime-400 shadow-lg shadow-black/20",
        elevated: "rounded-3xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-black/5",
        outline: "rounded-3xl bg-white/30 backdrop-blur-sm border border-white/60",
      },
      hover: {
        none: "",
        lift: "hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        glow: "hover:shadow-xl hover:shadow-lime-400/10 hover:border-lime-400/30 cursor-pointer",
        scale: "hover:scale-[1.02] cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "glass",
      hover: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-bold text-slate-900 leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// ===========================================
// Glass Widget Card (for dashboard stats)
// ===========================================

interface GlassWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  value: string | number
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  accent?: boolean
}

const GlassWidget = React.forwardRef<HTMLDivElement, GlassWidgetProps>(
  ({ className, icon, title, value, change, accent = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl p-6 transition-all duration-300",
        accent
          ? "bg-black text-lime-400 shadow-lg shadow-black/20"
          : "bg-white/50 backdrop-blur-md border border-white/40 shadow-lg shadow-black/5",
        "hover:shadow-xl hover:-translate-y-1",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            accent ? "text-lime-400/80" : "text-slate-500"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            accent ? "text-lime-400" : "text-slate-900"
          )}>
            {value}
          </p>
          {change && (
            <p className={cn(
              "text-xs font-medium",
              change.type === 'increase' && "text-emerald-500",
              change.type === 'decrease' && "text-red-500",
              change.type === 'neutral' && (accent ? "text-lime-400/60" : "text-slate-400")
            )}>
              {change.type === 'increase' && '↑ '}
              {change.type === 'decrease' && '↓ '}
              {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-2xl",
            accent
              ? "bg-lime-400/20 text-lime-400"
              : "bg-slate-100 text-slate-500"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
)
GlassWidget.displayName = "GlassWidget"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  GlassWidget,
  cardVariants,
}
