"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Zap, LoaderCircle, CheckCircle2, XCircle } from "lucide-react";
import { runPipelineAction, type PipelineActionState } from "@/app/actions/pipeline";
import { Button } from "@/components/ui/button";

const initialState: PipelineActionState = { status: "idle" };

export function PipelineRunForm() {
  const [state, action] = useActionState(runPipelineAction, initialState);

  return (
    <div className="space-y-3 sm:text-right">
      <form action={action}>
        <RunButton />
      </form>
      {state.status !== "idle" ? (
        <div
          className={`max-w-xl rounded-xl border px-4 py-3 text-left text-xs backdrop-blur-sm transition-all ${
            state.status === "error" || state.result?.errors
              ? "border-destructive/30 bg-destructive/8 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
          }`}
          role="status"
        >
          <div className="flex items-start gap-2">
            {state.status === "error" || state.result?.errors ? (
              <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-emerald-400" />
            )}
            <div>
              <p className="font-semibold">{state.message}</p>
              {state.result ? (
                <p className="mt-1 text-[11px] opacity-80">
                  {state.result.accounts} accounts · {state.result.eventsCollected} events collected · {state.result.postsGenerated} generated · {state.result.postsPublished} published · {state.result.duplicatesRemoved} dupes removed · {state.result.errors} errors
                  {state.durationMs ? ` · ${(state.durationMs / 1000).toFixed(1)}s` : ""}
                </p>
              ) : state.durationMs ? (
                <p className="mt-1 text-[11px] opacity-80">Stopped after {(state.durationMs / 1000).toFixed(1)}s.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RunButton() {
  const { pending } = useFormStatus();

  return (
    <Button variant="glow" disabled={pending} aria-busy={pending} className="gap-2">
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4 fill-black" />
      )}
      {pending ? "Running Pipeline..." : "Run Pipeline"}
    </Button>
  );
}
