import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { runEvery15MinPipeline } from "@/lib/pipeline/engine";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (env.CRON_SECRET) {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (token !== env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runEvery15MinPipeline();
  return NextResponse.json(result);
}

export const POST = GET;
