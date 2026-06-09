import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = "No data yet",
  description = "Configure your pipeline and run it to see data here.",
  icon,
  className,
  children
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
          {icon}
        </div>
      ) : (
        <FootballIcon />
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function FootballIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-muted-foreground">
        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M14 6l2.5 4h-5L14 6zM14 22l-2.5-4h5L14 22zM6 14l4-2.5v5L6 14zM22 14l-4 2.5v-5L22 14z"
          fill="currentColor"
          opacity="0.4"
        />
        <polygon
          points="14,9 17,11.5 16,15 12,15 11,11.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}
