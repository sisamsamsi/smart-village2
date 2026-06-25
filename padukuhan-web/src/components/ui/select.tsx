import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 font-medium text-foreground pr-10 transition-colors",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

// Abstraksi untuk memudahkan transisi jika nanti pakai Radix
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectValue = ({ placeholder }: { placeholder?: string }) => <option value="" disabled>{placeholder}</option>
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectItem = ({ children, value }: { children: React.ReactNode, value: string }) => (
  <option value={value}>{children}</option>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
