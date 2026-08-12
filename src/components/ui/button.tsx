import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-accent bg-accent text-white hover:border-accent-hover hover:bg-accent-hover",
        outline:
          "border border-border bg-background text-foreground hover:border-accent/50 hover:bg-accent-soft hover:text-accent",
        secondary:
          "border border-transparent bg-surface text-foreground hover:border-border hover:bg-surface/70",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-surface hover:text-accent",
        link: "min-h-0 rounded-none p-0 text-accent underline-offset-4 hover:underline",
        destructive:
          "border border-red-700 bg-red-700 text-white hover:border-red-800 hover:bg-red-800",
      },
      size: {
        default: "min-h-11 px-4 py-2.5",
        sm: "min-h-9 px-3 py-1.5 text-xs max-sm:min-h-11 max-sm:text-sm",
        lg: "min-h-12 px-6 py-3 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
