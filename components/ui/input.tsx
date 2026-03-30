import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-on-surface placeholder:text-on-surface-variant/50 selection:bg-primary-fixed selection:text-on-surface",
        "h-12 w-full min-w-0 rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-body-lg shadow-sm transition-all outline-none",
        "file:inline-flex file:h-10 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
        "aria-invalid:ring-tertiary/20 aria-invalid:border-tertiary",
        className
      )}
      {...props}
    />
  )
}

export { Input }
