import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-emerald hover:shadow-[0_0_24px_rgba(52,211,153,0.4)]",
        secondary:
          "bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted/60 hover:border-border/80",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25",
        glow:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold shadow-glow-emerald hover:shadow-[0_0_32px_rgba(52,211,153,0.5)] hover:from-emerald-400 hover:to-emerald-500"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9 px-0 rounded-lg"
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
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";
