import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";

export async function GET() {
  return NextResponse.json({
    ok: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    integrations: {
      supabase: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
      cronSecret: Boolean(env.CRON_SECRET)
    }
  });
}
