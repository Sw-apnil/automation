import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";

export async function GET() {
  return NextResponse.json({
    ok: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    integrations: {
      supabase: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
      groq: Boolean(env.GROQ_API_KEY),
      buffer: Boolean(env.BUFFER_ACCESS_TOKEN),
      apiFootball: Boolean(env.API_FOOTBALL_KEY),
      newsApi: Boolean(env.NEWS_API_KEY),
      cronSecret: Boolean(env.CRON_SECRET)
    }
  });
}
