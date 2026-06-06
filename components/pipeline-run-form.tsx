"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Activity, LoaderCircle } from "lucide-react";
import { runPipelineAction, type PipelineActionState } from "@/app/actions/pipeline";
import { Button } from "@/components/ui/button";

const initialState: PipelineActionState = { status: "idle" };

export function PipelineRunForm() {
  const [state, action] = useActionState(runPipelineAction, initialState);

  return (
    <div className="space-y-2 sm:text-right">
      <form action={action}>
        <RunButton />
      </form>
      {state.status !== "idle" ? (
        <div
          className={`max-w-xl rounded-md border px-3 py-2 text-left text-xs ${
            state.status === "error" || state.result?.errors
              ? "border-destructive/40 bg-destructive/5 text-destructive"
              : "border-emerald-500/40 bg-emerald-500/5 text-emerald-700"
          }`}
          role="status"
        >
          <p className="font-medium">{state.message}</p>
          {state.result ? (
            <p className="mt-1">
              {state.result.accounts} accounts, {state.result.eventsCollected} events, {state.result.postsGenerated} generated,{" "}
              {state.result.postsPublished} published,{" "}
              {state.result.duplicatesRemoved} duplicates, {state.result.errors} errors
              {state.durationMs ? ` in ${(state.durationMs / 1000).toFixed(1)}s` : ""}.
            </p>
          ) : state.durationMs ? (
            <p className="mt-1">Stopped after {(state.durationMs / 1000).toFixed(1)}s.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function RunButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
      {pending ? "Pipeline running..." : "Run pipeline"}
    </Button>
  );
}
