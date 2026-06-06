import { ApiFootballAdapter } from "@/lib/sources/api-football";
import { NewsApiAdapter } from "@/lib/sources/newsapi";
import type { AccountConfig, FootballEvent } from "@/lib/events/types";
import { scoreEvent } from "@/lib/events/relevance";
import { isDuplicate, markPublishedEvent } from "@/lib/events/dedupe";
import { selectBestCandidates } from "@/lib/events/candidates";
import { generatePostContent } from "@/lib/ai/groq";
import { generateHashtags } from "@/lib/ai/hashtags";
import { selectImageUrl } from "@/lib/images/select-image";
import { publishToBuffer } from "@/lib/buffer/publish";
import { getEnabledAccounts } from "@/lib/config/accounts";
import { getServiceSupabase } from "@/lib/db/supabase";
import { auditLog } from "@/lib/logging/audit";

const adapters = [new ApiFootballAdapter(), new NewsApiAdapter()];

export type PipelineResult = {
  accounts: number;
  eventsCollected: number;
  postsGenerated: number;
  postsPublished: number;
  duplicatesRemoved: number;
  skippedLowScore: number;
  errors: number;
};

export async function runEvery15MinPipeline(): Promise<PipelineResult> {
  const result: PipelineResult = {
    accounts: 0,
    eventsCollected: 0,
    postsGenerated: 0,
    postsPublished: 0,
    duplicatesRemoved: 0,
    skippedLowScore: 0,
    errors: 0
  };

  const enabledAccounts = await getEnabledAccounts();
  await cleanupOldData(enabledAccounts);
  const accounts = enabledAccounts.filter(isAccountDue);
  result.accounts = accounts.length;

  for (const account of accounts) {
    try {
      if (!(await validateAccountConfig(account))) {
        result.errors += 1;
        continue;
      }
      const accountResult = await processAccount(account);
      result.eventsCollected += accountResult.eventsCollected;
      result.postsGenerated += accountResult.postsGenerated;
      result.duplicatesRemoved += accountResult.duplicatesRemoved;
      result.skippedLowScore += accountResult.skippedLowScore;
      await markAccountRun(account.id);
    } catch (error) {
      result.errors += 1;
      await auditLog({
        accountId: account.id,
        level: "error",
        eventType: "pipeline.account_failed",
        message: error instanceof Error ? error.message : "Account pipeline failed",
        metadata: { account: account.slug }
      });
    }
  }

  result.postsPublished = await publishDuePosts();
  return result;
}

async function cleanupOldData(accounts: AccountConfig[]) {
  const supabase = getServiceSupabase();
  await supabase.from("api_cache").delete().lt("expires_at", new Date().toISOString());

  for (const account of accounts) {
    const cutoff = new Date(Date.now() - account.duplicateRetentionDays * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("published_events").delete().eq("account_id", account.id).lt("created_at", cutoff);
  }
}

async function validateAccountConfig(account: AccountConfig) {
  const missing = [
    !account.groqApiKey ? "groq_api_key" : null,
    !account.groqModel ? "groq_model" : null,
    !account.bufferAccessToken ? "buffer_access_token" : null,
    account.bufferChannelIds.length === 0 ? "buffer_channel_ids" : null,
    !account.newsApiKey ? "news_api_key" : null,
    !account.apiFootballKey ? "api_football_key" : null,
    !account.promptTemplate ? "active account prompt" : null
  ].filter(Boolean);

  if (missing.length === 0) return true;

  await auditLog({
    accountId: account.id,
    level: "error",
    eventType: "account.config_missing",
    message: `Missing required account configuration: ${missing.join(", ")}`,
    metadata: { account: account.slug, missing }
  });
  return false;
}

function isAccountDue(account: AccountConfig) {
  if (account.scheduleTimeSlots.length > 0 && !isInsideScheduleSlot(account.scheduleTimeSlots)) return false;
  if (!account.lastRunAt) return true;
  const elapsedMinutes = (Date.now() - new Date(account.lastRunAt).getTime()) / 60_000;
  return elapsedMinutes >= account.scheduleIntervalMinutes;
}

function isInsideScheduleSlot(slots: string[]) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slots.some((slot) => {
    const [hour, minute] = slot.split(":").map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
    const slotMinutes = hour * 60 + minute;
    return Math.abs(currentMinutes - slotMinutes) <= 7;
  });
}

