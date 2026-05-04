import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-100/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-700 hover:bg-green-100/80",
        info: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100/80",
        warning: "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80",
        neutral: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-6 px-2 text-xs rounded",
        sm: "h-5 px-1.5 text-[11px] rounded",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
