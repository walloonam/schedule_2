import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { LoaderCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ui-interactive relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-4 text-sm font-semibold shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent text-foreground hover:bg-accent/80 hover:text-accent-foreground",
        outline: "border border-input bg-background text-foreground hover:border-ring/30 hover:bg-accent/80 hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      },
      size: {
        default: "h-11 min-h-11 px-4",
        sm: "h-10 min-h-10 rounded-[calc(var(--radius-md)-0.125rem)] px-3.5 text-sm",
        lg: "h-12 min-h-12 px-6 text-base",
        icon: "h-11 w-11 min-h-11 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, type, ...props }, ref) => {
    const isDisabled = disabled || loading;
    const sharedProps = {
      ...props,
      ref,
      className: cn(buttonVariants({ variant, size, className })),
      "data-loading": loading ? "true" : undefined,
      "aria-busy": loading || props["aria-busy"] ? true : undefined,
      "aria-disabled": asChild && isDisabled ? true : props["aria-disabled"]
    };

    if (asChild) {
      const onlyChild = React.Children.only(children);

      return <Slot {...sharedProps}>{onlyChild}</Slot>;
    }

    return (
      <button {...sharedProps} disabled={isDisabled} type={type ?? "button"}>
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
