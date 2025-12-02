import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Glass Morphism variants
        glass:
          "bg-white/60 backdrop-blur-sm border border-white/40 text-slate-700 hover:bg-white/80 hover:shadow-lg hover:-translate-y-0.5 shadow-sm",
        glassDark:
          "bg-black/80 backdrop-blur-sm border border-white/10 text-white hover:bg-black/90 hover:shadow-lg hover:-translate-y-0.5",
        limePrimary:
          "bg-black text-lime-400 hover:bg-lime-400 hover:text-black shadow-lg shadow-black/10 font-bold",
        limeSecondary:
          "bg-lime-400 text-black hover:bg-lime-500 shadow-lg shadow-lime-400/20 font-bold",
        limeOutline:
          "border-2 border-lime-400 text-lime-600 hover:bg-lime-400 hover:text-black bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-2xl px-8 has-[>svg]:px-6 text-base",
        icon: "size-10 rounded-xl",
        iconSm: "size-8 rounded-lg",
        iconLg: "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
