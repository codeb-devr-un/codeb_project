"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar@1.1.3";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default: "rounded-full",
        rounded: "rounded-xl",
        roundedLg: "rounded-2xl",
        square: "rounded-lg",
      },
      size: {
        default: "size-10",
        xs: "size-6",
        sm: "size-8",
        lg: "size-12",
        xl: "size-16",
        "2xl": "size-20",
        "3xl": "size-24",
      },
      border: {
        none: "",
        default: "border-2 border-white shadow-sm",
        lime: "border-2 border-lime-400 shadow-sm shadow-lime-400/20",
        glass: "border border-white/40 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      border: "none",
    },
  }
);

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

function Avatar({
  className,
  variant,
  size,
  border,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ variant, size, border, className }))}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

const avatarFallbackVariants = cva(
  "flex size-full items-center justify-center font-medium",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-600 rounded-full",
        lime: "bg-lime-100 text-lime-600 rounded-full",
        glass: "bg-white/60 backdrop-blur-sm text-slate-600 rounded-full",
        dark: "bg-slate-800 text-white rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback>,
    VariantProps<typeof avatarFallbackVariants> {}

function AvatarFallback({
  className,
  variant,
  ...props
}: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants, avatarFallbackVariants };
