"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Rss,
  ListChecks,
  Send,
  LineChart,
  Settings2,
  Zap,
  ChevronRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const nav = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: BarChart3,
    description: "KPIs & Live Feed",
    exact: true
  },
  {
    href: "/dashboard/sources",
    label: "Intelligence",
    icon: Rss,
    description: "Incoming Events"
  },
  {
    href: "/dashboard/queue",
    label: "Queue",
    icon: ListChecks,
    description: "Content Pipeline"
  },
  {
    href: "/dashboard/published",
    label: "Published",
    icon: Send,
    description: "Social Feed"
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: LineChart,
    description: "Audit & Logs"
  },
  {
    href: "/dashboard/accounts",
    label: "Accounts",
    icon: Settings2,
    description: "Configuration"
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 lg:flex flex-col z-40">
      <div className="flex flex-col h-full m-3 rounded-2xl glass border border-border/60 overflow-hidden">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow-emerald transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(52,211,153,0.5)]">
            <Zap className="h-4 w-4 text-black fill-black" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight gradient-text-emerald">Football Intel</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Media Platform</span>
          </div>
        </Link>

        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          <p className="px-2 pb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Navigation</p>
          {nav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary shadow-glow-emerald"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
                    isActive
                      ? "bg-primary/15 text-primary shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium leading-none text-[13px]">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{item.description}</span>
                </div>
                {isActive && <ChevronRight className="ml-auto h-3 w-3 text-primary/60 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="p-4 pt-0">
          <div className="mx-0 mb-3 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/30 border border-border/40 px-3 py-2.5">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 flex-shrink-0">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-foreground/80">System Online</span>
              <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wide">Pipeline Active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
