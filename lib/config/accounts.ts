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
  buffer_profiles: string[];
  platforms: string[];
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
    bufferProfiles: row.buffer_profiles ?? [],
    platforms: row.platforms ?? ["x"],
    teamId: row.team_id,
    leagueId: row.league_id,
    logoUrl: row.logo_url,
    promptTemplate: row.account_prompts
      ?.filter((prompt) => prompt.active)
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0]?.prompt_template
  };
}
