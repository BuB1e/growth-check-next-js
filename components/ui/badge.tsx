import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 py-1 text-label-sm font-black uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-primary/20",
  {
    variants: {
      variant: {
        default: "bg-primary-fixed text-primary [a&]:hover:bg-primary-fixed-dim shadow-sm",
        secondary:
          "bg-secondary-fixed text-on-secondary-fixed [a&]:hover:opacity-80 shadow-sm",
        destructive:
          "bg-error-container text-on-error-container [a&]:hover:bg-error/10 focus-visible:ring-error/20 font-bold",
        outline:
          "border-outline-variant/30 text-on-surface-variant [a&]:hover:bg-surface-container-low backdrop-blur-sm",
        ghost: "[a&]:hover:bg-surface-container-low text-on-surface-variant",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        success: "bg-primary-container text-on-primary-container shadow-sm font-bold",
        warning: "bg-tertiary-container text-on-tertiary-container shadow-sm font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
