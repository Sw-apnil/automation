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
  maxPostsPerRun: z.number().int().min(1).max(10).default(3),
  enabled: z.boolean().default(true),
  bufferProfiles: z.array(z.string()).default([]),
  platforms: z.array(z.enum(["x", "threads"])).default(["x"]),
  teamId: z.number().int().nullable().optional(),
  leagueId: z.number().int().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  promptTemplate: z.string().optional()
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
      max_posts_per_run: input.maxPostsPerRun,
      enabled: input.enabled,
      buffer_profiles: input.bufferProfiles,
      platforms: input.platforms,
      team_id: input.teamId ?? null,
      league_id: input.leagueId ?? null,
      logo_url: input.logoUrl ?? null
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (input.promptTemplate) {
    await supabase.from("account_prompts").insert({
      account_id: data.id,
      name: "default",
      prompt_template: input.promptTemplate
    });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
