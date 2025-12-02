import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

// ===========================================
// Glass Morphism Input Variants
// ===========================================

const inputVariants = cva(
  "flex w-full text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Legacy variant (for backwards compatibility)
        default:
          "h-9 rounded-md border border-input bg-transparent px-3 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",

        // Glass Morphism variants
        glass:
          "h-10 rounded-2xl border bg-white/60 border-white/40 px-4 py-2 shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400",
        search:
          "h-9 rounded-xl bg-white/60 border border-white/40 pl-10 pr-4 shadow-sm backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-lime-500/50 focus:border-lime-400",
        minimal:
          "h-10 rounded-xl bg-white/40 border-0 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:bg-white/60",
        solid:
          "h-10 rounded-xl bg-white border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400",
      },
      state: {
        default: "",
        error: "border-red-300 focus:ring-red-400/20 focus:border-red-400",
        success: "border-lime-300 focus:ring-lime-400/20 focus:border-lime-400",
      },
      inputSize: {
        sm: "h-8 text-xs px-3",
        default: "h-10",
        lg: "h-12 text-base px-5",
      },
    },
    defaultVariants: {
      variant: "glass",
      state: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, state, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, state, inputSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// ===========================================
// Glass Search Input (with icon)
// ===========================================

interface SearchInputProps extends InputProps {
  onSearch?: (value: string) => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch((e.target as HTMLInputElement).value)
      }
    }

    return (
      <div className={cn("relative", className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          ref={ref}
          type="search"
          className={cn(
            inputVariants({ variant: "search" }),
            "w-full"
          )}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

// ===========================================
// Glass Textarea
// ===========================================

const textareaVariants = cva(
  "flex w-full text-sm transition-all duration-300 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        glass:
          "rounded-2xl border bg-white/60 border-white/40 px-4 py-3 shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400",
        minimal:
          "rounded-xl bg-white/40 border-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:bg-white/60",
      },
      state: {
        default: "",
        error: "border-red-300 focus:ring-red-400/20 focus:border-red-400",
        success: "border-lime-300 focus:ring-lime-400/20 focus:border-lime-400",
      },
    },
    defaultVariants: {
      variant: "glass",
      state: "default",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, state, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, state, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// ===========================================
// Form Field with Label
// ===========================================

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

const FormField = ({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

export {
  Input,
  SearchInput,
  Textarea,
  FormField,
  inputVariants,
  textareaVariants,
}
