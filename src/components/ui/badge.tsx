import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        high: "border-transparent bg-status-high/15 text-status-high",
        low: "border-transparent bg-status-low/15 text-status-low",
        complete: "border-transparent bg-status-complete/15 text-status-complete",
        progress: "border-transparent bg-status-progress/15 text-status-progress",
        hold: "border-transparent bg-status-hold/15 text-status-hold",
        review: "border-transparent bg-status-review/15 text-status-review",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
