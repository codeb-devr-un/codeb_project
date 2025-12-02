import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const cardVariants = cva(
  "flex flex-col gap-6 text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border rounded-2xl",
        glass: "bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-black/5",
        glassDark: "bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg text-white",
        elevated: "bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40",
        flat: "bg-slate-50 rounded-2xl border border-slate-100",
        lime: "bg-lime-400 rounded-3xl shadow-lg shadow-lime-400/20 text-slate-900",
      },
      hover: {
        none: "",
        lift: "hover:shadow-xl hover:-translate-y-1",
        glow: "hover:shadow-xl hover:shadow-lime-400/10 hover:-translate-y-0.5",
        scale: "hover:scale-[1.02] hover:shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  }
);

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, hover, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, hover, className }))}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none font-bold text-slate-900", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-slate-500 text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
