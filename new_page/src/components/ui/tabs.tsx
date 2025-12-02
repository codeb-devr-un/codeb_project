"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const tabsListVariants = cva(
  "inline-flex items-center justify-center p-1.5 gap-1",
  {
    variants: {
      variant: {
        default: "bg-slate-100 rounded-2xl",
        glass: "bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg shadow-black/5",
        pill: "bg-transparent gap-2",
        underline: "bg-transparent border-b border-slate-200 rounded-none p-0 gap-4",
      },
      size: {
        default: "h-10",
        sm: "h-8",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-xl px-4 py-1.5 text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:text-slate-900",
        glass:
          "rounded-xl px-4 py-1.5 text-slate-600 data-[state=active]:bg-white/80 data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:text-slate-900",
        lime:
          "rounded-xl px-4 py-1.5 text-slate-600 data-[state=active]:bg-black data-[state=active]:text-lime-400 data-[state=active]:shadow-lg data-[state=active]:shadow-lime-400/20 hover:text-slate-900",
        pill:
          "rounded-full px-5 py-2 bg-slate-100 text-slate-600 data-[state=active]:bg-black data-[state=active]:text-lime-400 hover:bg-slate-200",
        underline:
          "px-1 pb-3 text-slate-500 border-b-2 border-transparent rounded-none data-[state=active]:border-lime-400 data-[state=active]:text-slate-900 hover:text-slate-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

interface TabsListProps
  extends React.ComponentProps<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

function TabsList({
  className,
  variant,
  size,
  ...props
}: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, size, className }))}
      {...props}
    />
  );
}

interface TabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

function TabsTrigger({
  className,
  variant,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, className }))}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
