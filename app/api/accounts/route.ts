import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccountRows } from "@/lib/dashboard/data";
import { getServiceSupabase } from "@/lib/db/supabase";

export async function GET() {
  return NextResponse.json(await getAccountRows());
}

const relevanceRulesSchema = z
  .object({
    categoryWeights: z.record(z.string(), z.number()).optional(),
    keywordBoost: z.number().optional(),
    keywordBoosts: z.record(z.string(), z.number()).optional(),
    terms: z.array(z.object({ term: z.string().min(1), score: z.number().min(0).max(10) })).optional(),
    phraseBoosts: z.array(z.object({ phrase: z.string().min(1), boost: z.number() })).optional()
  })
  .strict()
  .default({});

const accountSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  keywords: z.array(z.string().min(1)).default([]),
  hashtags: z.array(z.string().regex(/^#/)).default([]),
  style: z.string().default("football fan"),
  characterLimit: z.number().int().min(80).max(2000).default(260),
  relevanceThreshold: z.number().int().min(0).max(10).default(7),
  relevanceRules: relevanceRulesSchema,
  maxPostsPerRun: z.number().int().min(1).max(10).default(3),
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
  gnewsApiKey: z.string().min(1),
  guardianApiKey: z.string().min(1),
  gnewsEnabled: z.boolean().default(true),
  guardianEnabled: z.boolean().default(true),
  apiFootballKey: z.string().min(1),
  teamId: z.number().int().nullable().optional(),
  leagueId: z.number().int().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  promptTemplate: z.string().min(20)
});

export async function POST(request: Request) {
  const parsed = accountSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const input = parsed.data;
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
      relevance_rules: input.relevanceRules,
      max_posts_per_run: input.maxPostsPerRun,
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
      gnews_api_key: input.gnewsApiKey,
      guardian_api_key: input.guardianApiKey,
      gnews_enabled: input.gnewsEnabled,
      guardian_enabled: input.guardianEnabled,
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
