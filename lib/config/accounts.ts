import { getServiceSupabase } from "@/lib/db/supabase";
import type { AccountConfig } from "@/lib/events/types";

type AccountRow = {
  id: string;
  name: string;
  slug: string;
  keywords: string[];
  hashtags: string[];
  style: string;
  character_limit: number;
  relevance_threshold: number;
  max_posts_per_run: number | null;
  enabled: boolean;
  groq_api_key: string | null;
  groq_model: string | null;
  groq_temperature: number | string | null;
  groq_max_tokens: number | null;
  buffer_access_token: string | null;
  buffer_profiles: string[];
  buffer_channel_ids: string[] | null;
  platforms: string[];
  schedule_interval_minutes: number | null;
  schedule_time_slots: string[] | null;
  last_run_at: string | null;
  news_api_key: string | null;
  api_football_key: string | null;
  team_id: number | null;
  league_id: number | null;
  logo_url: string | null;
  account_prompts?: { prompt_template: string; active: boolean; created_at?: string }[];
};

export async function getEnabledAccounts(): Promise<AccountConfig[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("accounts")
    .select("*, account_prompts(prompt_template, active, created_at)")
    .eq("enabled", true)
    .order("name");

  if (error) throw error;
  return ((data ?? []) as AccountRow[]).map(mapAccount);
}

export async function getAccounts(): Promise<AccountConfig[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("accounts")
    .select("*, account_prompts(prompt_template, active, created_at)")
    .order("name");

  if (error) throw error;
  return ((data ?? []) as AccountRow[]).map(mapAccount);
}

function mapAccount(row: AccountRow): AccountConfig {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    keywords: row.keywords ?? [],
    hashtags: row.hashtags ?? [],
    style: row.style,
    characterLimit: row.character_limit,
    relevanceThreshold: row.relevance_threshold,
    maxPostsPerRun: row.max_posts_per_run ?? 3,
    enabled: row.enabled,
    groqApiKey: row.groq_api_key,
    groqModel: row.groq_model,
    groqTemperature: row.groq_temperature == null ? 0.85 : Number(row.groq_temperature),
    groqMaxTokens: row.groq_max_tokens ?? 180,
    bufferAccessToken: row.buffer_access_token,
    bufferChannelIds: row.buffer_channel_ids ?? row.buffer_profiles ?? [],
    platforms: row.platforms ?? ["x"],
    scheduleIntervalMinutes: row.schedule_interval_minutes ?? 15,
    scheduleTimeSlots: row.schedule_time_slots ?? [],
    lastRunAt: row.last_run_at,
    newsApiKey: row.news_api_key,
    apiFootballKey: row.api_football_key,
    teamId: row.team_id,
    leagueId: row.league_id,
    logoUrl: row.logo_url,
    promptTemplate: row.account_prompts
      ?.filter((prompt) => prompt.active)
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0]?.prompt_template
  };
}
