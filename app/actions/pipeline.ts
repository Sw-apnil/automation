"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/lib/config/env";
import { runEvery15MinPipeline } from "@/lib/pipeline/engine";

export async function runPipelineAction() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;

  await runEvery15MinPipeline();
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sources");
  revalidatePath("/dashboard/queue");
  revalidatePath("/dashboard/published");
  revalidatePath("/dashboard/analytics");
}