async function markAccountRun(accountId: string) {
  await getServiceSupabase().from("accounts").update({ last_run_at: new Date().toISOString() }).eq("id", accountId);
}

async function processAccount(account: AccountConfig) {
  const result = { eventsCollected: 0, postsGenerated: 0, duplicatesRemoved: 0, skippedLowScore: 0 };
  const eligibleEvents: Array<FootballEvent & { score: number }> = [];

  for (const adapter of adapters) {
    try {
      const events = await adapter.fetch(account);
      result.eventsCollected += events.length;

      for (const event of events) {
        const score = scoreEvent(event, account);
        await saveSourceEvent(account, event, score);

        if (score < account.relevanceThreshold) {
          result.skippedLowScore += 1;
          continue;
        }

        if (await isDuplicate(account.id, event)) {
          result.duplicatesRemoved += 1;
          await auditLog({
            accountId: account.id,
            level: "info",
            eventType: "duplicate.skipped",
            message: event.title,
            metadata: { source: event.source, sourceEventId: event.id, sourceUrl: event.sourceUrl }
          });
          continue;
        }

        eligibleEvents.push({ ...event, score });
      }
    } catch (error) {
      await auditLog({
        accountId: account.id,
        level: "error",
        eventType: "source.fetch_failed",
        message: error instanceof Error ? error.message : `${adapter.name} fetch failed`,
        metadata: { source: adapter.name }
      });
    }
  }

  const candidates = selectBestCandidates(eligibleEvents, account);
  for (const candidate of candidates) {
    try {
      await createQueuedPost(account, candidate);
      await markPublishedEvent(account.id, candidate);
      result.postsGenerated += 1;
      await auditLog({
        accountId: account.id,
        level: "info",
        eventType: "candidate.queued",
        message: candidate.title,
        metadata: {
          source: candidate.source,
          sourceEventId: candidate.id,
          score: candidate.score,
          candidateScore: candidate.candidateScore,
          keywordMatchStrength: candidate.keywordMatchStrength
        }
      });
    } catch (error) {
      await auditLog({
        accountId: account.id,
        level: "error",
        eventType: "queue.create_failed",
        message: error instanceof Error ? error.message : "Queue creation failed",
        metadata: { sourceEventId: candidate.id, title: candidate.title }
      });
    }
  }

  return result;
}

async function saveSourceEvent(account: AccountConfig, event: FootballEvent, score: number) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("source_events").upsert(
    {
      account_id: account.id,
      source: event.source,
      source_event_id: event.id,
      source_url: event.sourceUrl ?? null,
      title: event.title,
      description: event.description ?? null,
      image_url: event.imageUrl ?? null,
      category: event.category,
      score,
      metadata: event.metadata ?? {},
      published_at: event.publishedAt
    },
    { onConflict: "account_id,source,source_event_id" }
  );
  if (error) throw error;
}

async function createQueuedPost(account: AccountConfig, event: FootballEvent) {
  const supabase = getServiceSupabase();
  let content: string;
  try {
    content = await generatePostContent(event, account);
  } catch (error) {
    await auditLog({
      accountId: account.id,
      level: "error",
      eventType: "ai.generation_failed",
      message: error instanceof Error ? error.message : "Groq generation failed",
      metadata: { sourceEventId: event.id, title: event.title, source: event.source }
    });
    throw error;
  }

  const hashtags = generateHashtags(event, account);
  const imageUrl = selectImageUrl(event, account);

  const { data: sourceEvent, error: sourceError } = await supabase
    .from("source_events")
    .select("id")
    .eq("account_id", account.id)
    .eq("source", event.source)
    .eq("source_event_id", event.id)
    .maybeSingle();

  if (sourceError) throw sourceError;
  if (!sourceEvent) throw new Error("Source event was not persisted before queue creation");

  const { error } = await supabase.from("post_queue").insert({
    account_id: account.id,
    event_id: sourceEvent.id,
    content: withHashtags(content, hashtags, account.characterLimit),
    hashtags,
    image_url: imageUrl
  });

  if (error && error.code !== "23505") throw error;
}

