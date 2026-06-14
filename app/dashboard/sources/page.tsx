import { Rss, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getRecentEvents } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

type CategoryVariant = "success" | "info" | "warning" | "destructive" | "purple" | "ghost";

const categoryConfig: Record<string, { variant: CategoryVariant; label: string }> = {
  transfer: { variant: "success", label: "Transfer" },
  result: { variant: "info", label: "Result" },
  fixture: { variant: "info", label: "Fixture" },
  standing: { variant: "purple", label: "Standing" },
  injury: { variant: "destructive", label: "Injury" },
  squad: { variant: "warning", label: "Squad" },
  team_news: { variant: "warning", label: "Team News" },
  quote: { variant: "ghost", label: "Quote" },
  academy: { variant: "ghost", label: "Academy" },
  contract: { variant: "success", label: "Contract" },
  manager: { variant: "warning", label: "Manager" },
  official_statement: { variant: "info", label: "Official" },
  tournament_news: { variant: "purple", label: "Tournament" },
  engagement: { variant: "ghost", label: "Engagement" },
  opinion: { variant: "ghost", label: "Opinion" },
  meme: { variant: "ghost", label: "Meme" },
  other: { variant: "ghost", label: "Other" }
};

const sourceConfig: Record<string, { label: string; color: string }> = {
  gnews: { label: "GNews", color: "text-blue-400" },
  guardian: { label: "Guardian", color: "text-violet-400" },
  "api-football": { label: "API-Football", color: "text-emerald-400" },
  apifootball: { label: "API-Football", color: "text-emerald-400" },
  twitter: { label: "Twitter/X", color: "text-sky-400" }
};

function getScoreBadge(score: number) {
  if (score >= 8) return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (score >= 6) return { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
  if (score >= 4) return { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
  return { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
}

export default async function SourcesPage() {
  const events = await getRecentEvents(100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              <Rss className="h-2.5 w-2.5" />
              Intelligence Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text-blue">Incoming</span>{" "}
            <span className="text-foreground/90">Events</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Normalized source items with AI relevance scores before queue generation.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-sm font-semibold tabular-nums text-foreground/80">{events.length}</span>
          <span className="text-xs text-muted-foreground">events</span>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Source Intelligence</CardTitle>
          <CardDescription>
            All collected events sorted by recency. High-scoring events get promoted to the post queue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              title="No intelligence collected yet"
              description="Run the pipeline to start collecting football events from API-Football, GNews, The Guardian, and Twitter/X."
              icon={<AlertTriangle className="h-6 w-6" />}
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Headline</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const cat = event.category ?? "other";
                  const catConf = categoryConfig[cat] ?? categoryConfig.other;
                  const src = event.source?.toLowerCase() ?? "";
                  const srcConf = sourceConfig[src] ?? { label: event.source ?? "—", color: "text-muted-foreground" };
                  const score = event.score ?? 0;
                  const scoreStyle = getScoreBadge(score);

                  return (
                    <TableRow key={event.id}>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2 font-medium text-foreground/90 leading-snug text-[13px]">
                          {event.title}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground/80 whitespace-nowrap">
                          {event.accounts?.name ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${srcConf.color}`}>
                          {srcConf.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={catConf.variant}>{catConf.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold tabular-nums ${scoreStyle.color} ${scoreStyle.bg}`}
                        >
                          {score}
                          <span className="ml-0.5 text-[9px] font-normal opacity-60">/10</span>
                        </span>
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
