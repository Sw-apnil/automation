import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/db/supabase";

const updateAccountSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  keywords: z.array(z.string().min(1)).optional(),
  hashtags: z.array(z.string().regex(/^#/)).optional(),
  style: z.string().optional(),
  characterLimit: z.number().int().min(80).max(2000).optional(),
  relevanceThreshold: z.number().int().min(0).max(10).optional(),
  relevanceRules: z.record(z.unknown()).optional(),
  maxPostsPerRun: z.number().int().min(1).max(10).optional(),
  duplicateRetentionDays: z.number().int().min(7).max(3650).optional(),
  enabled: z.boolean().optional(),
  groqApiKey: z.string().min(1).nullable().optional(),
  groqModel: z.string().min(1).nullable().optional(),
  groqTemperature: z.number().min(0).max(2).optional(),
  groqMaxTokens: z.number().int().min(32).max(1000).optional(),
  bufferAccessToken: z.string().min(1).nullable().optional(),
  bufferChannelIds: z.array(z.string().min(1)).optional(),
  bufferProfiles: z.array(z.string()).optional(),
  platforms: z.array(z.enum(["x", "threads"])).optional(),
  scheduleIntervalMinutes: z.number().int().min(5).max(1440).optional(),
  scheduleTimeSlots: z.array(z.string()).optional(),
  newsApiKey: z.string().min(1).nullable().optional(),
  apiFootballKey: z.string().min(1).nullable().optional(),
  teamId: z.number().int().nullable().optional(),
  leagueId: z.number().int().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  promptTemplate: z.string().min(20).optional()
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const input = updateAccountSchema.parse(await request.json());
  const supabase = getServiceSupabase();

  const accountPatch = toAccountPatch(input);
  if (Object.keys(accountPatch).length > 0) {
    const { error } = await supabase.from("accounts").update(accountPatch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (input.promptTemplate) {
    await supabase.from("account_prompts").update({ active: false }).eq("account_id", id).eq("active", true);
    const { error } = await supabase.from("account_prompts").insert({
      account_id: id,
      name: `prompt-${Date.now()}`,
      prompt_template: input.promptTemplate,
      active: true
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { error } = await getServiceSupabase().from("accounts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id });
}

function toAccountPatch(input: z.infer<typeof updateAccountSchema>) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.keywords !== undefined ? { keywords: input.keywords } : {}),
    ...(input.hashtags !== undefined ? { hashtags: input.hashtags } : {}),
    ...(input.style !== undefined ? { style: input.style } : {}),
    ...(input.characterLimit !== undefined ? { character_limit: input.characterLimit } : {}),
    ...(input.relevanceThreshold !== undefined ? { relevance_threshold: input.relevanceThreshold } : {}),
    ...(input.relevanceRules !== undefined ? { relevance_rules: input.relevanceRules } : {}),
    ...(input.maxPostsPerRun !== undefined ? { max_posts_per_run: input.maxPostsPerRun } : {}),
    ...(input.duplicateRetentionDays !== undefined ? { duplicate_retention_days: input.duplicateRetentionDays } : {}),
    ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
    ...(input.groqApiKey !== undefined ? { groq_api_key: input.groqApiKey } : {}),
    ...(input.groqModel !== undefined ? { groq_model: input.groqModel } : {}),
    ...(input.groqTemperature !== undefined ? { groq_temperature: input.groqTemperature } : {}),
    ...(input.groqMaxTokens !== undefined ? { groq_max_tokens: input.groqMaxTokens } : {}),
    ...(input.bufferAccessToken !== undefined ? { buffer_access_token: input.bufferAccessToken } : {}),
    ...(input.bufferChannelIds !== undefined ? { buffer_channel_ids: input.bufferChannelIds } : {}),
    ...(input.bufferProfiles !== undefined ? { buffer_profiles: input.bufferProfiles } : {}),
    ...(input.platforms !== undefined ? { platforms: input.platforms } : {}),
    ...(input.scheduleIntervalMinutes !== undefined ? { schedule_interval_minutes: input.scheduleIntervalMinutes } : {}),
    ...(input.scheduleTimeSlots !== undefined ? { schedule_time_slots: input.scheduleTimeSlots } : {}),
    ...(input.newsApiKey !== undefined ? { news_api_key: input.newsApiKey } : {}),
    ...(input.apiFootballKey !== undefined ? { api_football_key: input.apiFootballKey } : {}),
    ...(input.teamId !== undefined ? { team_id: input.teamId } : {}),
    ...(input.leagueId !== undefined ? { league_id: input.leagueId } : {}),
    ...(input.logoUrl !== undefined ? { logo_url: input.logoUrl } : {})
  };
}
