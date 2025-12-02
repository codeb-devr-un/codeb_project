import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const textareaVariants = cva(
  "flex w-full text-base transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "min-h-24 rounded-xl border border-slate-200 bg-white px-4 py-3 placeholder:text-slate-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 resize-none",
        glass:
          "min-h-24 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 px-4 py-3 placeholder:text-slate-400 focus:bg-white/80 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 resize-none",
        glassDark:
          "min-h-24 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder:text-white/50 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 resize-none",
        floating:
          "min-h-32 rounded-2xl bg-white shadow-lg shadow-black/5 border-0 px-5 py-4 placeholder:text-slate-400 focus:shadow-xl focus:ring-2 focus:ring-lime-400/30 resize-none",
        minimal:
          "min-h-24 rounded-lg border-0 bg-slate-50 px-4 py-3 placeholder:text-slate-400 focus:bg-slate-100 focus:ring-2 focus:ring-lime-400/20 resize-none",
        resizable:
          "min-h-24 rounded-xl border border-slate-200 bg-white px-4 py-3 placeholder:text-slate-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 resize-y",
      },
      textareaSize: {
        default: "min-h-24",
        sm: "min-h-16 text-sm",
        lg: "min-h-36",
        xl: "min-h-48",
      },
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "default",
    },
  }
);

interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, textareaSize, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, textareaSize, className }))}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
