"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/lib/config/env";
import { runEvery15MinPipeline } from "@/lib/pipeline/engine";

export type PipelineActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  durationMs?: number;
  result?: Awaited<ReturnType<typeof runEvery15MinPipeline>>;
};

export async function runPipelineAction(previousState: PipelineActionState): Promise<PipelineActionState> {
  void previousState;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { status: "error", message: "Supabase server configuration is missing." };
  }

  const startedAt = Date.now();
  try {
    const result = await runEvery15MinPipeline({ force: true });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sources");
    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard/published");
    revalidatePath("/dashboard/analytics");
    return {
      status: "success",
      message: result.errors > 0 ? "Pipeline completed with errors. Check Analytics." : "Pipeline completed successfully.",
      durationMs: Date.now() - startedAt,
      result
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Pipeline failed unexpectedly.",
      durationMs: Date.now() - startedAt
    };
  }
}
