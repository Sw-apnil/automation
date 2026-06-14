import type { AccountConfig, FootballEvent } from "@/lib/events/types";
import type { SourceAdapter } from "@/lib/sources/source";
import { getServiceSupabase } from "@/lib/db/supabase";
import { PlaywrightCollector } from "./playwright-collector";
import { classifyTweetNewsworthiness } from "./ai-classifier";

export class TwitterAdapter implements SourceAdapter {
  name = "twitter" as const;
  private collector = new PlaywrightCollector();

  async fetch(account: AccountConfig): Promise<FootballEvent[]> {
    if (!account.twitterEnabled || !account.twitterUsername) return [];

    const supabase = getServiceSupabase();
    
    // 1. Get sync state
    const { data: syncState } = await supabase
      .from("twitter_sync_state")
      .select("*")
      .eq("account_id", account.id)
      .maybeSingle();

    // Prevent concurrent runs or rate limits (e.g., skip if last attempt was < 5 mins ago)
    if (syncState?.last_sync_attempt) {
      const minsSinceAttempt = (new Date().getTime() - new Date(syncState.last_sync_attempt).getTime()) / 60000;
      if (minsSinceAttempt < 5 && syncState.sync_status === "syncing") {
        console.log(`[Twitter] Skipping fetch for ${account.name}: sync currently in progress.`);
        return [];
      }
    }

    // Set status to syncing
    await supabase.from("twitter_sync_state").upsert(
      {
        account_id: account.id,
        sync_status: "syncing",
        last_sync_attempt: new Date().toISOString()
      },
      { onConflict: "account_id" }
    );

    const newsworthyEvents: FootballEvent[] = [];
    let errorToThrow: Error | null = null;
    let newCursor: string | undefined;

    try {
      // 2. Fetch via PlaywrightCollector
      const rawTweets = await this.collector.fetchTweets(account.twitterUsername, syncState?.last_tweet_id);
      
      if (rawTweets.length > 0) {
        newCursor = rawTweets[0].tweetId; // assuming latest tweet is first
      }

      for (const tweet of rawTweets) {
        // 3. Persist to raw_tweets as pending
        await supabase.from("raw_tweets").upsert(
          {
            account_id: account.id,
            tweet_id: tweet.tweetId,
            username: tweet.username,
            tweet_text: tweet.text,
            tweet_created_at: tweet.createdAt,
            processing_status: "pending",
            raw_payload: tweet.raw
          },
          { onConflict: "account_id,tweet_id" }
        );

        // 4. Run AI Newsworthiness Filter
        const classification = await classifyTweetNewsworthiness(tweet.text, account);
        
        const meetsConfidence = classification.confidence >= account.twitterMinConfidence;
        const isProcessable = classification.isNewsworthy && meetsConfidence;

        if (isProcessable) {
          // Update status to processed
          await supabase.from("raw_tweets").update({
            processing_status: "processed",
            ai_confidence: classification.confidence,
            skip_reason: null
          }).eq("account_id", account.id).eq("tweet_id", tweet.tweetId);

          // Convert to FootballEvent
          newsworthyEvents.push({
            id: `tweet:${tweet.tweetId}`,
            title: tweet.text.slice(0, 120) + (tweet.text.length > 120 ? "..." : ""),
            description: tweet.text,
            source: "twitter",
            sourceUrl: `https://x.com/${tweet.username}/status/${tweet.tweetId}`,
            publishedAt: tweet.createdAt || new Date().toISOString(),
            category: classification.category,
            accountId: account.id,
            metadata: {
              confidence: classification.confidence,
              classificationReason: classification.reason
            }
          });
        } else {
          // Update status to skipped
          await supabase.from("raw_tweets").update({
            processing_status: "skipped",
            ai_confidence: classification.confidence,
            skip_reason: !classification.isNewsworthy 
              ? `Not newsworthy (${classification.category})` 
              : `Low confidence (${classification.confidence} < ${account.twitterMinConfidence})`
          }).eq("account_id", account.id).eq("tweet_id", tweet.tweetId);
        }
      }

      // 5. Update sync_state -> success
      await supabase.from("twitter_sync_state").upsert(
        {
          account_id: account.id,
          sync_status: "idle",
          last_successful_sync: new Date().toISOString(),
          last_tweet_id: newCursor || syncState?.last_tweet_id,
          tweets_processed: (syncState?.tweets_processed || 0) + newsworthyEvents.length
        },
        { onConflict: "account_id" }
      );

    } catch (error) {
      console.error(`[TwitterAdapter] Failed fetch for ${account.name}:`, error);
      errorToThrow = error as Error;
      
      // Update sync_state -> error
      await supabase.from("twitter_sync_state").upsert(
        {
          account_id: account.id,
          sync_status: "error",
          last_error: errorToThrow.message,
          last_error_at: new Date().toISOString()
        },
        { onConflict: "account_id" }
      );
    }

    if (errorToThrow) throw errorToThrow;

    // 6. Return newsworthy FootballEvents
    return newsworthyEvents;
  }
}
