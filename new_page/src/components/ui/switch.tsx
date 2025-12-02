"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const switchVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-lime-400 data-[state=unchecked]:bg-slate-200 focus-visible:ring-lime-400/50",
        lime:
          "data-[state=checked]:bg-lime-400 data-[state=unchecked]:bg-slate-200 focus-visible:ring-lime-400/50",
        dark:
          "data-[state=checked]:bg-black data-[state=unchecked]:bg-slate-300 focus-visible:ring-slate-400/50",
        glass:
          "data-[state=checked]:bg-lime-400 data-[state=unchecked]:bg-white/40 backdrop-blur-sm focus-visible:ring-lime-400/50",
      },
      size: {
        default: "h-6 w-11",
        sm: "h-5 w-9",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg transition-transform duration-200",
  {
    variants: {
      size: {
        default: "size-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5",
        sm: "size-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
        lg: "size-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

function Switch({
  className,
  variant,
  size,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ variant, size, className }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(thumbVariants({ size }))}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants };
