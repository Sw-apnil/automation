import { Send, Clock, AlertCircle, ImageIcon, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getQueue } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

type StatusVariant = "success" | "warning" | "destructive" | "ghost";

const statusMap: Record<string, { variant: StatusVariant; label: string; icon: typeof Send }> = {
  published: { variant: "success", label: "Published", icon: Send },
  pending: { variant: "warning", label: "Pending", icon: Clock },
  failed: { variant: "destructive", label: "Failed", icon: AlertCircle },
  queued: { variant: "ghost", label: "Queued", icon: Clock }
};

function RetryDots({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: Math.min(max, 5) }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            i < count ? "bg-amber-400" : "bg-muted/60"
          }`}
        />
      ))}
      <span className="ml-1 text-[10px] text-muted-foreground/60 tabular-nums">
        {count}/{max}
      </span>
    </div>
  );
}

export default async function QueuePage() {
  const posts = await getQueue(100);

  const counts = {
    published: posts.filter((p) => p.status === "published").length,
    pending: posts.filter((p) => p.status === "pending" || p.status === "queued").length,
    failed: posts.filter((p) => p.status === "failed").length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
              <ListChecks className="h-2.5 w-2.5" />
              Content Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text-purple">Post</span>{" "}
            <span className="text-foreground/90">Queue</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Generated fan posts with retry state, image attachments, and source scores.
          </p>
        </div>

        {/* Status breakdown */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <Send className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tabular-nums">{counts.published}</span>
            <span className="text-[10px] text-emerald-400/60">published</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
            <Clock className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tabular-nums">{counts.pending}</span>
            <span className="text-[10px] text-amber-400/60">pending</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2">
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-xs font-semibold text-red-400 tabular-nums">{counts.failed}</span>
            <span className="text-[10px] text-red-400/60">failed</span>
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Pipeline Queue</CardTitle>
          <CardDescription>
            All generated posts with status, retry count, and image attachment details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <EmptyState
              title="Queue is empty"
              description="Generated posts will appear here once the pipeline collects events and creates content."
              icon={<ListChecks className="h-6 w-6" />}
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const status = post.status ?? "queued";
                  const conf = statusMap[status] ?? statusMap.queued;
                  const StatusIcon = conf.icon;

                  return (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-lg">
                        <p className="line-clamp-3 text-[13px] font-medium text-foreground/90 leading-snug">
                          {post.content}
                        </p>
                        {post.source_events && (
                          <p className="mt-1 text-[10px] text-muted-foreground/50">
                            Source: {post.source_events.title}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground/80 whitespace-nowrap">
                          {post.accounts?.name ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className={`h-3 w-3 flex-shrink-0 ${
                            status === "published" ? "text-emerald-400" :
                            status === "failed" ? "text-red-400" : "text-amber-400"
                          }`} />
                          <Badge variant={conf.variant}>{conf.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RetryDots
                          count={post.retry_count ?? 0}
                          max={post.max_retries ?? 3}
                        />
                      </TableCell>
                      <TableCell>
                        {post.image_url ? (
                          <div className="flex items-center gap-1.5">
                            <ImageIcon className="h-3 w-3 text-blue-400" />
                            <span className="text-[10px] text-blue-400 font-medium">Attached</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">None</span>
                        )}
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
