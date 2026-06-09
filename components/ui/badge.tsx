import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "purple"
  | "ghost";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary border border-primary/20 shadow-[0_0_8px_rgba(52,211,153,0.15)]",
  secondary: "bg-secondary/15 text-secondary border border-secondary/20",
  outline: "border border-border text-muted-foreground bg-transparent",
  destructive: "bg-destructive/15 text-destructive border border-destructive/25 shadow-[0_0_8px_rgba(248,113,113,0.12)]",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_8px_rgba(52,211,153,0.12)]",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-[0_0_8px_rgba(251,191,36,0.12)]",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-[0_0_8px_rgba(96,165,250,0.12)]",
  purple: "bg-violet-500/15 text-violet-400 border border-violet-500/25 shadow-[0_0_8px_rgba(167,139,250,0.12)]",
  ghost: "bg-muted/50 text-muted-foreground border border-transparent"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase leading-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
