import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-background text-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        tint: "border-transparent bg-primary/10 text-primary",
        destructive: "border-transparent bg-destructive/10 text-destructive"
      },
      size: {
        default: "min-h-7",
        sm: "min-h-6 px-2.5 text-[11px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

const chipButtonVariants = cva("tag-toggle", {
  variants: {
    active: {
      true: "border-transparent shadow-sm",
      false: ""
    },
    size: {
      default: "px-4 text-sm",
      sm: "min-h-10 px-3.5 text-xs"
    }
  },
  defaultVariants: {
    active: false,
    size: "default"
  }
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants, chipButtonVariants };
