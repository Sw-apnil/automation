import { Activity, CopyX, Newspaper, Send, TriangleAlert } from "lucide-react";
import { PipelineRunForm } from "@/components/pipeline-run-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary, getQueue, getRecentEvents } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, events, queue] = await Promise.all([getDashboardSummary(), getRecentEvents(8), getQueue(8)]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Automation Dashboard</h1>
          <p className="text-sm text-muted-foreground">15-minute football content pipeline for configured fan accounts.</p>
        </div>
        <PipelineRunForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric title="Events collected" value={summary.eventsCollected} icon={Newspaper} />
        <Metric title="Posts generated" value={summary.postsGenerated} icon={Activity} />
        <Metric title="Posts published" value={summary.postsPublished} icon={Send} />
        <Metric title="Duplicates removed" value={summary.duplicatesRemoved} icon={CopyX} />
        <Metric title="Failures" value={summary.failures} icon={TriangleAlert} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest normalized items from API-Football, GNews, and Guardian.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="line-clamp-1 text-sm font-medium">{event.title}</p>
                  <span className="text-xs font-semibold text-primary">{event.score}/10</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{event.accounts?.name ?? "Account"} · {event.category}</p>
              </div>
            ))}
            {events.length === 0 && <EmptyState />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue</CardTitle>
            <CardDescription>Generated posts waiting for Buffer or retry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.map((post) => (
              <div key={post.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="line-clamp-2 text-sm font-medium">{post.content}</p>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs">{post.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{post.accounts?.name ?? "Account"}</p>
              </div>
            ))}
            {queue.length === 0 && <EmptyState />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Newspaper }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Last 24 hours</p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No data yet. Configure Supabase and run the pipeline.</p>;
}
