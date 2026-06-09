import {
  LineChart,
  Newspaper,
  Activity,
  Send,
  CopyX,
  TriangleAlert,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";
import { EmptyState } from "@/components/ui/empty-state";
import { getAnalytics } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

const metrics = [
  {
    key: "eventsCollected",
    label: "Events Collected",
    icon: Newspaper,
    sparkColor: "#34d399",
    trend: "up" as const,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    gradientFrom: "from-emerald-500/8"
  },
  {
    key: "postsGenerated",
    label: "Posts Generated",
    icon: Activity,
    sparkColor: "#60a5fa",
    trend: "up" as const,
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    gradientFrom: "from-blue-500/8"
  },
  {
    key: "postsPublished",
    label: "Posts Published",
    icon: Send,
    sparkColor: "#a78bfa",
    trend: "up" as const,
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    gradientFrom: "from-violet-500/8"
  },
  {
    key: "duplicatesRemoved",
    label: "Dupes Removed",
    icon: CopyX,
    sparkColor: "#fbbf24",
    trend: "flat" as const,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    gradientFrom: "from-amber-500/8"
  },
  {
    key: "failures",
    label: "Failures",
    icon: TriangleAlert,
    sparkColor: "#f87171",
    trend: "down" as const,
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    gradientFrom: "from-red-500/8"
  }
];

type LogLevel = "error" | "warn" | "warning" | "info" | "debug";

const levelConfig: Record<
  string,
  { variant: "destructive" | "warning" | "info" | "ghost"; icon: typeof AlertCircle; label: string }
> = {
  error: { variant: "destructive", icon: AlertCircle, label: "Error" },
  warn: { variant: "warning", icon: AlertTriangle, label: "Warn" },
  warning: { variant: "warning", icon: AlertTriangle, label: "Warn" },
  info: { variant: "info", icon: Info, label: "Info" },
  debug: { variant: "ghost", icon: CheckCircle, label: "Debug" }
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export default async function AnalyticsPage() {
  const { summary, logs } = await getAnalytics();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <LineChart className="h-2.5 w-2.5" />
            Analytics
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text-emerald">System</span>{" "}
          <span className="text-foreground/90">Analytics</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          24-hour performance metrics and full audit trail of all pipeline events.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((m) => {
          const value = summary[m.key as keyof typeof summary];
          return (
            <Card
              key={m.key}
              className={`relative overflow-hidden border-border/50 transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.gradientFrom} to-transparent pointer-events-none`} />
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0 relative">
                <CardTitle className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                  {m.label}
                </CardTitle>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.iconBg}`}>
                  <m.icon className={`h-3.5 w-3.5 ${m.iconColor}`} />
                </span>
              </CardHeader>
              <CardContent className="relative space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <AnimatedCounter value={value} className="text-2xl font-bold tracking-tight text-foreground" />
                  <div className="pb-0.5">
                    <Sparkline trend={m.trend} color={m.sparkColor} width={56} height={24} />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/60">Last 24 hours</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Audit Logs */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Audit Log</CardTitle>
              <CardDescription>
                Real-time log of API, AI, duplicate detection, retry, and publishing events.
              </CardDescription>
            </div>
            {logs.length > 0 && (
              <span className="rounded-lg border border-border/40 bg-muted/20 px-3 py-1.5 text-xs font-semibold tabular-nums text-foreground/60">
                {logs.length} entries
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState
              title="No audit logs yet"
              description="System events will be logged here once the pipeline runs."
              icon={<LineChart className="h-6 w-6" />}
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Level</TableHead>
                  <TableHead className="w-48">Event Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right w-32">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const level = (log.level ?? "info").toLowerCase() as LogLevel;
                  const conf = levelConfig[level] ?? levelConfig.info;
                  const LevelIcon = conf.icon;

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <LevelIcon className={`h-3 w-3 flex-shrink-0 ${
                            level === "error" ? "text-red-400" :
                            level === "warn" || level === "warning" ? "text-amber-400" :
                            level === "info" ? "text-blue-400" : "text-muted-foreground/60"
                          }`} />
                          <Badge variant={conf.variant}>{conf.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] text-muted-foreground/70 bg-muted/30 rounded px-1.5 py-0.5">
                          {log.event_type}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-lg">
                        <p className="line-clamp-2 text-[13px] text-foreground/80 leading-snug">
                          {log.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs font-medium text-foreground/70">
                            {formatRelativeTime(log.created_at)}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
