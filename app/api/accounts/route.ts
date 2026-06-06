import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccountRows } from "@/lib/dashboard/data";
import { getServiceSupabase } from "@/lib/db/supabase";

export async function GET() {
  return NextResponse.json(await getAccountRows());
}

const accountSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  keywords: z.array(z.string().min(1)).default([]),
  hashtags: z.array(z.string().regex(/^#/)).default([]),
  style: z.string().default("football fan"),
  characterLimit: z.number().int().min(80).max(2000).default(260),
  relevanceThreshold: z.number().int().min(0).max(10).default(7),
  relevanceRules: z.record(z.unknown()).optional(),
  maxPostsPerRun: z.number().int().min(1).max(10).default(3),
  duplicateRetentionDays: z.number().int().min(7).max(3650).default(90),
  enabled: z.boolean().default(true),
  groqApiKey: z.string().min(1),
  groqModel: z.string().min(1),
  groqTemperature: z.number().min(0).max(2).default(0.85),
  groqMaxTokens: z.number().int().min(32).max(1000).default(180),
  bufferAccessToken: z.string().min(1),
  bufferChannelIds: z.array(z.string().min(1)).min(1),
  platforms: z.array(z.enum(["x", "threads"])).default(["x"]),
  scheduleIntervalMinutes: z.number().int().min(5).max(1440).default(15),
  scheduleTimeSlots: z.array(z.string()).default([]),
  newsApiKey: z.string().min(1),
  apiFootballKey: z.string().min(1),
  teamId: z.number().int().nullable().optional(),
  leagueId: z.number().int().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  promptTemplate: z.string().min(20)
});

export async function POST(request: Request) {
  const input = accountSchema.parse(await request.json());
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name: input.name,
      slug: input.slug,
      keywords: input.keywords,
      hashtags: input.hashtags,
      style: input.style,
      character_limit: input.characterLimit,
      relevance_threshold: input.relevanceThreshold,
      relevance_rules: input.relevanceRules ?? null,
      max_posts_per_run: input.maxPostsPerRun,
      duplicate_retention_days: input.duplicateRetentionDays,
      enabled: input.enabled,
      groq_api_key: input.groqApiKey,
      groq_model: input.groqModel,
      groq_temperature: input.groqTemperature,
      groq_max_tokens: input.groqMaxTokens,
      buffer_access_token: input.bufferAccessToken,
      buffer_channel_ids: input.bufferChannelIds,
      buffer_profiles: input.bufferChannelIds,
      platforms: input.platforms,
      schedule_interval_minutes: input.scheduleIntervalMinutes,
      schedule_time_slots: input.scheduleTimeSlots,
      news_api_key: input.newsApiKey,
      api_football_key: input.apiFootballKey,
      team_id: input.teamId ?? null,
      league_id: input.leagueId ?? null,
      logo_url: input.logoUrl ?? null
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("account_prompts").insert({
    account_id: data.id,
    name: "default",
    prompt_template: input.promptTemplate
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
