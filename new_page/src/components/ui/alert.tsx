import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-2xl border px-4 py-4 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0 [&>svg]:text-current transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/70 backdrop-blur-sm border-white/60 text-slate-900 shadow-sm",
        destructive:
          "bg-rose-50/80 backdrop-blur-sm border-rose-200 text-rose-700 [&>svg]:text-rose-500 *:data-[slot=alert-description]:text-rose-600",
        success:
          "bg-emerald-50/80 backdrop-blur-sm border-emerald-200 text-emerald-700 [&>svg]:text-emerald-500 *:data-[slot=alert-description]:text-emerald-600",
        warning:
          "bg-amber-50/80 backdrop-blur-sm border-amber-200 text-amber-700 [&>svg]:text-amber-500 *:data-[slot=alert-description]:text-amber-600",
        info:
          "bg-sky-50/80 backdrop-blur-sm border-sky-200 text-sky-700 [&>svg]:text-sky-500 *:data-[slot=alert-description]:text-sky-600",
        lime:
          "bg-lime-50/80 backdrop-blur-sm border-lime-200 text-lime-700 [&>svg]:text-lime-500 *:data-[slot=alert-description]:text-lime-600",
        glass:
          "bg-white/60 backdrop-blur-xl border-white/40 text-slate-900 shadow-lg shadow-black/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-5 font-semibold tracking-tight text-inherit",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-slate-600 col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
