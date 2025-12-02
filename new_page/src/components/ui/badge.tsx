import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground rounded-lg [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground rounded-lg [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white rounded-lg [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground border-slate-200 rounded-lg [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Glass Morphism variants
        lime:
          "border-transparent bg-lime-400 text-black rounded-lg font-semibold",
        limeDark:
          "border-transparent bg-black text-lime-400 rounded-lg font-semibold",
        limeOutline:
          "border-lime-400 text-lime-600 bg-lime-50 rounded-lg",
        glass:
          "border-white/40 bg-white/60 backdrop-blur-sm text-slate-700 rounded-lg",
        glassDark:
          "border-white/20 bg-black/60 backdrop-blur-sm text-white rounded-lg",
        // Status badges
        success:
          "border-transparent bg-emerald-100 text-emerald-700 rounded-lg",
        warning:
          "border-transparent bg-amber-100 text-amber-700 rounded-lg",
        error:
          "border-transparent bg-rose-100 text-rose-700 rounded-lg",
        info:
          "border-transparent bg-sky-100 text-sky-700 rounded-lg",
        // Soft variants
        softSlate:
          "border-transparent bg-slate-100 text-slate-600 rounded-lg",
        softPurple:
          "border-transparent bg-purple-100 text-purple-700 rounded-lg",
        softBlue:
          "border-transparent bg-blue-100 text-blue-700 rounded-lg",
        softPink:
          "border-transparent bg-pink-100 text-pink-700 rounded-lg",
      },
      size: {
        default: "h-5 text-xs px-2.5",
        sm: "h-4 text-[10px] px-2",
        lg: "h-6 text-sm px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
