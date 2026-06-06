"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/lib/config/env";
import { getServiceSupabase } from "@/lib/db/supabase";

export async function updateAccountSettingsAction(formData: FormData) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const patch = {
    name: textValue(formData, "name"),
    slug: textValue(formData, "slug"),
    style: textValue(formData, "style"),
    keywords: listValue(formData, "keywords"),
    hashtags: listValue(formData, "hashtags"),
    character_limit: numberValue(formData, "characterLimit"),
    relevance_threshold: numberValue(formData, "relevanceThreshold"),
    relevance_rules: jsonObjectValue(formData, "relevanceRules"),
    max_posts_per_run: numberValue(formData, "maxPostsPerRun"),
    enabled: formData.get("enabled") === "on",
    groq_api_key: secretValue(formData, "groqApiKey", "clearGroqApiKey"),
    groq_model: nullableTextValue(formData, "groqModel"),
    groq_temperature: numberValue(formData, "groqTemperature"),
    groq_max_tokens: numberValue(formData, "groqMaxTokens"),
    buffer_access_token: secretValue(formData, "bufferAccessToken", "clearBufferAccessToken"),
    buffer_channel_ids: listValue(formData, "bufferChannelIds"),
    buffer_profiles: listValue(formData, "bufferChannelIds"),
    platforms: ["x"],
    schedule_interval_minutes: numberValue(formData, "scheduleIntervalMinutes"),
    schedule_time_slots: listValue(formData, "scheduleTimeSlots"),
    news_api_key: secretValue(formData, "newsApiKey", "clearNewsApiKey"),
    api_football_key: secretValue(formData, "apiFootballKey", "clearApiFootballKey"),
    team_id: nullableNumberValue(formData, "teamId"),
    league_id: nullableNumberValue(formData, "leagueId"),
    logo_url: nullableTextValue(formData, "logoUrl")
  };

  const cleanedPatch = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
  const supabase = getServiceSupabase();
  await supabase.from("accounts").update(cleanedPatch).eq("id", id);

  const promptTemplate = String(formData.get("promptTemplate") ?? "").trim();
  if (promptTemplate.length >= 20) {
    await supabase.from("account_prompts").update({ active: false }).eq("account_id", id).eq("active", true);
    await supabase.from("account_prompts").insert({
      account_id: id,
      name: `dashboard-${Date.now()}`,
      prompt_template: promptTemplate,
      active: true
    });
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
}

export async function createAccountAction(formData: FormData) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name: requiredTextValue(formData, "name"),
      slug: requiredTextValue(formData, "slug"),
      style: requiredTextValue(formData, "style"),
      keywords: listValue(formData, "keywords"),
      hashtags: listValue(formData, "hashtags"),
      character_limit: numberValue(formData, "characterLimit") ?? 260,
      relevance_threshold: numberValue(formData, "relevanceThreshold") ?? 7,
      relevance_rules: jsonObjectValue(formData, "relevanceRules") ?? {},
      max_posts_per_run: numberValue(formData, "maxPostsPerRun") ?? 3,
      enabled: formData.get("enabled") === "on",
      groq_api_key: requiredTextValue(formData, "groqApiKey"),
      groq_model: requiredTextValue(formData, "groqModel"),
      groq_temperature: numberValue(formData, "groqTemperature") ?? 0.85,
      groq_max_tokens: numberValue(formData, "groqMaxTokens") ?? 180,
      buffer_access_token: requiredTextValue(formData, "bufferAccessToken"),
      buffer_channel_ids: listValue(formData, "bufferChannelIds"),
      buffer_profiles: listValue(formData, "bufferChannelIds"),
      platforms: ["x"],
      schedule_interval_minutes: numberValue(formData, "scheduleIntervalMinutes") ?? 15,
      schedule_time_slots: listValue(formData, "scheduleTimeSlots"),
      news_api_key: requiredTextValue(formData, "newsApiKey"),
      api_football_key: requiredTextValue(formData, "apiFootballKey"),
      team_id: nullableNumberValue(formData, "teamId"),
      league_id: nullableNumberValue(formData, "leagueId"),
      logo_url: nullableTextValue(formData, "logoUrl")
    })
    .select("id")
    .single();

  if (error || !data) return;

  await supabase.from("account_prompts").insert({
    account_id: data.id,
    name: "default",
    prompt_template: requiredTextValue(formData, "promptTemplate"),
    active: true
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
}

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

function requiredTextValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullableTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function numberValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? Number(value) : undefined;
}

function nullableNumberValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? Number(value) : null;
}

function listValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function jsonObjectValue(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${key} must be valid JSON.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${key} must be a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

function secretValue(formData: FormData, key: string, clearKey: string) {
  if (formData.get(clearKey) === "on") return null;
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}