async function publishDuePosts() {
  const supabase = getServiceSupabase();
  const { data: rows, error } = await supabase
    .from("post_queue")
    .select("*, accounts(platforms, buffer_channel_ids, buffer_profiles, buffer_access_token)")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", new Date().toISOString())
    .lt("retry_count", 3)
    .order("created_at")
    .limit(25);

  if (error) throw error;
  let published = 0;

  for (const row of rows ?? []) {
    const account = row.accounts as { platforms: string[]; buffer_channel_ids?: string[] | null; buffer_profiles?: string[] | null; buffer_access_token?: string | null } | null;
    const channelIds = account?.buffer_channel_ids?.length ? account.buffer_channel_ids : account?.buffer_profiles ?? [];

    if (channelIds.length === 0) {
      await supabase.from("post_queue").update({ status: "skipped", error_message: "No Buffer channels configured" }).eq("id", row.id);
      continue;
    }

    if (!account?.buffer_access_token) {
      await supabase
        .from("post_queue")
        .update({ status: "failed", error_message: "No Buffer access token configured for account" })
        .eq("id", row.id);
      continue;
    }

    try {
      await supabase.from("post_queue").update({ status: "publishing" }).eq("id", row.id);
      for (const [index, channelId] of channelIds.entries()) {
        const { postId } = await publishToBuffer({
          channelId,
          text: row.content,
          imageUrl: row.image_url,
          accessToken: account.buffer_access_token
        });
        await supabase.from("published_posts").insert({
          queue_id: row.id,
          account_id: row.account_id,
          platform: platformFromProfile(account?.platforms ?? [], index),
          buffer_channel_id: channelId,
          post_id: postId
        });
      }
      await supabase.from("post_queue").update({ status: "published", error_message: null }).eq("id", row.id);
      published += 1;
    } catch (error) {
      const retryCount = Number(row.retry_count ?? 0) + 1;
      const retryDelayMinutes = Math.min(60, 5 * retryCount);
      await supabase
        .from("post_queue")
        .update({
          status: retryCount >= Number(row.max_retries ?? 3) ? "failed" : "pending",
          retry_count: retryCount,
          next_attempt_at: new Date(Date.now() + retryDelayMinutes * 60_000).toISOString(),
          error_message: error instanceof Error ? error.message : "Buffer publish failed"
        })
        .eq("id", row.id);
      await auditLog({
        accountId: row.account_id,
        level: "error",
        eventType: "publish.failed",
        message: error instanceof Error ? error.message : "Publishing failed",
        metadata: { queueId: row.id, retryCount }
      });
    }
  }

  return published;
}

function withHashtags(content: string, hashtags: string[], characterLimit: number) {
  const tagText = hashtags.join(" ");
  const separator = tagText ? "\n\n" : "";
  const reserved = separator.length + tagText.length;
  if (!tagText) return content.slice(0, characterLimit);
  const contentLimit = Math.max(0, characterLimit - reserved);
  const trimmedContent = content.length > contentLimit ? `${content.slice(0, Math.max(0, contentLimit - 1)).trimEnd()}…` : content;
  return `${trimmedContent}${separator}${tagText}`.slice(0, characterLimit);
}

function platformFromProfile(platforms: string[], index: number) {
  const platform = platforms[index] ?? platforms[0] ?? "x";
  return (platform === "threads" ? "threads" : "x") as "x" | "threads";
}
