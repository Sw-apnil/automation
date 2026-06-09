import { Send, Calendar, ExternalLink, Hash, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublished } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

const platformConfig: Record<string, { color: string; label: string }> = {
  twitter: { color: "text-sky-400", label: "Twitter" },
  facebook: { color: "text-blue-400", label: "Facebook" },
  instagram: { color: "text-pink-400", label: "Instagram" },
  linkedin: { color: "text-blue-500", label: "LinkedIn" },
  buffer: { color: "text-violet-400", label: "Buffer" }
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default async function PublishedPage() {
  const posts = await getPublished(100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <Send className="h-2.5 w-2.5" />
              Publishing Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text-emerald">Published</span>{" "}
            <span className="text-foreground/90">Posts</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Posts successfully accepted by Buffer for each connected social channel.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-sm font-semibold tabular-nums text-foreground/80">{posts.length}</span>
          <span className="text-xs text-muted-foreground">posts</span>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15">
              <Send className="h-3 w-3 text-emerald-400" />
            </span>
            Social Publishing Feed
          </CardTitle>
          <CardDescription>
            Content published to connected Buffer channels with post IDs and timestamps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <EmptyState
              title="No posts published yet"
              description="Posts will appear here once the pipeline publishes content to your connected social channels."
              icon={<Send className="h-6 w-6" />}
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Buffer Post</TableHead>
                  <TableHead>Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const platform = (post.platform ?? "buffer").toLowerCase();
                  const platformConf = platformConfig[platform] ?? platformConfig.buffer;
                  const channelDisplay = post.buffer_channel_id ?? post.platform ?? "—";
                  const publishedDate = new Date(post.published_at);

                  return (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-3 text-[13px] font-medium text-foreground/90 leading-snug">
                          {post.post_queue?.content ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground/80 whitespace-nowrap">
                          {post.accounts?.name ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-2.5 w-2.5 text-muted-foreground/40" />
                          <Badge variant="secondary">
                            <span className={platformConf.color}>{channelDisplay}</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.post_id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-muted-foreground/60 max-w-[120px] truncate">
                              {post.post_id}
                            </span>
                            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/30 flex-shrink-0" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-foreground/80">
                            {formatRelativeTime(publishedDate)}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                            <Calendar className="h-2.5 w-2.5" />
                            {publishedDate.toLocaleDateString()}
                          </div>
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
