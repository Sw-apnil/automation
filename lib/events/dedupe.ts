import crypto from "crypto";
import { getServiceSupabase } from "@/lib/db/supabase";
import type { FootballEvent } from "@/lib/events/types";

export function normalizeHeadline(headline: string) {
  return headline
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|to|from|of|and|for|with|on|in)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function headlineHash(headline: string) {
  return crypto.createHash("sha256").update(normalizeHeadline(headline)).digest("hex");
}

export async function isDuplicate(accountId: string, event: FootballEvent): Promise<boolean> {
  const supabase = getServiceSupabase();
  const normalized = normalizeHeadline(event.title);
  const hash = headlineHash(event.title);

  const sourceMatch = await supabase
    .from("published_events")
    .select("id")
    .eq("account_id", accountId)
    .eq("source_event_id", event.id)
    .maybeSingle();

  if (sourceMatch.error) throw sourceMatch.error;
  if (sourceMatch.data) return true;

  const hashMatch = await supabase
    .from("published_events")
    .select("id")
    .eq("account_id", accountId)
    .eq("headline_hash", hash)
    .maybeSingle();

  if (hashMatch.error) throw hashMatch.error;
  if (hashMatch.data) return true;

  if (event.sourceUrl) {
    const urlMatch = await supabase
      .from("published_events")
      .select("id")
      .eq("account_id", accountId)
      .eq("source_url", event.sourceUrl)
      .maybeSingle();

    if (urlMatch.error) throw urlMatch.error;
    if (urlMatch.data) return true;
  }

  const { data, error } = await supabase
    .from("published_events")
    .select("normalized_headline")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []).some((row) => similarity(normalized, row.normalized_headline) >= 0.84);
}

export async function markPublishedEvent(accountId: string, event: FootballEvent) {
  const supabase = getServiceSupabase();
  await supabase.from("published_events").upsert({
    account_id: accountId,
    source_event_id: event.id,
    headline_hash: headlineHash(event.title),
    normalized_headline: normalizeHeadline(event.title),
    source_url: event.sourceUrl ?? null
  });
}

function similarity(a: string, b: string) {
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  if (!aTokens.size || !bTokens.size) return 0;
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}
