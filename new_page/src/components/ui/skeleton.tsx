import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const skeletonVariants = cva(
  "animate-pulse",
  {
    variants: {
      variant: {
        default: "bg-slate-200/60 rounded-xl",
        glass: "bg-white/40 backdrop-blur-sm rounded-xl",
        dark: "bg-slate-700/50 rounded-xl",
        lime: "bg-lime-200/50 rounded-xl",
        circle: "bg-slate-200/60 rounded-full",
      },
      size: {
        default: "",
        sm: "h-4",
        md: "h-6",
        lg: "h-8",
        xl: "h-12",
        avatar: "size-10 rounded-full",
        avatarSm: "size-8 rounded-full",
        avatarLg: "size-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface SkeletonProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, size, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
