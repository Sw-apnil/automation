import {
  Activity,
  CopyX,
  Newspaper,
  Send,
  TriangleAlert,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Tag,
  Flame,
  Trophy,
  AlertCircle
} from "lucide-react";
import { PipelineRunForm } from "@/components/pipeline-run-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardSummary, getQueue, getRecentEvents } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

const metrics = [
  {
    key: "eventsCollected",
    label: "Events Collected",
    icon: Newspaper,
    color: "emerald",
    trend: "up" as const,
    sparkColor: "#34d399",
    gradientFrom: "from-emerald-500/10",
    gradientTo: "to-transparent",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    borderGlow: "hover:shadow-glow-emerald"
  },
  {
    key: "postsGenerated",
    label: "Posts Generated",
    icon: Activity,
    color: "blue",
    trend: "up" as const,
    sparkColor: "#60a5fa",
    gradientFrom: "from-blue-500/10",
    gradientTo: "to-transparent",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    borderGlow: "hover:shadow-glow-blue"
  },
  {
    key: "postsPublished",
    label: "Posts Published",
    icon: Send,
    color: "violet",
    trend: "up" as const,
    sparkColor: "#a78bfa",
    gradientFrom: "from-violet-500/10",
    gradientTo: "to-transparent",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    borderGlow: "hover:shadow-glow-purple"
  },
  {
    key: "duplicatesRemoved",
    label: "Dupes Removed",
    icon: CopyX,
    color: "amber",
    trend: "flat" as const,
    sparkColor: "#fbbf24",
    gradientFrom: "from-amber-500/10",
    gradientTo: "to-transparent",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    borderGlow: "hover:shadow-glow-amber"
  },
  {
    key: "failures",
    label: "Failures",
    icon: TriangleAlert,
    color: "red",
    trend: "down" as const,
    sparkColor: "#f87171",
    gradientFrom: "from-red-500/10",
    gradientTo: "to-transparent",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    borderGlow: "hover:shadow-glow-red"
  }
];

const categoryConfig: Record<string, { variant: "success" | "info" | "warning" | "destructive" | "purple" | "ghost", label: string }> = {
  transfer: { variant: "success", label: "Transfer" },
  result: { variant: "info", label: "Result" },
  fixture: { variant: "info", label: "Fixture" },
  standing: { variant: "purple", label: "Standing" },
  injury: { variant: "destructive", label: "Injury" },
  squad: { variant: "warning", label: "Squad" },
  team_news: { variant: "warning", label: "Team News" },
  quote: { variant: "ghost", label: "Quote" },
  academy: { variant: "ghost", label: "Academy" },
  other: { variant: "ghost", label: "Other" }
};

const statusConfig: Record<string, { variant: "success" | "warning" | "destructive" | "ghost", label: string }> = {
  published: { variant: "success", label: "Published" },
  pending: { variant: "warning", label: "Pending" },
  failed: { variant: "destructive", label: "Failed" },
  queued: { variant: "ghost", label: "Queued" }
};

function getScoreColor(score: number) {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-blue-400";
  if (score >= 4) return "text-amber-400";
  return "text-red-400";
}

function getScoreBarWidth(score: number) {
  return `${(score / 10) * 100}%`;
}

export default async function DashboardPage() {
  const [summary, events, queue] = await Promise.all([
    getDashboardSummary(),
    getRecentEvents(8),
    getQueue(8)
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text-emerald">Football Intelligence</span>{" "}
            <span className="text-foreground/90">Overview</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            15-minute AI content pipeline for configured football fan accounts.
          </p>
        </div>
        <PipelineRunForm />
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((m) => {
          const value = summary[m.key as keyof typeof summary];
          return (
            <Card
              key={m.key}
              className={`relative overflow-hidden border-border/50 ${m.borderGlow} transition-all duration-300`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${m.gradientFrom} ${m.gradientTo} pointer-events-none`} />

              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0 relative">
                <div className="space-y-1">
                  <CardTitle className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                    {m.label}
                  </CardTitle>
                </div>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.iconBg} flex-shrink-0`}>
                  <m.icon className={`h-4 w-4 ${m.iconColor}`} />
                </span>
              </CardHeader>
              <CardContent className="relative space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <AnimatedCounter
                    value={value}
                    className="text-3xl font-bold tracking-tight text-foreground"
                  />
                  <div className="pb-1">
                    <Sparkline
                      trend={m.trend}
                      color={m.sparkColor}
                      width={64}
                      height={28}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60">Last 24 hours</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Feeds */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Intelligence Feed */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/15">
                    <Flame className="h-3 w-3 text-blue-400" />
                  </span>
                  Live Intelligence Feed
                </CardTitle>
                <CardDescription>
                  Latest from API-Football, GNews, and Guardian
                </CardDescription>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.length === 0 ? (
              <EmptyState
                title="No events yet"
                description="Configure your pipeline and run it to collect football intelligence."
                className="py-8"
              />
            ) : (
              events.map((event, i) => {
                const cat = event.category ?? "other";
                const catConf = categoryConfig[cat] ?? categoryConfig.other;
                const score = event.score ?? 0;

                return (
                  <div
                    key={event.id}
                    className="group relative rounded-xl border border-border/40 bg-muted/20 p-3 transition-all duration-200 hover:border-border/70 hover:bg-muted/40"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 text-[13px] font-medium text-foreground/90 leading-snug flex-1">
                        {event.title}
                      </p>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-sm font-bold tabular-nums ${getScoreColor(score)}`}>
                          {score}
                          <span className="text-[10px] font-normal text-muted-foreground/60">/10</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={catConf.variant}>{catConf.label}</Badge>
                      <span className="text-[10px] text-muted-foreground/60">
                        {event.accounts?.name ?? "Account"}
                      </span>
                      {event.source && (
                        <>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
                            {event.source}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Score bar */}
                    <div className="mt-2 h-0.5 w-full rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700"
                        style={{ width: getScoreBarWidth(score) }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Content Pipeline Preview */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-violet-500/15">
                    <Trophy className="h-3 w-3 text-violet-400" />
                  </span>
                  Content Pipeline
                </CardTitle>
                <CardDescription>
                  Generated posts awaiting Buffer or retry
                </CardDescription>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {queue.length === 0 ? (
              <EmptyState
                title="Queue is empty"
                description="Generated posts will appear here once the pipeline runs."
                className="py-8"
              />
            ) : (
              queue.map((post, i) => {
                const status = post.status ?? "queued";
                const statusConf = statusConfig[status] ?? statusConfig.queued;

                return (
                  <div
                    key={post.id}
                    className="group relative rounded-xl border border-border/40 bg-muted/20 p-3 transition-all duration-200 hover:border-border/70 hover:bg-muted/40"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status indicator */}
                      <div className="flex-shrink-0 mt-0.5">
                        {status === "published" ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <Send className="h-2.5 w-2.5 text-emerald-400" />
                          </div>
                        ) : status === "failed" ? (
                          <div className="h-5 w-5 rounded-full bg-red-500/15 flex items-center justify-center">
                            <AlertCircle className="h-2.5 w-2.5 text-red-400" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-amber-500/15 flex items-center justify-center">
                            <Clock className="h-2.5 w-2.5 text-amber-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-2 text-[13px] font-medium text-foreground/90 leading-snug">
                          {post.content}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
                          <span className="text-[10px] text-muted-foreground/60">
                            {post.accounts?.name ?? "Account"}
                          </span>
                          {post.source_events && (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <Tag className="h-2.5 w-2.5 text-muted-foreground/40" />
                              <span className="text-[10px] text-muted-foreground/50">
                                {post.source_events.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
