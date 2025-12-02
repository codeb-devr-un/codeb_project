import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const inputVariants = cva(
  "flex w-full min-w-0 text-base transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 placeholder:text-slate-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20",
        glass:
          "h-10 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 px-4 py-2 placeholder:text-slate-400 focus:bg-white/80 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20",
        glassDark:
          "h-10 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 px-4 py-2 text-white placeholder:text-white/50 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20",
        floating:
          "h-12 rounded-2xl bg-white shadow-lg shadow-black/5 border-0 px-5 py-3 placeholder:text-slate-400 focus:shadow-xl focus:ring-2 focus:ring-lime-400/30",
        minimal:
          "h-10 rounded-lg border-0 bg-slate-50 px-4 py-2 placeholder:text-slate-400 focus:bg-slate-100 focus:ring-2 focus:ring-lime-400/20",
      },
      inputSize: {
        default: "h-10",
        sm: "h-8 text-sm px-3",
        lg: "h-12 px-5",
        xl: "h-14 px-6 text-base rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, inputSize, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, inputSize, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
