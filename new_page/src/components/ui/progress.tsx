"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full transition-all",
  {
    variants: {
      variant: {
        default: "bg-slate-100",
        glass: "bg-white/40 backdrop-blur-sm",
        dark: "bg-slate-800",
        lime: "bg-lime-100",
      },
      size: {
        default: "h-2",
        sm: "h-1",
        md: "h-3",
        lg: "h-4",
        xl: "h-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-out",
  {
    variants: {
      indicatorVariant: {
        default: "bg-primary",
        lime: "bg-lime-400",
        emerald: "bg-emerald-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
        pink: "bg-pink-500",
        gradient: "bg-gradient-to-r from-lime-400 to-emerald-400",
        gradientPurple: "bg-gradient-to-r from-purple-400 to-pink-400",
        gradientBlue: "bg-gradient-to-r from-blue-400 to-cyan-400",
      },
    },
    defaultVariants: {
      indicatorVariant: "default",
    },
  }
);

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {
  indicatorClassName?: string;
}

function Progress({
  className,
  value,
  variant,
  size,
  indicatorVariant,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ variant, size, className }))}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          indicatorVariants({ indicatorVariant }),
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress, progressVariants, indicatorVariants };
