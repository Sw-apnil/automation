import { env } from "@/lib/config/env";
import { getServiceSupabase } from "@/lib/db/supabase";

export type MetricSummary = {
  eventsCollected: number;
  postsGenerated: number;
  postsPublished: number;
  duplicatesRemoved: number;
  failures: number;
};

export async function getDashboardSummary(): Promise<MetricSummary> {
  if (!hasSupabase()) return emptySummary();
  const supabase = getServiceSupabase();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [events, queue, published, duplicates, failures] = await Promise.all([
    supabase.from("source_events").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("post_queue").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("published_posts").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }).eq("event_type", "duplicate.skipped").gte("created_at", since),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }).eq("level", "error").gte("created_at", since)
  ]);

  return {
    eventsCollected: events.count ?? 0,
    postsGenerated: queue.count ?? 0,
    postsPublished: published.count ?? 0,
    duplicatesRemoved: duplicates.count ?? 0,
    failures: failures.count ?? 0
  };
}

export async function getRecentEvents(limit = 50) {
  if (!hasSupabase()) return [];
  const { data, error } = await getServiceSupabase()
    .from("source_events")
    .select("*, accounts(name, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getQueue(limit = 50) {
  if (!hasSupabase()) return [];
  const { data, error } = await getServiceSupabase()
    .from("post_queue")
    .select("*, accounts(name, slug), source_events(title, score, category)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getPublished(limit = 50) {
  if (!hasSupabase()) return [];
  const { data, error } = await getServiceSupabase()
    .from("published_posts")
    .select("*, accounts(name, slug), post_queue(content, image_url)")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getAnalytics() {
  if (!hasSupabase()) return { logs: [], summary: emptySummary() };
  const [summary, logs] = await Promise.all([
    getDashboardSummary(),
    getServiceSupabase().from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100)
  ]);
  if (logs.error) throw logs.error;
  return { summary, logs: logs.data ?? [] };
}

export async function getAccountRows() {
  if (!hasSupabase()) return [];
  const { data, error } = await getServiceSupabase().from("accounts").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

function hasSupabase() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function emptySummary(): MetricSummary {
  return { eventsCollected: 0, postsGenerated: 0, postsPublished: 0, duplicatesRemoved: 0, failures: 0 };
}
