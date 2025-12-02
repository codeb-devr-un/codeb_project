"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-lime-400 data-[state=on]:text-black [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-lime-400/50 outline-none transition-all duration-200 aria-invalid:ring-rose-200 aria-invalid:border-rose-400 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 hover:border-lime-300 data-[state=on]:border-lime-400",
        glass:
          "bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 data-[state=on]:bg-lime-400 data-[state=on]:border-lime-400",
        lime:
          "bg-lime-50 text-lime-700 hover:bg-lime-100 data-[state=on]:bg-lime-400 data-[state=on]:text-black",
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-8 px-2 min-w-8",
        lg: "h-11 px-4 min-w-11",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
        iconLg: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
